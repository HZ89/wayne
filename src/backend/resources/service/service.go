package service

import (
	"k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

func CreateOrUpdateService(cli *kubernetes.Clientset, service *v1.Service) (*v1.Service, error) {
	old, err := cli.CoreV1().Services(service.Namespace).Get(service.Name, metaV1.GetOptions{})
	if err != nil {
		if errors.IsNotFound(err) {
			return cli.CoreV1().Services(service.Namespace).Create(service)
		}
		return nil, err
	}
	old.Labels = service.Labels
	old.Spec.ExternalIPs = service.Spec.ExternalIPs
	old.Spec.Selector = service.Spec.Selector
	old.Spec.Ports = service.Spec.Ports

	return cli.CoreV1().Services(service.Namespace).Update(old)
}

func GetService(cli *kubernetes.Clientset, name, namespace string) (*v1.Service, error) {
	service, err := cli.CoreV1().Services(namespace).Get(name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	return service, nil
}

func DeleteService(cli *kubernetes.Clientset, name, namespace string) error {
	return cli.CoreV1().Services(namespace).Delete(name, &metaV1.DeleteOptions{})
}
