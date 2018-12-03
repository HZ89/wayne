package alicloud

import (
	"fmt"
	"strconv"

	"github.com/Qihoo360/wayne/src/backend/resources/dns"
	"github.com/Qihoo360/wayne/src/backend/util/logs"
	aliSDKType "github.com/aliyun/alibaba-cloud-sdk-go/sdk/requests"
	"github.com/aliyun/alibaba-cloud-sdk-go/services/alidns"
)

const (
	pageSize     = 500
	startPageNum = 1
)

func init() {
	dns.Register("aliCloud", newAliDNS)
}

type aliCloud struct {
	client *alidns.Client
}

func newAliDNS(akID, akS string) (provider dns.Provider, err error) {
	client, err := alidns.NewClientWithAccessKey("", akID, akS)
	if err != nil {
		return nil, err
	}
	return &aliCloud{client: client}, nil
}

func (c *aliCloud) AddDomainRecord(r *dns.Record) (string, error) {
	req := alidns.AddDomainRecordRequest{
		DomainName: r.DomainName,
		RR:         r.RR,
		Type:       r.Type,
		Value:      r.Value,
		TTL:        aliSDKType.Integer(strconv.Itoa(r.TTL)),
	}
	res, err := c.client.AddDomainRecord(&req)
	if err != nil {
		logs.Debug("ali dns api failed request id: %s", res.RequestId)
		return "", err
	}
	return res.RecordId, nil
}

func (c *aliCloud) IsDomainAvailable(name string) (ok bool, err error) {
	req := alidns.DescribeDomainInfoRequest{
		DomainName: name,
	}
	res, err := c.client.DescribeDomainInfo(&req)
	if err != nil {
		logs.Debug("ali dns api failed request id: %s", res.RequestId)
		return false, err
	}
	return true, nil
}

func (c *aliCloud) ModifyDomainRecord(r *dns.Record) (string, error) {
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
	req := alidns.UpdateDomainRecordRequest{
		RecordId: r.Id,
		Value:    r.Value,
		TTL:      aliSDKType.Integer(strconv.Itoa(r.TTL)),
		Type:     r.Type,
		RR:       r.RR,
	}
	res, err := c.client.UpdateDomainRecord(&req)
	if err != nil {
		logs.Debug("ali dns api failed request id: %s", res.RequestId)
		return "", err
	}
	if oldRecord.Enabled != r.Enabled {
		req := alidns.SetDomainRecordStatusRequest{
			RecordId: r.Id,
			Status:   "Enable",
		}
		if !r.Enabled {
			req.Status = "Disable"
		}
		res, err := c.client.SetDomainRecordStatus(&req)
		if err != nil {
			logs.Debug("ali dns api failed request id: %s", res.RequestId)
			return "", err
		}
	}
	return r.Id, err
}

func (c *aliCloud) ListDomainRecord(name string) (rs []*dns.Record, err error) {
	req := alidns.DescribeDomainRecordsRequest{
		DomainName: name,
	}
	req.PageSize = aliSDKType.Integer(strconv.Itoa(pageSize))
	currentPage := startPageNum
	for {
		req.PageNumber = aliSDKType.Integer(strconv.Itoa(currentPage))
		res, err := c.client.DescribeDomainRecords(&req)
		if err != nil {
			logs.Debug("ali dns api failed request id: %s", res.RequestId)
			return nil, err
		}
		for _, resRecord := range res.DomainRecords.Record {
			r := &dns.Record{
				Id:         resRecord.RecordId,
				RR:         resRecord.RR,
				Type:       resRecord.Type,
				DomainName: resRecord.DomainName,
				Value:      resRecord.Value,
				TTL:        resRecord.TTL,
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

func (c *aliCloud) DescribeDomainRecordInfo(id string) (r *dns.Record, err error) {
	req := alidns.DescribeDomainRecordInfoRequest{
		RecordId: id,
	}
	res, err := c.client.DescribeDomainRecordInfo(&req)
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
	r.TTL = res.TTL
	return
}

func (c *aliCloud) DeleteDomainRecord(id string) (string, error) {
	req := alidns.DeleteDomainRecordRequest{
		RecordId: id,
	}
	res, err := c.client.DeleteDomainRecord(&req)
	if err != nil {
		logs.Debug("ali dns api failed request id: %s", res.RequestId)
		return "", err
	}
	return res.RecordId, nil
}
