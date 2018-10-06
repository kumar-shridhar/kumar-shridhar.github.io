$(function(){

  $(".portfolio_tab").on("click", function(event){
    // Change active tab
    event.preventDefault();
    $(".portfolio_tab").removeClass("active");
    $(this).addClass("active");
    // Hide all tab-content (use class="hidden")
    $(".portfolio_tab-content").addClass("hidden");
    // Show target tab-content (use class="hidden")
    $($(this).data("target")).removeClass("hidden");
  });

});
