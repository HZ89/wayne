package routers

import (
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/context/param"
)

func init() {

	beego.GlobalControllerRouter["github.com/Qihoo360/wayne/src/backend/controllers/domain_record:DomainRecordController"] = append(beego.GlobalControllerRouter["github.com/Qihoo360/wayne/src/backend/controllers/domain_record:DomainRecordController"],
		beego.ControllerComments{
			Method:           "List",
			Router:           `/`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Params:           nil})

	beego.GlobalControllerRouter["github.com/Qihoo360/wayne/src/backend/controllers/domain_record:DomainRecordController"] = append(beego.GlobalControllerRouter["github.com/Qihoo360/wayne/src/backend/controllers/domain_record:DomainRecordController"],
		beego.ControllerComments{
			Method:           "Create",
			Router:           `/`,
			AllowHTTPMethods: []string{"post"},
			MethodParams:     param.Make(),
			Params:           nil})

	beego.GlobalControllerRouter["github.com/Qihoo360/wayne/src/backend/controllers/domain_record:DomainRecordController"] = append(beego.GlobalControllerRouter["github.com/Qihoo360/wayne/src/backend/controllers/domain_record:DomainRecordController"],
		beego.ControllerComments{
			Method:           "Get",
			Router:           `/:id([0-9]+)`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Params:           nil})

	beego.GlobalControllerRouter["github.com/Qihoo360/wayne/src/backend/controllers/domain_record:DomainRecordController"] = append(beego.GlobalControllerRouter["github.com/Qihoo360/wayne/src/backend/controllers/domain_record:DomainRecordController"],
		beego.ControllerComments{
			Method:           "Update",
			Router:           `/:id([0-9]+)`,
			AllowHTTPMethods: []string{"put"},
			MethodParams:     param.Make(),
			Params:           nil})

	beego.GlobalControllerRouter["github.com/Qihoo360/wayne/src/backend/controllers/domain_record:DomainRecordController"] = append(beego.GlobalControllerRouter["github.com/Qihoo360/wayne/src/backend/controllers/domain_record:DomainRecordController"],
		beego.ControllerComments{
			Method:           "Delete",
			Router:           `/:id([0-9]+)`,
			AllowHTTPMethods: []string{"delete"},
			MethodParams:     param.Make(),
			Params:           nil})

}
