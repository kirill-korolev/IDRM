App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {

    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {

    $.getJSON("PoolFactory.json", function(poolFactory) {

      // Instantiate a new truffle contract from the artifact
      App.contracts.PoolFactory = TruffleContract(poolFactory);
      // Connect provider to interact with contract
      App.contracts.PoolFactory.setProvider(App.web3Provider);

      $.getJSON("Pool.json", function(pool) {
        // Instantiate a new truffle contract from the artifact
        App.contracts.Pool = TruffleContract(pool);
        // Connect provider to interact with contract
        App.contracts.Pool.setProvider(App.web3Provider);

        // Load account data
        web3.eth.getCoinbase(function(err, account) {
          if (err === null) {
            App.account = account;
          }

          App.bindEvents();
          return App.render();
        });
      });

    });


  },

  bindEvents: function() {

  },
  render: function(){

  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
