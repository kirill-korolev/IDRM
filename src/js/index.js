var render = App.render;

var renderPools = async function(pools) {

  for(var i = 0; i < pools.length; ++i){
    var pool = pools[i];

    var name = await pool.name();
    var arbitratorsCount = await pool.arbitratorsCount();

    $('#pools-list').append(`<li class="list-group-item"><h4><a href="pool.html?address=${pool.address}">${name}</a></h4><p>${arbitratorsCount} arbitrators</p></li>`);
    $('#dispute-pool-select').append(`<option value="${pool.address}">${name}</option>`);
  }
}

var renderDisputes = async function(disputes) {
  for(var i = 0; i < disputes.length; ++i){
    var dispute = disputes[i];

    if(App.account != await dispute.creator())
      continue;

    var name = await dispute.name();
    var poolAddr = await dispute.pool();
    var pool = await App.contracts.Pool.at(poolAddr);
    var creator = await dispute.creator();
    var disputeFactory = await App.contracts.DisputeFactory.deployed();
    var isActive = await disputeFactory.active(dispute.address);
    $('#disputes-list').append(`<li class="list-group-item"><h4>${name}</h4><a href="pool.html?address=${pool.address}">${await pool.name()}</a><p>${isActive ? "Active" : "Closed"}</p></li>`);
  }
}

App.render = async function() {
  await render();
  var pools = await App.pools();
  var disputes = await App.disputes();

  renderPools(pools);
  renderDisputes(disputes);
}
