import * as pulumi from '@pulumi/pulumi';
import 'mocha';

pulumi.runtime.setMocks({
  newResource: function(
    type: string,
    name: string,
    inputs: any,
  ): {
    id: string;
    state: any;
  } {
    return {
      id: inputs.name,
      state: inputs,
    };
  },
  call: function(token: string, args: any, provider?: string) {
    return args;
  },
});

import * as infra from '../index';

describe(
  'Infra',
  () => {
    const server = infra.server;

    describe('#server', () => {});

    describe(
      '#group',
      () => {
        it(
          'Includes a tag name',
          function(done) {
            pulumi.all([server.urn, server.tags]).apply(([urn, tags]) => {
              if (!tags || !tags['Name']) {
                return done(new Error(`Missing tag: 'Name' from ${urn}`));
              }
              done();
            });
          },
        );
        it(
          'Avoids the use of userData',
          function(done) {
            pulumi.all([server.urn, server.userData]).apply(([urn, userData]) => {
              if (userData) {
                return done(new Error(`userData included in ${urn}`));
              }
              done();
            });
          },
        );

        const group = infra.group;
        it(
          'Does not expose an SSH port',
          function(done) {
            pulumi.all([group.urn, group.ingress]).apply(([urn, ingress]) => {
              if (
                ingress.find((rule) => rule.fromPort === 22 &&
                (rule.cidrBlocks || []).find((block: any) => block === '0.0.0.0/0')
              )) {
                return done(new Error(`Unsecure port open on ${urn}`));
              }
              done();
            });
          },
        );
      },
    );
  },
);
