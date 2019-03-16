

$.urlParam = function (name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.search);
  return (results !== null) ? results[1] || 0 : false;
}

var renderDisputes = async function(disputes, poolAddress, status) {
  for(var i = 0; i < disputes.length; ++i){
    var dispute = disputes[i];

    if(poolAddress != await dispute.pool())
      continue;

    var name = await dispute.name();
    var poolAddr = await dispute.pool();
    var pool = await App.contracts.Pool.at(poolAddr);
    var creator = await dispute.creator();
    var disputeFactory = await App.contracts.DisputeFactory.deployed();
    var isActive = await disputeFactory.active(dispute.address);

    var cand1 = await dispute.candidates(1);
    var cand2 = await dispute.candidates(2);

    $('#disputes-list').append(`<li class="list-group-item"><h4>${name}</h4><p>${isActive ? "Active" : "Closed"}</p><p>A: ${cand1[1]}</p><p>B: ${cand2[1]}</p>`);

    if(status == UserStatus.arbitrator && isActive){
      $('#disputes-list li').last().append(`<button class="btn btn-primary a-btn">A</button>`);
      $('#disputes-list li').last().append(`<button class="btn btn-primary b-btn">B</button>`);

      $('.a-btn').click(function(e){
        dispute.vote(1);
      });

      $('.b-btn').click(function(e){
        dispute.vote(2);
      });
    } else if(status == UserStatus.master && isActive){
      $('#disputes-list li').last().append(`<button class="btn btn-primary close-btn">Close</button>`);

      $('.close-btn').click(function(e){
        dispute.getResult();
      });
    }

    $('#disputes-list').append(`</li>`);
  }
}

var render = App.render;

App.render = async function() {
  await render();

  var poolAddr = $.urlParam('address');
  var pool = null;

  var checkPool = async function() {
      if(typeof App.contracts.Pool === 'undefined') {
         window.setTimeout(checkPool, 1000); /* this checks the flag every 100 milliseconds*/
      } else {
        pool = await App.contracts.Pool.at(poolAddr);
        console.log('pool loaded');
      }
  }

  await checkPool();

  if(!pool)
    return;

  $('#pool-header').text(`${await pool.name()}`);


  var status = await App.userForPool(pool);

  switch(status){
    case UserStatus.guest:
      $('#pool-status').text('Guest');
      $('#pool-status').after('<button class="btn btn-primary" id="become-arbitrator-btn">Become arbitrator</button>');

      $('#become-arbitrator-btn').click(function(e){
        pool.becomeArbitrator();
      });

      break;
    case UserStatus.arbitrator:
      $('#pool-status').text('Arbitrator');
      break;
    case UserStatus.pendingArbitrator:
      $('#pool-status').text('Pending arbitrator');
      break;
    case UserStatus.master:
      $('#pool-status').text('Master');

      /********* Pending *********/
      $('#pool-status').after(`<ul class="list-group" id="pending-list"></ul>`);

      var pendingCount = await pool.pendingArbitratorsCount();

      if(pendingCount != 'undefined')
        pendingCount = pendingCount.toNumber();

      var mastersCount = (await pool.mastersCount()).toNumber();
      var masterId = await pool.mastersIds(App.account);
      //var master = await pool.masters(masterId);

      $('#pending-list').before('<h1 id="pending-header">Pending arbitrators</h1>');
      var pendingEmpty = true;

      for(var i = 1; i <= pendingCount; ++i) {
        var pending = (await pool.pendingArbitrators(i)).toNumber();

        if(pending == 0)
          continue;

        pendingEmpty = false;
        var pendingAddr = await pool.pendingArbitratorsAddresses(i);
        $('#pending-list').append(`<li class="list-group-item"><p class="pending-addr">${pendingAddr}</p><p>${(pending - 1) + '/' + mastersCount} approved</p>`);

        //var isConfirmed = await master.confirmedArbitrators(pendingAddr);
        var isConfirmed = false;

        if(isConfirmed){
          $('.pending-list').last().append(`<p>You've already confirmed</p>`);
        } else {
          $('.list-group-item').last().append(`<button class="btn btn-primary confirm-arbitrator-btn">Confirm</button><button class="btn btn-primary deny-arbitrator-btn">Deny</button>`);
        }

        $('#pending-list').append('</li>');
      }

      if(pendingEmpty){
        $('#pending-header').after("<p>No pending arbitrators</p>");
      }

      $('.confirm-arbitrator-btn').click(function(e){
        var i = $('.confirm-arbitrator-btn').index(this);
        var addr = $('.pending-addr').eq(i).text();
        pool.confirmArbitrator(addr);
      });

      $('.deny-arbitrator-btn').click(function(e){
        var i = $('.confirm-arbitrator-btn').index(this);
        var addr = $('.pending-addr').eq(i).text();
        pool.denyArbitrator(addr);
      });

      /********* Pending *********/

      break;
  }

  /********* Arbitrators *********/

  $('#pool-status').after('<h1 id="arbitrators-header">Arbitrators</h1>');
  $('#arbitrators-header').after(`<ul class="list-group" id="arbitrators-list"></ul>`);
  var arbitratorsCount = await pool.arbitratorsCount();

  if(arbitratorsCount != 'undefined')
    arbitratorsCount = arbitratorsCount.toNumber();

  for(var i = 1; i <= arbitratorsCount; ++i) {
    var arbitrator = await pool.getArbitrator(i);
    $('#arbitrators-list').append(`<li class="list-group-item"><p>${arbitrator[0]}</p><p>Reputation ${arbitrator[1]}</p></li>`);
  }

  /********* Arbitrators *********/

  App.disputes().then(function(disputes){
    renderDisputes(disputes, poolAddr, status);
  });
}
