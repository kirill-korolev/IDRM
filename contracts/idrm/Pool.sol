pragma solidity ^0.5.0;

contract Pool {

	// Basically master is the creator of a pool
	// It can only be one person or any other number
	// of masters up to 5 (exclusively)
	//
	// Currently all masters have similar rights and
	// power and unlike arbitrators they're not elected
	//
	// Once a person wants to become an arbitrator
	// one is added to a pending list and after that
	// all of the masters must confirm that
	struct Master {
		mapping(address => bool) confirmedArbitrators;
	}

	struct Arbitrator {
		address ethAddress;
		uint256 reputation;
	}

	mapping(uint256 => Master) public masters;
	mapping(address => uint256) public mastersIds;
	uint256 public mastersCount;

	mapping(address => uint256) public pendingArbitrators;

	mapping(uint256 => Arbitrator) public arbitrators;
	mapping(address => uint256) public arbitratorsIds;
	uint256 public arbitratorsCount;

	string public name;

	event PendingArbitrator(address _arbitrator);

	modifier onlyMasters {
		require(mastersIds[msg.sender] != 0);
		_;
	}

	modifier isPendingArbitrator(address _arbitrator) {
		require(arbitratorsIds[_arbitrator] == 0);
		_;
	}

	constructor(string _name, address[] _masters) public {
		require(_masters.length > 0 && _masters.length < 5);

		name = _name;

		for(uint256 i = 0; i < _masters.length; ++i) {
			mastersIds[_masters[i]] = i + 1;
			masters[mastersIds[_masters[i]]] = Master();
		}

		mastersCount = _masters.length;
	}

	function becomeArbitrator() public isPendingArbitrator(msg.sender) {
		require(mastersIds[msg.sender] == 0);
		emit PendingArbitrator(msg.sender);
	}

	function leavePool() public {
		uint256 id = arbitratorsIds[msg.sender];
		require(id != 0);
		delete arbitratorsIds[msg.sender];
		delete arbitrators[id];
	}

	function confirmArbitrator(address _arbitrator) public onlyMasters isPendingArbitrator(_arbitrator) {
		require(!masters[mastersIds[msg.sender]].confirmedArbitrators[_arbitrator]);
		masters[mastersIds[msg.sender]].confirmedArbitrators[_arbitrator] = true;
		pendingArbitrators[_arbitrator]++;

		if (pendingArbitrators[_arbitrator] == mastersCount) {
			addArbitrator(_arbitrator);
		}
	}

	function denyArbitrator(address _arbitrator) public onlyMasters isPendingArbitrator(_arbitrator) {

		for(uint256 i = 1; i < mastersCount; ++i) {
			masters[i].confirmedArbitrators[_arbitrator] = false;
		}

		pendingArbitrators[_arbitrator] = 0;
	}

	function addArbitrator(address _arbitrator) private onlyMasters isPendingArbitrator(_arbitrator) {
		arbitratorsIds[_arbitrator] = ++arbitratorsCount;
		arbitrators[arbitratorsIds[_arbitrator]] = Arbitrator(_arbitrator);
	}
}
