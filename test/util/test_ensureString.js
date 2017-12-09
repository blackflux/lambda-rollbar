const expect = require("chai").expect;
const ensureString = require("./../../lib/util/ensureString");

describe("Testing ensureString", () => {
  it("Testing String", () => {
    expect(ensureString("test")).to.equal("test");
  });

  it("Testing Non-String", () => {
    expect(ensureString(["test"])).to.equal("[\"test\"]");
  });
});
