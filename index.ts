import * as eks from '@pulumi/eks'

const cluster = new eks.Cluster('policy-cluster',{
  desiredCapacity: 2,
  minSize: 1,
  maxSize: 2,
  storageClasses: 'gp2',
  deployDashboard: false
})
