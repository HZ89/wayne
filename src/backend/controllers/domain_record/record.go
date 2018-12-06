package domain_record

import (
	"encoding/json"
	"strconv"

	"github.com/Qihoo360/wayne/src/backend/controllers/base"
	"github.com/Qihoo360/wayne/src/backend/models"
	"github.com/Qihoo360/wayne/src/backend/resources/domain"
	_ "github.com/Qihoo360/wayne/src/backend/resources/domain/provider/alicloud"
	"github.com/Qihoo360/wayne/src/backend/util/logs"
)

type DomainRecordController struct {
	base.APIController
}

func (c *DomainRecordController) URLMapping() {
	c.Mapping("List", c.List)
	c.Mapping("Create", c.Create)
	c.Mapping("Get", c.Get)
	c.Mapping("Update", c.Update)
	c.Mapping("Delete", c.Delete)
}

func (c *DomainRecordController) Prepare() {
	// Check administration
	c.APIController.Prepare()
}

// @Title GetAllRecordInDomain
// @Description get all records in a domain
// @Param	name		query 	string	false		"domain name"
// @Success 200 {object} []resources.dns.Record success
// @router / [get]
func (c *DomainRecordController) List() {
	domainId := c.GetIntParamFromURL(":domainid")

	p, d, err := newDomainProvider(domainId)
	if err != nil {
		logs.Error("new domain(id: %d) provider error: %s", domainId, err.Error())
		c.HandleError(err)
		return
	}

	records, err := p.ListDomainRecord(d.Name)
	if err != nil {
		logs.Error("list domain %s records error: %s", d.Name, err.Error())
		c.HandleError(err)
		return
	}
	c.Success(records)
}

// @Title Create
// @Description create domain record
// @Param	body		body 	resources.dns.Record 	true		"The record content"
// @Success 200 return models.ingressTemplate success
// @router / [post]
func (c *DomainRecordController) Create() {
	domainId := c.GetIntParamFromURL(":domainid")
	var r domain.Record
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &r)
	if err != nil {
		logs.Error("get body error %v", err)
		c.AbortBadRequest("craete domain record failed. json decode failed")
	}
	p, _, err := newDomainProvider(domainId)
	if err != nil {
		logs.Error("create provider for domain %s failed: %s", r.DomainName, err.Error())
		c.AbortBadRequest("new domain provider failed")
	}
	id, err := p.AddDomainRecord(&r)
	if err != nil {
		logs.Error("create domain %s record %s failed: %s", r.DomainName, r.RR, err)
		c.AbortBadRequest("craete domain record failed")
	}
	r.Id = id
	c.Success(r)
}

// @Title Get
// @Description find Object by id
// @Param	id		path 	int	true		"the id you want to get"
// @Success 200 {object} resources.dns.record success
// @router /:id([0-9]+) [get]
func (c *DomainRecordController) Get() {
	rId := c.GetIDFromURL()
	dId := c.GetIntParamFromURL(":domainid")
	p, d, err := newDomainProvider(dId)
	if err != nil {
		logs.Error("new domain(id: %d) provider failed: %s", dId, err.Error())
		c.HandleError(err)
		return
	}
	r, err := p.DescribeDomainRecordInfo(strconv.Itoa(int(rId)))
	if err != nil {
		logs.Error("get domain(%s) provider(%s) record failed: %s", d.Name, d.Provider, err.Error())
		c.HandleError(err)
		return
	}
	c.Success(r)
}

// @Title Update
// @Description update the domain record
// @Param	id		path 	int	true		"The id you want to update"
// @Param	body		body 	resources.dns.record	true		"The body"
// @Success 200 resources.dns.record success
// @router /:id([0-9]+) [put]
func (c *DomainRecordController) Update() {
	domainId := c.GetIntParamFromURL(":domainid")
	r := new(domain.Record)
	err := json.Unmarshal(c.Ctx.Input.RequestBody, r)
	if err != nil {
		logs.Error("Invalid param body.%v", err)
		c.AbortBadRequestFormat("DomainRecord")
	}
	p, d, err := newDomainProvider(domainId)
	if err != nil {
		logs.Error("new domain(id: %d) provider failed: %s", domainId, err.Error())
		c.HandleError(err)
		return
	}
	if _, err := p.ModifyDomainRecord(r); err != nil {
		logs.Error("update domain(%s) provider(%s) record(%s) failed:%s", d.Name, d.Provider, r.Id, err.Error())
		c.AbortInternalServerError("update domain record failed")
	}
	c.Success(r)
}

// @Title Delete
// @Description delete the domain record
// @Param	id		path 	int	true		"The id you want to delete"
// @Success 200 {string} delete success!
// @router /:id([0-9]+) [delete]
func (c *DomainRecordController) Delete() {
	rId := c.GetIDFromURL()
	dId := c.GetIntParamFromURL(":domainid")

	p, d, err := newDomainProvider(dId)
	if err != nil {
		logs.Error("new domain(id: %d) provider failed: %s", dId, err.Error())
		c.HandleError(err)
		return
	}
	if _, err := p.DeleteDomainRecord(strconv.Itoa(int(rId))); err != nil {
		logs.Error("delete domain(%s) provider(%s) record(%s) failed:%s", d.Name, d.Provider, rId, err.Error())
		c.AbortInternalServerError("delete domain record failed")
	}
	c.Success(nil)
}

func newDomainProvider(id int64) (p domain.Provider, d *models.Domain, err error) {
	d, err = models.DomainModel.GetById(id)
	if err != nil {
		return
	}
	p, err = domain.NewProvider(d.Provider, d.AccessKeyId, d.AccessKey)
	if err != nil {
		return
	}
	return
}
