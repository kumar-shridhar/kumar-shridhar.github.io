$(function () {
  "use strict";
  $(window).scroll(function() {
    var bannerHeight = $(".banner").height(); 
    var scroll = $(window).scrollTop();

    if (scroll >= bannerHeight) {
        $(".sidebar").addClass("fixed");
    } else {
        $(".sidebar").removeClass("fixed");
    }
  });
});
