pragma solidity ^0.5.0;

import "../math/SafeMath.sol";

contract Pool {
	using SafeMath for uint256;

	struct Master {
		mapping(address => bool) confirmedArbitrators;
	}

	struct Arbitrator {
		address ethAddress;
	}

	mapping(uint256 => Master) public masters;
	mapping(address => uint256) public mastersIds;
	uint256 public mastersCount;

	mapping(address => uint256) public pendingArbitrators;

	mapping(uint256 => Arbitrator) public arbitrators;
	mapping(address => uint256) public arbitratorsIds;
	uint256 public arbitratorsCount;

	event PendingArbitrator(address _arbitrator);

	modifier onlyMasters {
		require(mastersIds[msg.sender] != 0);
		_;
	}

	modifier isPendingArbitrator {
		require(arbitratorsIds[_arbitrator] == 0);
		_;
	}

	constructor(address[] _masters) public {
		require(_masters.length > 0 && _masters.length < 5);

		for(uint256 i = 0; i < _masters.length; ++i) {
			mastersIds[_masters[i]] = i + 1;
		}

		mastersCount = _masters.length;
	}

	function becomeArbitrator() public isPendingArbitrator {
		emit PendingArbitrator(msg.sender);
	}

	function confirmArbitrator(address _arbitrator) public onlyMasters isPendingArbitrator {
		require(!masters[mastersIds[msg.sender]].confirmedArbitrators[_arbitrator]);
		masters[mastersIds[msg.sender]].confirmedArbitrators[_arbitrator] = true;
		pendingArbitrators[_arbitrator]++;

		if (pendingArbitrators[_arbitrator] == mastersCount) {
			addArbitrator(_arbitrator);
		}
	}

	function denyArbitrator(address _arbitrator) public onlyMasters isPendingArbitrator {

		for(uint256 i = 1; i < mastersCount; ++i) {
			masters[i].confirmedArbitrators[_arbitrator] = false;
		}

		pendingArbitrators[_arbitrator] = 0;
	}

	function addArbitrator(address _arbitrator) private onlyMasters isPendingArbitrator {
		arbitratorsIds[_arbitrator] = ++arbitratorsCount;
		arbitrators[arbitratorsIds[_arbitrator]] = Arbitrator(_arbitrator);
	}
}
