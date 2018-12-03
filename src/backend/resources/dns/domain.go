package dns

import (
	"fmt"
	"sync"

	_ "github.com/Qihoo360/wayne/src/backend/resources/dns/provider/alicloud"
)

var (
	pnfMu             sync.RWMutex
	providersNewFuncs = make(map[string]func(string, string) (Provider, error))
)

type Provider interface {
	AddDomainRecord(*Record) (string, error)
	ModifyDomainRecord(*Record) (string, error)
	ListDomainRecord(string) ([]*Record, error)
	DescribeDomainRecordInfo(string) (*Record, error)
	DeleteDomainRecord(string) (string, error)
	IsDomainAvailable(string) (bool, error)
}

type Record struct {
	Id         string `json:"id"`
	Type       string `json:"type"`
	DomainName string `json:"domainName"`
	Value      string `json:"value"`
	RR         string `json:"rr"`
	TTL        int    `json:"ttl"`
	Enabled    bool   `json:"enabled"`
}

func NewProvider(name, ak, aks string) (Provider, error) {
	pnfMu.RLock()
	defer pnfMu.RUnlock()
	f, ok := providersNewFuncs[name]
	if !ok {
		return nil, fmt.Errorf("provider %s not support yet", name)
	}
	return f(ak, aks)
}

func Register(name string, f func(string, string) (Provider, error)) {
	pnfMu.Lock()
	defer pnfMu.Unlock()
	if f == nil {
		panic("domain provider: register provider func is null")
	}
	if _, dup := providersNewFuncs[name]; dup {
		panic("domain provider: register called twice for provider " + name)
	}
	providersNewFuncs[name] = f
}
