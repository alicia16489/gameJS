$('#btn_cmd').click(function(){
    $('#start').hide();
    $('#cmd').show();
});

$('#btn_play').click(function(){
    $('#start').hide();
    $('#levels').show();
});

$('#btn_cmd_return').click(function(){
    $('#start').show();
    $('#cmd').hide();
});

$('#btn_lvls_return').click(function(){
    $('#start').show();
    $('#levels').hide();
});
