$(document).ready(function () {

  $('#tags').tagsInput({
    'height':'60px',
    'width':'280px'
  });
  if ($(".alert-flash")) {
    setTimeout(function () {
      $(".alert-flash").hide(400)
    }, 1000)
  }
});
