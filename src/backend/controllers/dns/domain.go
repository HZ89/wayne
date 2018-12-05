package dns

import (
	"encoding/json"

	"github.com/Qihoo360/wayne/src/backend/controllers/base"
	"github.com/Qihoo360/wayne/src/backend/models"
	_ "github.com/Qihoo360/wayne/src/backend/resources/dns/provider/alicloud"
	"github.com/Qihoo360/wayne/src/backend/util/logs"
)

type DomainController struct {
	base.APIController
}

func (c *DomainController) URLMapping() {
	c.Mapping("GetNames", c.GetNames)
	c.Mapping("List", c.List)
	c.Mapping("Create", c.Create)
	c.Mapping("Get", c.Get)
	c.Mapping("Update", c.Update)
	c.Mapping("Delete", c.Delete)
}

func (c *DomainController) Prepare() {
	// Check administration
	c.APIController.Prepare()
	// Check permission
	perAction := ""
	_, method := c.GetControllerAndAction()
	switch method {
	case "Get", "List":
		perAction = models.PermissionRead
	case "Create":
		perAction = models.PermissionCreate
	case "Update":
		perAction = models.PermissionUpdate
	case "Delete":
		perAction = models.PermissionDelete
	}
	if perAction != "" {
		c.CheckPermission(models.PermissionTypeDomain, perAction)
	}
}

func (c *DomainController) GetNames() {
	filters := make(map[string]interface{})
	deleted := c.GetDeleteFromQuery()

	filters["Deleted"] = deleted

	domains, err := models.DomainModel.GetNames(filters)
	if err != nil {
		logs.Error("get names error. %v, delete-status %v", err, deleted)
		c.HandleError(err)
		return
	}

	c.Success(domains)
}

func (c *DomainController) List() {
	param := c.BuildQueryParam()
	name := c.Input().Get("name")
	if name != "" {
		param.Query["name__contains"] = name
	}

	domains := []models.Domain{}
	if !c.User.Admin {
		c.AbortForbidden("have no permission")
	}

	total, err := models.GetTotal(new(models.Domain), param)
	if err != nil {
		logs.Error("get total count by param (%s) error. %v", param, err)
		c.HandleError(err)
		return
	}

	err = models.GetAll(new(models.Domain), &domains, param)
	if err != nil {
		logs.Error("list by param (%s) error. %v", param, err)
		c.HandleError(err)
		return
	}

	c.Success(param.NewPage(total, domains))
}

func (c *DomainController) Create() {
	var domain models.Domain
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &domain)
	if err != nil {
		logs.Error("get body error. %v", err)
		c.AbortBadRequestFormat("Service")
	}

	domain.User = c.User.Name
	_, err = models.DomainModel.Add(&domain)

	if err != nil {
		logs.Error("create error.%v", err.Error())
		c.HandleError(err)
		return
	}
	c.Success(domain)
}

func (c *DomainController) Get() {
	id := c.GetIDFromURL()

	domain, err := models.DomainModel.GetById(int64(id))
	if err != nil {
		logs.Error("get by id (%d) error.%v", id, err)
		c.HandleError(err)
		return
	}

	c.Success(domain)
	return
}

func (c *DomainController) Update() {
	id := c.GetIDFromURL()
	var domain models.Domain
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &domain)
	if err != nil {
		logs.Error("Invalid param body.%v", err)
		c.AbortBadRequestFormat("Service")
	}

	domain.Id = int64(id)
	err = models.DomainModel.UpdateById(&domain)
	if err != nil {
		logs.Error("update error.%v", err)
		c.HandleError(err)
		return
	}
	c.Success(domain)
}

func (c *DomainController) Delete() {
	id := c.GetIDFromURL()

	logical := c.GetLogicalFromQuery()

	err := models.DomainModel.DeleteById(int64(id), logical)
	if err != nil {
		logs.Error("delete %d error.%v", id, err)
		c.HandleError(err)
		return
	}
	c.Success(nil)
}
