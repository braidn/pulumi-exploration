import * as aws from '@pulumi/aws';
import * as policy from '@pulumi/policy';
import * as pulumi from '@pulumi/pulumi';

const stackPolicy: policy.StackValidationPolicy = {
  name: 'eks-test',
  description: 'EKS integration tests',
  enforcementLevel: 'mandatory',
  validateStack: async (args, reportViolation) => {
    const clusterResource = args.resources.filter((r) =>
      r.isType(aws.eks.Cluster)
    );
    if (clusterResource.length !== 1) {
      reportViolation(
        `Expected a single EKS Cluster but found ${clusterResource.length}`,
      );
      return;
    }
    const cluster = clusterResource[0].asType(aws.eks.Cluster)!;

    if (cluster.version !== '1.13') {
      reportViolation(`Expected EKS cluster to be 1.13 but received ${cluster.version}`)
    }

    const vpcId = cluster.vpcConfig.vpcId

    if (!vpcId) {
      if (pulumi.runtime.isDryRun()) {
        reportViolation('EKS Cluster without VPC')
      }
      return
    }

    const ec2 = new aws.sdk.EC2({region: aws.config.region})
    const response = await ec2.describeVpcs().promise()
    const defaultVpc = response.Vpcs?.find(vpc => vpc.IsDefault)

    if (!defaultVpc) {
      reportViolation('Default VPC Not found')
      return
    }

    if (defaultVpc.VpcId !== vpcId) {
      reportViolation(`Eks Cluster ${cluster.name} should not use the default VPC`)
    }
  },
};

const tests = new policy.PolicyPack(
  'test-policy',
  {
    policies: [stackPolicy],
  },
);
