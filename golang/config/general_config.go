package config

import (
	"math/big"
	"os"
	"reflect"
	"sync"
	"time"

	"github.com/pkg/errors"
	uuid "github.com/satori/go.uuid"
	"github.com/spf13/viper"
	"go.uber.org/zap/zapcore"

	"github.com/pickleyd/chainlink/core/assets"
	"github.com/pickleyd/chainlink/core/config/envvar"
	"github.com/pickleyd/chainlink/core/logger"
	"github.com/pickleyd/chainlink/core/store/dialects"
	"github.com/pickleyd/chainlink/core/store/models"
	"github.com/pickleyd/chainlink/core/utils"
)

//go:generate mockery --name GeneralConfig --output ./mocks/ --case=underscore

//nolint
var (
	ErrUnset   = errors.New("env var unset")
	ErrInvalid = errors.New("env var invalid")

	configFileNotFoundError = reflect.TypeOf(viper.ConfigFileNotFoundError{})
)

type GeneralOnlyConfig interface {
	// Validate() error
	// SetLogLevel(lvl zapcore.Level) error
	// SetLogSQL(logSQL bool)

	DefaultHTTPLimit() int64
	DefaultHTTPTimeout() models.Duration
}

// GlobalConfig holds global ENV overrides for EVM chains
// If set the global ENV will override everything
// The second bool indicates if it is set or not
type GlobalConfig interface {
	GlobalBalanceMonitorEnabled() (bool, bool)
	GlobalBlockEmissionIdleWarningThreshold() (time.Duration, bool)
	GlobalBlockHistoryEstimatorBatchSize() (uint32, bool)
	GlobalBlockHistoryEstimatorBlockDelay() (uint16, bool)
	GlobalBlockHistoryEstimatorBlockHistorySize() (uint16, bool)
	GlobalBlockHistoryEstimatorEIP1559FeeCapBufferBlocks() (uint16, bool)
	GlobalBlockHistoryEstimatorTransactionPercentile() (uint16, bool)
	GlobalChainType() (string, bool)
	GlobalEthTxReaperInterval() (time.Duration, bool)
	GlobalEthTxReaperThreshold() (time.Duration, bool)
	GlobalEthTxResendAfterThreshold() (time.Duration, bool)
	GlobalEvmEIP1559DynamicFees() (bool, bool)
	GlobalEvmFinalityDepth() (uint32, bool)
	GlobalEvmGasBumpPercent() (uint16, bool)
	GlobalEvmGasBumpThreshold() (uint64, bool)
	GlobalEvmGasBumpTxDepth() (uint16, bool)
	GlobalEvmGasBumpWei() (*big.Int, bool)
	GlobalEvmGasFeeCapDefault() (*big.Int, bool)
	GlobalEvmGasLimitDefault() (uint64, bool)
	GlobalEvmGasLimitMultiplier() (float32, bool)
	GlobalEvmGasLimitTransfer() (uint64, bool)
	GlobalEvmGasLimitOCRJobType() (uint64, bool)
	GlobalEvmGasLimitDRJobType() (uint64, bool)
	GlobalEvmGasLimitVRFJobType() (uint64, bool)
	GlobalEvmGasLimitFMJobType() (uint64, bool)
	GlobalEvmGasLimitKeeperJobType() (uint64, bool)
	GlobalEvmGasPriceDefault() (*big.Int, bool)
	GlobalEvmGasTipCapDefault() (*big.Int, bool)
	GlobalEvmGasTipCapMinimum() (*big.Int, bool)
	GlobalEvmHeadTrackerHistoryDepth() (uint32, bool)
	GlobalEvmHeadTrackerMaxBufferSize() (uint32, bool)
	GlobalEvmHeadTrackerSamplingInterval() (time.Duration, bool)
	GlobalEvmLogBackfillBatchSize() (uint32, bool)
	GlobalEvmLogPollInterval() (time.Duration, bool)
	GlobalEvmMaxGasPriceWei() (*big.Int, bool)
	GlobalEvmMaxInFlightTransactions() (uint32, bool)
	GlobalEvmMaxQueuedTransactions() (uint64, bool)
	GlobalEvmMinGasPriceWei() (*big.Int, bool)
	GlobalEvmNonceAutoSync() (bool, bool)
	GlobalEvmUseForwarders() (bool, bool)
	GlobalEvmRPCDefaultBatchSize() (uint32, bool)
	GlobalFlagsContractAddress() (string, bool)
	GlobalGasEstimatorMode() (string, bool)
	GlobalLinkContractAddress() (string, bool)
	GlobalOperatorFactoryAddress() (string, bool)
	GlobalMinIncomingConfirmations() (uint32, bool)
	GlobalMinimumContractPayment() (*assets.Link, bool)
	GlobalNodeNoNewHeadsThreshold() (time.Duration, bool)
	GlobalNodePollFailureThreshold() (uint32, bool)
	GlobalNodePollInterval() (time.Duration, bool)

	// OCR1Config
	// OCR2Config
	// P2PNetworking
	// P2PV1Networking
	// P2PV2Networking
}

