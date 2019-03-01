var Pool = artifacts.require("idrm/Pool");
var Dispute = artifacts.require("idrm/Dispute");
var PoolFactory = artifacts.require("idrm/PoolFactory");
var DisputeFactory = artifacts.require("idrm/DisputeFactory");

module.exports = function(deployer) {
    deployer.deploy(PoolFactory);
    deployer.deploy(DisputeFactory);
};
