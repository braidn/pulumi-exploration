import * as aws from "@pulumi/aws";

export const group = new aws.ec2.SecurityGroup('web-secg', {
  ingress: [
    { protocol: 'tcp', fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] }
  ]
})

const userData = `#!/bin/bash echo "Hello, World!" > index.html nohup python -m SimpleHTTPServer 80 &`

export const server = new aws.ec2.Instance("web-srv-www", {
  instanceType: 't2.micro',
  securityGroups: [group.name],
  ami: 'ami-c55673a0',
  tags: { Name: 'http-www' }
})
