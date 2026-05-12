window.HELP_IMPROVE_VIDEOJS = false;

$(document).ready(function () {
  $(".site-header__toggle").on("click", function () {
    $(".site-header__toggle").toggleClass("is-active");
    $(".site-header__nav").toggleClass("is-open");
  });

  $(".site-header__nav a").on("click", function () {
    $(".site-header__toggle").removeClass("is-active");
    $(".site-header__nav").removeClass("is-open");
  });

  $('a[href^="#"]').on("click", function (e) {
    const id = $(this).attr("href");
    if (!id || id === "#") return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
