jQuery(document).ready(function( $ ) {

  $('#add-address').click(function(e) {

      var count = $('.address-for-pool').length + 1;

      if(count > $('#contact form').attr('max-addresses')) {
          return;
      }

      var input = `
      <div class="form-group">
        <input type="text" class="form-control address-for-pool" name="address" placeholder="Address ${count}" data-rule="minlen:4" data-msg="Please enter at least 8 chars of address" />
        <div class="validation"></div>
      </div>
      `;
      $('#add-address').before(input);
  });

  var render = App.render;

  App.render = function() {
    render();
    
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
  }



});
