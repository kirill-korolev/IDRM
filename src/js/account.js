jQuery(document).ready(function( $ ) {

  var render = App.render;

  App.render = function(){

    render();

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
          instance.pools(i).then(function(poolAddress){
            var pool = App.contracts.Pool.at(poolAddress);
            pool.name().then(function(name){
              $('#pool-select').append('<option>' + name + '</option>');
            });
          });
        }
      });
    });



  }
});
