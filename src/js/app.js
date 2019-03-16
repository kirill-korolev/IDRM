UserStatus = {
  guest: 1,
  pendingArbitrator: 2,
  arbitrator: 3,
  master: 4
};

App = {
  web3Provider: null,
  contracts: {},
  json: ['PoolFactory', 'Pool', 'DisputeFactory', 'Dispute'],
  account: '0x0',
  init: async function() {
    return await App.initWeb3();
  },
  initWeb3: async function() {

    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }

    await App.initContracts(App.json);
    App.account = await App.initAccount();
    App.bindEvents();
    return App.render();
  },
  initContracts: async function(contracts) {
    return Promise.all(contracts.map(async (contract) => {
      App.initContract(contract + '.json', function(instance){
        App.contracts[contract] = instance;
      });
    }));
  },
  initContract: async function(jsonPath, success) {
    await $.getJSON(jsonPath, function(contractJson) {
      var contract = TruffleContract(contractJson);
      contract.setProvider(App.web3Provider);
      success(contract);
    });
  },
  initAccount: function() {
    return new Promise((resolve, reject) => {
      web3.eth.getCoinbase(function(err, account) {
        if (err !== null) {
          reject(err);
        }
        App.account = account;
        resolve(App.account);
      });
    });
  },
  bindEvents: function() {
    $('#create-pool-btn').on('click', App.createPool);

    $('#add-address-btn').on('click', function(e){
      var index = $('.pool-address').length + 1;
      var element = `<div class="input-group mb-3"><input type="text" class="form-control pool-address" placeholder="Address ${index}" aria-label="Address"></div>`;
      $('#add-address-btn').before(element);
    });

    $('#create-dispute-btn').on('click', App.createDispute);
  },
  createPool: async function(){
    var name = $('#pool-name-input').val();
    var addresses = [App.account];

    $('.pool-address').each(function(i, elem){
      addresses.push($(this).val());
    });

    App.contracts.PoolFactory.deployed().then(function(poolFactory){
      poolFactory.createPool(name, addresses);
    });
  },
  createDispute: function(){
    var name = $('#dispute-name-input').val(); // add field to contract
    var pool = $('#dispute-pool-select').val();

    App.contracts.DisputeFactory.deployed().then(function(disputeFactory){
      disputeFactory.createDispute(name, pool, App.account, ""); // add ipfs hash
    });
  },
  render: async function(){

  },
  userForPool: async function(pool){
    var userStatus = UserStatus.guest;

    var masterId = await pool.mastersIds(App.account);

    if(masterId.toNumber() != 0){
      userStatus = UserStatus.master;
    } else {
      var arbitratorId = await pool.arbitratorsIds(App.account);

      if(arbitratorId.toNumber() != 0){
        userStatus = UserStatus.arbitrator;
      } else {
        var pendingId = await pool.pendingArbitratorsIds(App.account);

        if(pendingId.toNumber() != 0){
          userStatus = UserStatus.pendingArbitrator;
        }
      }
    }

    return userStatus;
  },
  disputes: async function(){
    var disputeFactory = await App.contracts.DisputeFactory.deployed();
    var disputesCount = await disputeFactory.disputesCount();

    if(disputesCount != 'undefined')
      disputesCount = disputesCount.toNumber();

    var disputes = [];

    for(var i = 1; i <= disputesCount; ++i){
      var disputeAddress = await disputeFactory.disputes(i);
      var dispute = App.contracts.Dispute.at(disputeAddress);
      disputes.push(dispute);
    }

    return disputes;
  },
  pools: async function(){
    var poolFactory = await App.contracts.PoolFactory.deployed();
    var poolsCount = await poolFactory.poolsCount();

    if(poolsCount != 'undefined')
      poolsCount = poolsCount.toNumber();

    var pools = [];

    for(var i = 1; i <= poolsCount; ++i){
      var poolAddress = await poolFactory.pools(i);
      var pool = App.contracts.Pool.at(poolAddress);
      pools.push(pool);
    }

    return pools;
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
