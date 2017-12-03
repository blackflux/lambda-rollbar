const expect = require("chai").expect;

const template = require("./../../lib/templates/aws-cloud-watch");

describe("Testing AWS Cloud Watch Template", () => {
  it("Test Invalid GZip", () => {
    const input = {
      awslogs: {
        data: (
          "68JlBUk+l7KSN7tCOEJ4M3/qOI49vMH4sIAAFtKV3akI8d0bLYmibvPPN3wz00CJxmQnTO41wABBAAAAHWPwQqCQBCEcB6sQbFC3CjW3XW" +
          "8kxpOpP+OC22d1Wml1qZkQGtoMsScGX0Xm7EFtK+smZBEUgXoLCdMhhwWQRIctmxaczKN3plG8zlaHIta5KqWsozoTYw3/djzwhpLwivWF" +
          "GHGpAFe7DLHj+zCKdlFqLaU2ZHV2a4Ct/an0/ivdX8oYc1UVX860fQDQiMdxRQEAAA=="
        )
      }
    };
    expect(template(input)).to.deep.equal({
      raw: input.awslogs.data,
      error: "incorrect header check"
    });
  });

  it("Testing Generated Output", () => {
    const input = {
      awslogs: {
        data: (
          "H4sIAAAAAAAAAL2RS2/bMBCE/wvRo2nxKZK+GahjBMgDqHVqbBiUtHWJSpQq0nYDy/+9jJMcegjQIGgvPAx3B9/MnlALIdgdFI89oBn6PC" +
          "/m29vFajVfLtAEdUcPQ5KFMYQKngspaJKbbrccun2ffjJ7DFlj27K2WZJ3zu9wC3FwVcA1tF16DjhCiNj27nl1FQewbdplhKqM6Izl2cOn" +
          "m3mxWBWbWlorRJlbA1oA1aZktioVB8K14Ywli7AvQzW4PrrOX7kmwhDQ7AHdXCCezbdvogTw9auKNheexQF8fLI4IVcnLM4ll0ILaRiXUg" +
          "iZYudM5iqnXBMhNCc5MZprQdKkYkRqKRjRCS26VGe0bWqGSsKV5pQrQ8zkteaX1JhozPKC0RlnM6qmaeTrOhJDqlpJi7W1OaYUFNaqNDgv" +
          "v1nKNFW1pOt4e393Xdx/ub5bjpSMVbf3ceyT9fbg4DjG71DuB5+yt53/Ma26du0TGPyKg60i1FcOmjqFPSF4ip143uuX3Ab4uU85t5e6/o" +
          "b6z2rerACdz5OPHcH8/yPwqR5b1zQuQNX5OoyNjeCrx4+d4h2u//Ygm/NvP7mOnyQEAAA="
        )
      }
    };
    expect(template(input)).to.deep.equal({
      raw: input.awslogs.data,
      content: {
        logEvents: [
          {
            extractedFields: {
              event: "MONITORING|10|count|page_view|theburningmonk.com",
              request_id: "090cd75a-8aa6-11e7-87b9-6bfa12817d51",
              timestamp: "2017-08-26T21:32:17.909Z"
            },
            id: "33535484592355445645625676138044830609838403537205854208",
            message: (
              "2017-08-26T21:32:17.909Z\t090cd75a-8aa6-11e7-87b9-6bfa12817d51\t" +
              "MONITORING|10|count|page_view|theburningmonk.com\n"
            ),
            timestamp: 1503783137909
          },
          {
            extractedFields: {
              event: "MONITORING|3.8|milliseconds|latency|theburningmonk.com",
              request_id: "090cd75a-8aa6-11e7-87b9-6bfa12817d51",
              timestamp: "2017-08-26T21:32:17.909Z"
            },
            id: "33535484592355445645625676138044830609838403537205854209",
            message: (
              "2017-08-26T21:32:17.909Z\t090cd75a-8aa6-11e7-87b9-6bfa12817d51\t" +
              "MONITORING|3.8|milliseconds|latency|theburningmonk.com\n"
            ),
            timestamp: 1503783137909
          }
        ],
        logGroup: "/aws/lambda/logging-metrics-demo-dev-test-api",
        logStream: "2017/08/26/[$LATEST]d5aa44b6a9e84e189b2acb73e0389322",
        messageType: "DATA_MESSAGE",
        owner: "499014364541",
        subscriptionFilters: [
          "LambdaStream_logging-metrics-demo-dev-send-metrics"
        ]
      },
      url: (
        "https://console.aws.amazon.com/cloudwatch/home#logEventViewer:" +
        "group=/aws/lambda/logging-metrics-demo-dev-test-api;" +
        "stream=2017/08/26/[$LATEST]d5aa44b6a9e84e189b2acb73e0389322"
      )
    });
  });
});
