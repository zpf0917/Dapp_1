var Contract_1 = artifacts.require("./Contract_1.sol");
var TestThrows = artifacts.require("TestThrows");

module.exports = function(deployer) {
  deployer.deploy(Contract_1);
  deployer.deploy(TestThrows);
};