package domain

import (
	"encoding/json"

	"github.com/Qihoo360/wayne/src/backend/controllers/base"
	"github.com/Qihoo360/wayne/src/backend/models"
	"github.com/Qihoo360/wayne/src/backend/resources/domain"
	_ "github.com/Qihoo360/wayne/src/backend/resources/domain/provider/alicloud"
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

// @Title List/
// @Description get all id and names
// @Param	deleted		query 	bool	false		"is deleted,default false."
// @Success 200 {object} []models.Domain success
// @router /names [get]
func (c *DomainController) GetNames() {
	filters := make(map[string]interface{})
	deleted := c.GetDeleteFromQuery()

	filters["Deleted"] = deleted

	ds, err := models.DomainModel.GetNames(filters)
	if err != nil {
		logs.Error("get names error. %v, delete-status %v", err, deleted)
		c.HandleError(err)
		return
	}

	c.Success(ds)
}

// @Title GetAll
// @Description get all Domain
// @Param	pageNo		query 	int	false		"the page current no"
// @Param	pageSize		query 	int	false		"the page size"
// @Param	name		query 	string	false		"name filter"
// @Param	deleted		query 	bool	false		"is deleted, default list all"
// @Success 200 {object} []models.Domain success
// @router / [get]
func (c *DomainController) List() {
	param := c.BuildQueryParam()
	name := c.Input().Get("name")
	if name != "" {
		param.Query["name__contains"] = name
	}

	ds := []models.Domain{}
	if !c.User.Admin {
		c.AbortForbidden("have no permission")
	}

	total, err := models.GetTotal(new(models.Domain), param)
	if err != nil {
		logs.Error("get total count by param (%s) error. %v", param, err)
		c.HandleError(err)
		return
	}

	err = models.GetAll(new(models.Domain), &ds, param)
	if err != nil {
		logs.Error("list by param (%s) error. %v", param, err)
		c.HandleError(err)
		return
	}

	c.Success(param.NewPage(total, ds))
}

// @Title Create
// @Description create Domain
// @Param	body		body 	models.Domain	true		"The Doamin content"
// @Success 200 return models.Domain success
// @router / [post]
func (c *DomainController) Create() {
	var d models.Domain
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &d)
	if err != nil {
		logs.Error("get body error. %v", err)
		c.AbortBadRequestFormat("Domain")
	}
	provider, err := domain.NewProvider(d.Provider, d.AccessKeyId, d.AccessKey)
	if err != nil {
		logs.Error("check domain failed: %s", err.Error())
		c.AbortInternalServerError("Domain")
	}
	ok, err := provider.IsDomainAvailable(d.Name)
	if err != nil {
		logs.Error("check domain failed: %s", err.Error())
		c.AbortInternalServerError("Domain")
	}
	if !ok {
		c.AbortBadRequest("domain not available")
	}

	d.User = c.User.Name
	_, err = models.DomainModel.Add(&d)

	if err != nil {
		logs.Error("create error.%v", err.Error())
		c.HandleError(err)
		return
	}
	c.Success(d)
}

// @Title Get
// @Description find Object by id
// @Param	id		path 	int	true		"the id you want to get"
// @Success 200 {object} models.Doamin success
// @router /:id([0-9]+) [get]
func (c *DomainController) Get() {
	id := c.GetIDFromURL()

	d, err := models.DomainModel.GetById(int64(id))
	if err != nil {
		logs.Error("get by id (%d) error.%v", id, err)
		c.HandleError(err)
		return
	}

	c.Success(d)
	return
}

// @Title Update
// @Description update the Doamin
// @Param	id		path 	int	true		"The id you want to update"
// @Param	body		body 	models.Doamin	true		"The body"
// @Success 200 models.Doamin success
// @router /:id([0-9]+) [put]
func (c *DomainController) Update() {
	id := c.GetIDFromURL()
	var d models.Domain
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &d)
	if err != nil {
		logs.Error("Invalid param body.%v", err)
		c.AbortBadRequestFormat("Service")
	}

	d.Id = int64(id)
	err = models.DomainModel.UpdateById(&d)
	if err != nil {
		logs.Error("update error.%v", err)
		c.HandleError(err)
		return
	}
	c.Success(d)
}

// @Title Delete
// @Description delete the Doamin
// @Param	id		path 	int	true		"The id you want to delete"
// @Param	logical		query 	bool	false		"is logical deletion,default true"
// @Success 200 {string} delete success!
// @router /:id([0-9]+)
func (c *DomainController) Delete() {
	id := c.GetIDFromURL()

	err := models.DomainModel.DeleteById(int64(id), false)
	if err != nil {
		logs.Error("delete %d error.%v", id, err)
		c.HandleError(err)
		return
	}
	c.Success(nil)
}
