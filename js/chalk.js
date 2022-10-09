$('.blog-item').on('click', function (e, i) {
    var chec = $("#textarea").val()
    if (chec == "matoo")
        $(this).toggleClass('hidden');

})