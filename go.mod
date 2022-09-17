module github.com/pickleyd/jobspecviz

go 1.18

require (
	github.com/ethereum/go-ethereum v1.10.20
	github.com/golang/gddo v0.0.0-20210115222349-20d68f94ee1f
	github.com/jpillora/backoff v1.0.0
	github.com/libp2p/go-libp2p-core v0.8.5
	github.com/mitchellh/go-homedir v1.1.0
	github.com/pkg/errors v0.9.1
	github.com/robfig/cron/v3 v3.0.1
	github.com/satori/go.uuid v1.2.0
	github.com/shirou/gopsutil/v3 v3.22.2
	github.com/shopspring/decimal v1.3.1
	github.com/spf13/viper v1.12.0
	github.com/tidwall/gjson v1.14.1
	go.uber.org/atomic v1.9.0
	go.uber.org/multierr v1.8.0
	go.uber.org/zap v1.21.0
	golang.org/x/crypto v0.0.0-20220622213112-05595931fe9d
	golang.org/x/exp v0.0.0-20220608143224-64259d1afd70
	golang.org/x/text v0.3.7
	gopkg.in/guregu/null.v4 v4.0.0
)

require (
	github.com/VictoriaMetrics/fastcache v1.10.0 // indirect
	github.com/btcsuite/btcd v0.23.1 // indirect
	github.com/btcsuite/btcd/btcec/v2 v2.2.0 // indirect
	github.com/deckarep/golang-set v1.8.0 // indirect
	github.com/decred/dcrd/dcrec/secp256k1/v4 v4.0.1 // indirect
	github.com/fsnotify/fsnotify v1.5.4 // indirect
	github.com/go-ole/go-ole v1.2.6 // indirect
	github.com/go-stack/stack v1.8.1 // indirect
	github.com/gogo/protobuf v1.3.3 // indirect
	github.com/google/uuid v1.3.0 // indirect
	github.com/hashicorp/hcl v1.0.0 // indirect
	github.com/ipfs/go-cid v0.0.7 // indirect
	github.com/libp2p/go-buffer-pool v0.0.2 // indirect
	github.com/libp2p/go-openssl v0.0.7 // indirect
	github.com/magiconair/properties v1.8.6 // indirect
	github.com/mattn/go-runewidth v0.0.13 // indirect
	github.com/minio/blake2b-simd v0.0.0-20160723061019-3f5f724cb5b1 // indirect
	github.com/minio/sha256-simd v0.1.1 // indirect
	github.com/mitchellh/mapstructure v1.5.0 // indirect
	github.com/mr-tron/base58 v1.2.0 // indirect
	github.com/multiformats/go-base32 v0.0.3 // indirect
	github.com/multiformats/go-base36 v0.1.0 // indirect
	github.com/multiformats/go-multiaddr v0.3.3 // indirect
	github.com/multiformats/go-multibase v0.0.3 // indirect
	github.com/multiformats/go-multihash v0.0.14 // indirect
	github.com/multiformats/go-varint v0.0.6 // indirect
	github.com/pelletier/go-toml v1.9.5 // indirect
	github.com/pelletier/go-toml/v2 v2.0.2 // indirect
	github.com/power-devops/perfstat v0.0.0-20210106213030-5aafc221ea8c // indirect
	github.com/prometheus/tsdb v0.10.0 // indirect
	github.com/rjeczalik/notify v0.9.2 // indirect
	github.com/rogpeppe/go-internal v1.8.0 // indirect
	github.com/shirou/gopsutil v3.21.11+incompatible // indirect
	github.com/spacemonkeygo/spacelog v0.0.0-20180420211403-2296661a0572 // indirect
	github.com/spaolacci/murmur3 v1.1.0 // indirect
	github.com/spf13/afero v1.8.2 // indirect
	github.com/spf13/cast v1.5.0 // indirect
	github.com/spf13/jwalterweatherman v1.1.0 // indirect
	github.com/spf13/pflag v1.0.5 // indirect
	github.com/stretchr/testify v1.8.0 // indirect
	github.com/subosito/gotenv v1.3.0 // indirect
	github.com/tidwall/match v1.1.1 // indirect
	github.com/tidwall/pretty v1.2.0 // indirect
	github.com/yusufpapurcu/wmi v1.2.2 // indirect
	go.uber.org/goleak v1.1.12 // indirect
	golang.org/x/sys v0.0.0-20220627191245-f75cf1eec38b // indirect
	gopkg.in/check.v1 v1.0.0-20201130134442-10cb98267c6c // indirect
	gopkg.in/ini.v1 v1.66.4 // indirect
	gopkg.in/yaml.v2 v2.4.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)

// To fix CVE: c16fb56d-9de6-4065-9fca-d2b4cfb13020
// See https://github.com/dgrijalva/jwt-go/issues/463
// If that happens to get released in a 3.X.X version, we can add a constraint to our go.mod
// for it. If its in 4.X.X, then we need all our transitive deps to upgrade to it.
replace github.com/dgrijalva/jwt-go => github.com/form3tech-oss/jwt-go v3.2.1+incompatible

// replicating the replace directive on cosmos SDK
replace github.com/gogo/protobuf => github.com/regen-network/protobuf v1.3.3-alpha.regen.1

// needed to address mismatch between cosmosSDK and hdevalence/ed25519consensus
replace filippo.io/edwards25519 => filippo.io/edwards25519 v1.0.0-beta.3

// fixes deprecation warnings and keychain undefined bugs on macOS
// See https://github.com/99designs/keyring/issues/94
replace github.com/keybase/go-keychain => github.com/99designs/go-keychain v0.0.0-20191008050251-8e49817e8af4

// Fix go mod tidy issue for ambiguous imports from go-ethereum
// See https://github.com/ugorji/go/issues/279
replace github.com/btcsuite/btcd => github.com/btcsuite/btcd v0.22.1