type GeneralConfig interface {
	GeneralOnlyConfig
	// GlobalConfig
}

// generalConfig holds parameters used by the application which can be overridden by
// setting environment variables.
//
// If you add an entry here which does not contain sensitive information, you
// should also update presenters.ConfigWhitelist and cmd_test.TestClient_RunNodeShowsEnv.
type generalConfig struct {
	lggr             logger.Logger
	viper            *viper.Viper
	randomP2PPort    uint16
	randomP2PPortMtx sync.RWMutex
	dialect          dialects.DialectName
	advisoryLockID   int64
	logLevel         zapcore.Level
	defaultLogLevel  zapcore.Level
	logSQL           bool
	logMutex         sync.RWMutex
	genAppID         sync.Once
	appID            uuid.UUID
}

// NewGeneralConfig returns the config with the environment variables set to their
// respective fields, or their defaults if environment variables are not set.
func NewGeneralConfig(lggr logger.Logger) GeneralConfig {
	v := viper.New()
	c := newGeneralConfigWithViper(v, lggr.Named("GeneralConfig"))
	c.dialect = dialects.Postgres
	return c
}

func newGeneralConfigWithViper(v *viper.Viper, lggr logger.Logger) (config *generalConfig) {
	schemaT := reflect.TypeOf(envvar.ConfigSchema{})
	for index := 0; index < schemaT.NumField(); index++ {
		item := schemaT.FieldByIndex([]int{index})
		name := item.Tag.Get("env")
		def, exists := item.Tag.Lookup("default")
		if exists {
			v.SetDefault(name, def)
		}
		_ = v.BindEnv(name, name)
	}

	config = &generalConfig{
		lggr:  lggr,
		viper: v,
	}

	if err := utils.EnsureDirAndMaxPerms(config.RootDir(), os.FileMode(0700)); err != nil {
		lggr.Fatalf(`Error creating root directory "%s": %+v`, config.RootDir(), err)
	}

	v.SetConfigName("chainlink")
	v.AddConfigPath(config.RootDir())
	err := v.ReadInConfig()
	if err != nil && reflect.TypeOf(err) != configFileNotFoundError {
		lggr.Warnf("Unable to load config file: %v\n", err)
	}

	ll, invalid := envvar.LogLevel.Parse()
	if invalid != "" {
		lggr.Error(invalid)
	}
	config.defaultLogLevel = ll

	config.logLevel = config.defaultLogLevel
	config.logSQL = viper.GetBool(envvar.Name("LogSQL"))

	return
}

// RootDir represents the location on the file system where Chainlink should
// keep its files.
func (c *generalConfig) RootDir() string {
	return getEnvWithFallback(c, envvar.RootDir)
}

func getEnvWithFallback[T any](c *generalConfig, e *envvar.EnvVar[T]) T {
	v, invalid, err := e.ParseFrom(c.viper.GetString)
	if err != nil {
		c.lggr.Panic(err)
	}
	if invalid != "" {
		c.lggr.Error(invalid)
	}
	return v
}

// DefaultHTTPLimit defines the size limit for HTTP requests and responses
func (c *generalConfig) DefaultHTTPLimit() int64 {
	return c.viper.GetInt64(envvar.Name("DefaultHTTPLimit"))
}

// DefaultHTTPTimeout defines the default timeout for http requests
func (c *generalConfig) DefaultHTTPTimeout() models.Duration {
	return models.MustMakeDuration(getEnvWithFallback(c, envvar.NewDuration("DefaultHTTPTimeout")))
}
