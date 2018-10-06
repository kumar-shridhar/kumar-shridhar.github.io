$(function(){

  $(".skill_tab").on("click", function(event){
    // Change active tab
    event.preventDefault();
    $(".skill_tab").removeClass("active");
    $(this).addClass("active");
    // Hide all tab-content (use class="hidden")
    $(".skill_tab-content").addClass("hidden");
    // Show target tab-content (use class="hidden")
    $($(this).data("target")).removeClass("hidden");
  });

});
