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
});
