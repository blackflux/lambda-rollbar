const expect = require("chai").expect;

const template = require("./../../lib/templates/aws-cloud-watch");

describe("Testing AWS Cloud Watch Template", () => {
  it("Testing Generated Output", () => {
    const input = { awslogs: { data: "content" } };
    expect(template(input)).to.not.equal(input.awslogs);
    expect(template(input)).to.deep.equal(input.awslogs);
  });
});
