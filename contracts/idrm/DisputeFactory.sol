pragma solidity ^0.5.0;

import "./Dispute.sol";

contract DisputeFactory {
    mapping(address => bool) public active;
    mapping(uint256 => address) public disputes;
    uint256 public disputesCount;

    function createDispute(string memory _name, address _pool, address _creator, bytes32 _termsHash) payable public {
        Dispute dispute = (new Dispute).value(msg.value)(_name, _pool, _creator, _termsHash);
        disputesCount += 1;
        disputes[disputesCount] = address(dispute);
        active[address(dispute)] = true;
    }

    function closeDispute() public {
        active[msg.sender] = false;
    }
}
