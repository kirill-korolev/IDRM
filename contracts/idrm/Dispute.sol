pragma solidity ^0.5.0;

contract Dispute {
	address public pool;
	address public creator;
	bytes32 public termsHash;
	address public drm;
	bool public resolved;

	constructor(address _pool, address _creator, bytes32 _termsHash) payable public {
		pool = _pool;
		termsHash = _termsHash;
		creator = _creator;
		drm = msg.sender;
		resolved = false;
	}




}
