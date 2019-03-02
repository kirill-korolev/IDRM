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

      App.bindEvents();
      return App.render();
    });

    $.getJSON("Pool.json", function(pool) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Pool = TruffleContract(pool);
      // Connect provider to interact with contract
      App.contracts.Pool.setProvider(App.web3Provider);
    });

  },

  bindEvents: function() {

  },
  render: function(){

    var addrBtn = $('#address');

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        addrBtn.text(account);
      } else {
        addrBtn.text('Enable Metamask');
      }
    });

    var poolFactory;

    App.contracts.PoolFactory.deployed().then(function(instance){
      poolFactory = instance;
    }).then(function(){
      return poolFactory.poolsCount();
    }).then(function(count){
      for(var i = 1; i <= count; ++i){
        poolFactory.pools(i).then(function(poolAddress){
          var pool = App.contracts.Pool.at(poolAddress);

          pool.name().then(function(name){
            pool.arbitratorsCount().then(function(arbitratorsCount){
              var block = `
              <div class="col-lg-4 col-md-6">
                <div class="speaker">
                  <img src="https://miro.medium.com/max/1104/1*6bOXOdSXtre9t7aMgTr-4A.png" alt="Speaker 1" class="img-fluid">
                  <div class="details">
                    <h3><a href="pool.html?address=${poolAddress}">${name}</a></h3>
                    <p>${arbitratorsCount} arbitrators</p>
                  </div>
                </div>
              </div>
              `;

              $('#speakers .row').append(block);
            });
          });

        });
      }
    });

    $('#create-pool').click(function(e) {
      App.contracts.PoolFactory.deployed().then(function(instance){
        var name = $('#pool-factory #name').val();
        var addresses = [App.account];

        $('#pool-factory input[name="address"]').each(function(i, elem){
          addresses.push($(this).val());
        });

        instance.createPool(name, addresses);
      });
    });

    App.contracts.PoolFactory.deployed().then(function(instance){
      instance.poolsCount().then(function(poolsCount){
        for(var i = 1; i <= poolsCount; ++i){
          poolFactory.pools(i).then(function(poolAddress){
            var pool = App.contracts.Pool.at(poolAddress);
            pool.name().then(function(name){
              $('#pool-select').append('<option>' + name + '</option>');
            });
          });
        }
      });
    });


  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
