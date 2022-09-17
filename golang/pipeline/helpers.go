package pipeline

import (
	"net/http"

	uuid "github.com/satori/go.uuid"

	"github.com/pickleyd/chainlink/core/chains/evm"

	"github.com/smartcontractkit/sqlx"
)

func (t *BridgeTask) HelperSetDependencies(config Config, db *sqlx.DB, id uuid.UUID, httpClient *http.Client) {
	t.config = config
	t.queryer = db
	t.uuid = id
	t.httpClient = httpClient
}

func (t *HTTPTask) HelperSetDependencies(config Config, restrictedHTTPClient, unrestrictedHTTPClient *http.Client) {
	t.config = config
	t.httpClient = restrictedHTTPClient
	t.unrestrictedHTTPClient = unrestrictedHTTPClient
}

func (t *ETHCallTask) HelperSetDependencies(cc evm.ChainSet, config Config, specGasLimit *uint32, jobType string) {
	t.chainSet = cc
	t.config = config
	t.specGasLimit = specGasLimit
	t.jobType = jobType
}

func (t *ETHTxTask) HelperSetDependencies(cc evm.ChainSet, keyStore ETHKeyStore, specGasLimit *uint32, jobType string) {
	t.chainSet = cc
	t.keyStore = keyStore
	t.specGasLimit = specGasLimit
	t.jobType = jobType
}
