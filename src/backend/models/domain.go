package models

import (
	"time"
)

const TableNameDomain = "domain"

type domainModel struct {
}

type Domain struct {
	Id          int64  `orm:"auto" json:"id, omitempty"`
	Name        string `orm:"unique;index;size(128)" json:"name,omitempty"`
	Provider    string `orm:"size(32)" json:"provider,omitempty"`
	Description string `orm:"nil,size(512)" json:"description,omitempty"`
	AccessKeyId string `orm:"size(512)" json:"accessKeyId, omitempty"`
	AccessKey   string `orm:"size(512)" json:"accessKey, omitempty"`

	CreateTime *time.Time `orm:"auto_now_add;type(datetime)" json:"createTime, omitempty"`
	UpdateTime *time.Time `orm:"auto_now;type(datetime)" json:"updateTime,omitempty"`
	User       string     `orm:"size(128)" json:"user, omitempty"`
	Deleted    bool       `orm:"default(false)" json:"deleted,omitempty"`
}

func (*Domain) TableName() string {
	return TableNameDomain
}

func (*domainModel) Add(domain *Domain) (id int64, err error) {
	domain.CreateTime = nil
	id, err = Ormer().Insert(domain)
	return
}

func (*domainModel) GetNames(filters map[string]interface{}) (domains []Domain, err error) {
	qs := Ormer().QueryTable(new(Domain))
	if len(filters) > 0 {
		for k, v := range filters {
			qs = qs.Filter(k, v)
		}
	}
	_, err = qs.All(&domains, "Id", "Name", "Provider", "Description")
	return
}

func (*domainModel) UpdateById(m *Domain) (err error) {
	v := Domain{Id: m.Id}
	// ascertain id exists in the database
	if err = Ormer().Read(&v); err == nil {
		m.UpdateTime = nil
		_, err = Ormer().Update(m)
		return err
	}
	return
}

func (*domainModel) GetById(id int64) (v *Domain, err error) {
	v = &Domain{Id: id}
	v.Id = id
	if err = Ormer().Read(v); err != nil {
		return nil, err
	}
	return
}

func (*domainModel) GetByName(name string) (v *Domain, err error) {
	v = &Domain{Name: name}

	if err = Ormer().QueryTable(v).Filter("name", name).One(v); err != nil {
		return nil, err
	}
	return
}

func (*domainModel) DeleteById(id int64, logical bool) (err error) {
	v := Domain{Id: id}

	if err = Ormer().Read(&v); err != nil {
		return
	}
	if logical {
		v.Deleted = true
		_, err = Ormer().Update(&v)
		return
	}
	_, err = Ormer().Delete(&v)
	return
}
