package alicloud

import (
	"fmt"

	"github.com/Qihoo360/wayne/src/backend/resources/domain"
	"github.com/Qihoo360/wayne/src/backend/util/logs"
	"github.com/denverdino/aliyungo/dns"
)

const (
	pageSize     = 500
	startPageNum = 1
)

func init() {
	domain.Register("aliCloud", newAliDNS)
}

type aliCloud struct {
	client *dns.Client
}

func newAliDNS(akID, akS string) (provider domain.Provider, err error) {
	client := dns.NewClientNew(akID, akS)
	return &aliCloud{client: client}, nil
}

func (c *aliCloud) AddDomainRecord(r *domain.Record) (string, error) {
	req := dns.AddDomainRecordArgs{
		DomainName: r.DomainName,
		RR:         r.RR,
		TTL:        int32(r.TTL),
		Value:      r.Value,
		Type:       r.Type,
	}
	res, err := c.client.AddDomainRecord(&req)
	if err != nil {
		logs.Debug("ali dns api failed request id: %s", res.RequestId)
		return "", err
	}
	return res.RecordId, nil
}

func (c *aliCloud) IsDomainAvailable(name string) (ok bool, err error) {
	req := &dns.DescribeDomainInfoArgs{
		DomainName: name,
	}
	_, err = c.client.DescribeDomainInfo(req)
	if err != nil {
		return false, err
	}
	return true, nil
}

func (c *aliCloud) ModifyDomainRecord(r *domain.Record) (string, error) {
	if r.Id == "" {
		return "", fmt.Errorf("ali dns modify domain record need a record.id")
	}
	oldRecord, err := c.DescribeDomainRecordInfo(r.Id)
	if err != nil {
		return "", err
	}
	if oldRecord.DomainName != r.DomainName {
		return "", fmt.Errorf("record domainName can not modify")
	}
	req := dns.UpdateDomainRecordArgs{
		RecordId: oldRecord.Id,
		RR:       r.RR,
		Value:    r.Value,
		TTL:      int32(r.TTL),
		Type:     r.Type,
	}
	res, err := c.client.UpdateDomainRecord(&req)
	if err != nil {
		logs.Debug("ali dns api failed request id: %s", res.RequestId)
		return "", err
	}
	//if oldRecord.Enabled != r.Enabled {
	//	req := alidns.SetDomainRecordStatusRequest{
	//		RecordId: r.Id,
	//		Status:   "Enable",
	//	}
	//	if !r.Enabled {
	//		req.Status = "Disable"
	//	}
	//	res, err := c.client.(&req)
	//	if err != nil {
	//		logs.Debug("ali dns api failed request id: %s", res.RequestId)
	//		return "", err
	//	}
	//}
	return r.Id, err
}

func (c *aliCloud) ListDomainRecord(name string) (rs []*domain.Record, err error) {
	req := dns.DescribeDomainRecordsArgs{
		DomainName: name,
	}
	req.PageSize = pageSize
	currentPage := startPageNum
	for {
		req.PageNumber = currentPage
		res, err := c.client.DescribeDomainRecords(&req)
		if err != nil {
			logs.Debug("ali dns api failed request id: %s", res.RequestId)
			return nil, err
		}
		for _, resRecord := range res.DomainRecords.Record {
			r := &domain.Record{
				Id:         resRecord.RecordId,
				RR:         resRecord.RR,
				Type:       resRecord.Type,
				DomainName: resRecord.DomainName,
				Value:      resRecord.Value,
				TTL:        int(resRecord.TTL),
			}
			r.Enabled = true
			if resRecord.Status == "Disable" {
				r.Enabled = false
			}
			rs = append(rs, r)
		}
		if currentPage*pageSize > res.TotalCount {
			break
		}
		currentPage += 1
	}
	return
}

func (c *aliCloud) DescribeDomainRecordInfo(id string) (r *domain.Record, err error) {
	req := dns.DescribeDomainRecordInfoNewArgs{
		RecordId: id,
	}
	res, err := c.client.DescribeDomainRecordInfoNew(&req)
	if err != nil {
		logs.Debug("ali dns api failed request id: %s", res.RequestId)
		return nil, err
	}
	r.Id = res.RecordId
	r.DomainName = res.DomainName
	r.Value = res.Value
	r.Type = res.Type
	r.Enabled = true
	if res.Status == "Disable" {
		r.Enabled = false
	}
	r.TTL = int(res.TTL)
	return
}

func (c *aliCloud) DeleteDomainRecord(id string) (string, error) {
	req := dns.DeleteDomainRecordArgs{
		RecordId: id,
	}
	res, err := c.client.DeleteDomainRecord(&req)
	if err != nil {
		logs.Debug("ali dns api failed request id: %s", res.RequestId)
		return "", err
	}
	return res.RecordId, nil
}
