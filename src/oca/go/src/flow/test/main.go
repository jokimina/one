package main

import (
	"fmt"

	"github.com/OpenNebula/one/src/oca/go/src/flow/httpclient"
)

func main() {

	client := httpclient.Client{
		User:    "oneadmin",
		Pass:    "opennebula",
		Address: "http://10.10.0.56:2474",
	}

	body := httpclient.Get(client, "service")

	fmt.Println(httpclient.Btostr(body))
}