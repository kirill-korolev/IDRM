pragma solidity ^0.5.0;

import "./Pool.sol";

contract PoolFactory {
    mapping(uint256 => address) public pools;
    uint256 public poolsCount;

    function createPool(string memory _name, address[] memory _masters) public {
        Pool pool = new Pool(_name, _masters);
        poolsCount += 1;
        pools[poolsCount] = address(pool);
    }
}
