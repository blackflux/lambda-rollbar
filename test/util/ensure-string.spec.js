const expect = require("chai").expect;
const ensureString = require("./../../src/util/ensure-string");

describe("Testing ensureString", () => {
  it("Testing String", () => {
    expect(ensureString("test")).to.equal("test");
  });

  it("Testing Non-String", () => {
    expect(ensureString(["test"])).to.equal("[\"test\"]");
  });
});
