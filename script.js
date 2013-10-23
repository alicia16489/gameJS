function get_random_color() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

(function ($) {
    "use strict";

    var CMB = {};
    (function (CMB) {
        var globals, texture, images, current_lvl, hero, movableItem;

        globals = [
            {
                $canvas : '',

                has_bomb : 'false',

                context : '',

                entities : {
                    cases : []
                },

                bordures : [216,215,214,213,212,211,210,
                    204,192,180,168,156,
                    198,186,174,162,150,
                    144,143,142,141,140,139,138],
                hero : [175],
                rock : [202,178,154,188],
                bomb : [],
                hard_rock : [],
                button : [176],
                toggle_rock : [201,189,177,165,153],
                toggle_rock_link : {176:[201,189,177,165,153]},
                goal : []
            }];

        images = {
            'bordure' : "#000",
            'hero' : "#555",
            'rock' : "#999",
            'floor' : "#ff0000",
            'bomb' : "",
            'hard_rock' : "",
            'button' : "#00ff00",
            'toggle_rock_on' : "0000ff",
            'toggle_rock_off' : "F6A1E1",
            'goal' : ""
        };

        texture = function (x,y,type) {
            this.x = x;
            this.y = y;
            this.type = type;
            this.value = false;
        };

        hero = function (x,y,type,on) {
            this.x = x;
            this.y = y;
            this.type = type;
            this.on = on;
        };

        movableItem = function (x,y,type,on) {
            this.x = x;
            this.y = y;
            this.type = type;
            this.on = on;
        };

        CMB.game = {
            init : function (lvl) {
                var lvl = lvl - 1;
                current_lvl = lvl;
                globals[lvl].$canvas = $("#canvas:first");
                globals[lvl].context = globals[lvl].$canvas[0].getContext('2d');
                CMB.game.draw();
            },
            draw : function () {
                var lvl = current_lvl;
                var i = 216, col = 0, row = 0;

                for (i; i > 0; i--) {

                    var type = "";

                    if ($.inArray(i,globals[lvl].bordures) != -1) {
                        globals[lvl].context.fillStyle = images.bordure;
                        type = "bordure";
                    }
                    else if($.inArray(i,globals[lvl].hero) != -1){
                        globals[lvl].context.fillStyle = images.hero;
                        type = "hero";
                    }
                    else if($.inArray(i,globals[lvl].rock) != -1){
                        globals[lvl].context.fillStyle = images.rock;
                        type = "rock";
                    }
                    else if($.inArray(i,globals[lvl].toggle_rock) != -1){
                        console.log("here");
                        globals[lvl].context.fillStyle = images.toggle_rock_on;
                        type = "toggle_rock_on";
                    }
                    else if($.inArray(i,globals[lvl].button) != -1){
                        globals[lvl].context.fillStyle = images.button;
                        type = "button";
                    }
                    else{
                        globals[lvl].context.fillStyle = images.floor;
                        type = "floor";
                    }
                    globals[lvl].context.fillRect((row * 50),(col * 50), 50, 50);

                    if(type == "hero")
                        var object = new hero(row,col,type,"floor");
                    else if(type == "rock")
                        var object = new movableItem(row,col,type,"floor");
                    else
                        var object = new texture(row,col,type);

                    globals[lvl].entities.cases[i] = object;

                    col++;
                    if (col > 11) {
                        col = 0;
                        row++;
                    }
                }
            },
            gameLoop : function (key) {
                var hero = globals[current_lvl].hero;
                var hero_block = globals[current_lvl].entities.cases[hero];
                var next;
                var newRock = {'on':'false'};

                // move
                if(key == 37){
                    next = parseInt(hero) + 12;
                }
                else if(key == 38){
                    next = parseInt(hero) + 1;
                }
                else if(key == 39){
                    next = hero - 12;
                }
                else if(key == 40){
                    next = hero - 1;
                }
                var next_block = globals[current_lvl].entities.cases[next];

                // collision bord
                if(next_block.type == "bordure" || next_block.type == "toggle_rock_on"){
                    return;
                }
                else if(next_block.type == "rock"){
                    var next_rock;
                    if(key == 37){
                        next_rock = next + 12;
                    }
                    else if(key == 38){
                        next_rock = next + 1;
                    }
                    else if(key == 39){
                        next_rock = next - 12;
                    }
                    else if(key == 40){
                        next_rock = next - 1;
                    }
                    var next_rock_block = globals[current_lvl].entities.cases[next_rock];

                    if(next_rock_block.type == "bordure" || next_rock_block.type == "rock" || next_rock_block.type == "toggle_rock_on")
                        return;

                    newRock = new movableItem(next_rock_block.x,next_rock_block.y,next_block.type,next_rock_block.type);
                    console.log(newRock);
                    globals[current_lvl].context.fillStyle = images.rock;
                    globals[current_lvl].context.fillRect((next_rock_block.x * 50),(next_rock_block.y * 50), 50, 50);
                    globals[current_lvl].entities.cases[next_rock] = newRock;
                }

                if(next_block.type == "button" || hero_block.on == "button" || newRock.on == "button"){
                    var bool, pos;
                    if(hero_block.on == "button"){
                        bool = "on";
                        pos = hero;
                    }
                    else if(newRock.on == "button"){
                        bool = "off";
                        pos = next_rock;
                    }
                    else{
                        bool = "off";
                        pos = next;
                    }

                    var i = globals[current_lvl].toggle_rock_link[pos].length - 1;
                    var arr = globals[current_lvl].toggle_rock_link[pos];
                    for(i; i >= 0; i--){
                        var object = globals[current_lvl].entities.cases[arr[i]];
                        globals[current_lvl].context.fillStyle = images["toggle_rock_" + bool];
                        globals[current_lvl].context.fillRect((object.x * 50),(object.y * 50), 50, 50);
                        globals[current_lvl].entities.cases[arr[i]].type = "toggle_rock_" + bool;
                    }
                }

                // new floor case after move
                console.log(hero_block);
                var floor = new texture(hero_block.x,hero_block.y,hero_block.on);
                globals[current_lvl].context.fillStyle = images[hero_block.on];
                globals[current_lvl].entities.cases[hero] = floor;
                globals[current_lvl].context.fillRect((hero_block.x * 50),(hero_block.y * 50), 50, 50);

                //update hero object
                hero_block.x = next_block.x;
                hero_block.y = next_block.y;
                if(next_block.type == "rock" && next_block.on != "button" && next_block.on != "toggle_rock_off"){
                    hero_block.on = "floor";
                }
                else if(next_block.on == "button" || next_block.on == "toggle_rock_off"){
                    hero_block.on = next_block.on;
                }
                else{
                    hero_block.on = next_block.type;
                }


                // new case of hero
                globals[current_lvl].context.fillStyle = images.hero;
                globals[current_lvl].context.fillRect((next_block.x * 50),(next_block.y * 50), 50, 50);
                globals[current_lvl].entities.cases[next] = hero_block;

                // reset number case of hero
                globals[current_lvl].hero = next;
            }
        };

    })(CMB);

    CMB.game.init(1);
    $(window).keydown(function(e){
        var key = e.keyCode;
        if(key == 37 || key == 38 || key == 39 || key == 40){
            CMB.game.gameLoop(key);
        }
    });

})(jQuery);

