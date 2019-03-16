pragma solidity ^0.5.0;

import "./Pool.sol";
import "./DisputeFactory.sol";

contract Dispute {
	string public name;
	address public pool;
	address public creator;
	bytes32 public termsHash;
	address public drm;
	bool public resolved;

	struct Candidate {
			uint id;
			uint voteCount;
	}

	mapping(address => bool) public voters;
	mapping(uint256 => Candidate) public candidates;
	uint256 public candidatesCount;

	constructor(string memory _name, address _pool, address _creator, bytes32 _termsHash) payable public {
		name = _name;
		pool = _pool;
		termsHash = _termsHash;
		creator = _creator;
		drm = msg.sender;
		resolved = false;

		addCandidate();
		addCandidate();
	}

	function addCandidate() private {
		candidatesCount++;
		candidates[candidatesCount] = Candidate(candidatesCount, 0);
}

	function vote(uint256 _id) public {
		Pool instance = Pool(pool);

		require(instance.arbitratorsIds(msg.sender) != 0);
		require(!voters[msg.sender]);
		require(_id > 0 && _id <= candidatesCount);

		(address ethAddress, uint256 rep) = instance.getArbitrator(instance.arbitratorsIds(msg.sender));

		voters[msg.sender] = true;
		candidates[_id].voteCount += rep;
	}

	function getResult() public {
		DisputeFactory(drm).closeDispute();
	}



}
