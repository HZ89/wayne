package message

import (
	"encoding/json"
	"reflect"
	"time"
)

type Type string

const (
	TypeRequest Type = "request"
	TypeHook    Type = "hook"
	TypeTask    Type = "task"

	ADD     Action = "add"
	DELETE  Action = "delete"
	MODIFY  Action = "modify"
	PUBLISH Action = "publish"
	OFFLINE Action = "offline"
)

type Message struct {
	Type Type
	Data json.RawMessage
}

type RequestMessageData struct {
	URI        string
	Controller string
	Method     string

	User string
	IP   string

	ResponseStatus int
	ResponseBody   []byte
}

type HookMessageData struct {
	NamespaceId int64
	AppId       int64

	User     string
	IP       string
	Datetime time.Time

	EventKey string
	Payload  interface{}
}

func NewHookMessageData(namespaceId, appId int64, user, ip string, action Action, resource interface{}, tiem time.Time) *HookMessageData {
	payLoad := newEventPayload(action, resource)
	return &HookMessageData{
		NamespaceId: namespaceId,
		AppId:       appId,
		User:        user,
		IP:          ip,
		EventKey:    payLoad.Type,
		Datetime:    tiem,
		Payload:     payLoad,
	}
}

type eventPayload struct {
	Action Action      `json:"action"`
	Type   string      `json:"type"`
	Data   interface{} `json:"data"`
}

func newEventPayload(action Action, data interface{}) *eventPayload {
	dataType := IndirectType(reflect.TypeOf(data)).Name()
	return &eventPayload{
		Action: action,
		Type:   dataType,
		Data:   data,
	}
}

func IndirectType(reflectType reflect.Type) reflect.Type {
	for reflectType.Kind() == reflect.Ptr || reflectType.Kind() == reflect.Slice {
		reflectType = reflectType.Elem()
	}
	return reflectType
}

type Action string

type TaskMessageData struct{}
