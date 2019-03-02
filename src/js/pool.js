jQuery(document).ready(function( $ ) {

  $.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.search);
    return (results !== null) ? results[1] || 0 : false;
  }

  var render = App.render;

  App.render = function(){
    render();

    var poolAddress = $.urlParam('address');
    var pool = App.contracts.Pool.at(poolAddress);

    var arbitratorState = 0;

    pool.mastersIds(App.account).then(function(id){
      if(id.toNumber() != 0){ //master
        arbitratorState = 1;
      } else {
        pool.arbitratorsIds(App.account).then(function(id){
          if(id.toNumber() != 0){ // arbitrator
              arbitratorState = 2;
          } else {
            pool.pendingArbitrators(App.account).then(function(id){
              if(id.toNumber() != 0){ // pending
                  arbitratorState = 3;
              }
            });
          }
        });
      }

      var poolIntro = $('#pool-intro');

      switch(arbitratorState){
        case 0:
          poolIntro.append('<h1 id="#pool-arbitrator" class="mb-4 pb-0">Guest</h1>');
          poolIntro.append('<a href="#" class="about-btn scrollto">Become an arbitrator</a>');
          break;
        case 1:
          poolIntro.append('<h1 id="#pool-arbitrator" class="mb-4 pb-0">Master</h1>');
          break;
        case 2:
          poolIntro.append('<h1 id="#pool-arbitrator" class="mb-4 pb-0">Arbitrator</h1>');
          break;
        case 3:
          poolIntro.append('<h1 id="#pool-arbitrator" class="mb-4 pb-0">Pending arbitrator</h1>');
          break;
      }
    });

  }
});
