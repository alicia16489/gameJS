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
        var globals, texture, images, current_lvl, hero, item, load, game;

        load = 0;

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
                bomb : [151],
                hard_rock : [176],
                button : [176],
                toggle_rock : [201,189,177,165,153],
                toggle_rock_link : {176:[201,189,177,165,153]},
                goal : []
            }];

        /*images = {
            'bordure' : "#000",
            'hero' : "#555",
            'rock' : "#999",
            'floor' : "#ff0000",
            'bomb' : "EEA443",
            'hard_rock' : "",
            'button' : "#00ff00",
            'toggle_rock_on' : "0000ff",
            'toggle_rock_off' : "F6A1E1",
            'goal' : ""
        };*/

        images = {
            'floor' : "./images/floor/floor0.png",
            'out' : "./images/floor/out.png",
            "hero_bot" : "./images/hero/hero_bot.png",
            "rock" : "./images/items/rock.png",
            "toggle_rock_on" : "./images/items/toggle_rock_on.png",
            "toggle_rock_off" : "./images/items/toggle_rock_off.png",
            "bomb" : "./images/items/bomb.png",
            "button_off" : "./images/items/button_off.png",
            "button_on" : "./images/items/button_on.png"
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

        item = function (x,y,type,on,prev) {
            this.x = x;
            this.y = y;
            this.type = type;
            this.on = on;
            this.prev = prev;
        };

        CMB.game = {
            loadImages : function(){
              var img;

              for(var key in images){
                  img = new Image();
                  img.src = images[key];
                  images[key] = img;
                  img.onload = CMB.game.preload;
              }
            },
            preload : function(){
                var length = Object.keys(images).length;

                load++;
                console.log(images,load);
                if(load === length){
                  CMB.game.draw();
                }

            },
            init : function (lvl) {
                var lvl = lvl - 1;
                current_lvl = lvl;
                globals[lvl].$canvas = $("#canvas:first");
                globals[lvl].context = globals[lvl].$canvas[0].getContext('2d');
                CMB.game.loadImages();
            },
            draw : function () {
                var lvl = current_lvl;
                var i = 216, col = 0, row = 0;

                for (i; i > 0; i--) {

                    var type = "";
                    globals[lvl].context.drawImage(images["floor"],(row * 50),(col * 50));

                    if ($.inArray(i,globals[lvl].bordures) != -1) {
                        globals[lvl].context.drawImage(images["out"],(row * 50),(col * 50));
                        type = "bordure";
                    }
                    else if($.inArray(i,globals[lvl].hero) != -1){
                        globals[lvl].context.drawImage(images["hero_bot"],(row * 50),(col * 50));
                        type = "hero";
                    }
                    else if($.inArray(i,globals[lvl].rock) != -1){
                        globals[lvl].context.drawImage(images["rock"],(row * 50),(col * 50));
                        type = "rock";
                    }
                    else if($.inArray(i,globals[lvl].toggle_rock) != -1){
                        globals[lvl].context.drawImage(images["toggle_rock_off"],(row * 50),(col * 50));
                        type = "toggle_rock_off";
                    }
                    else if($.inArray(i,globals[lvl].button) != -1){
                        globals[lvl].context.drawImage(images["button_off"],(row * 50),(col * 50));
                        type = "button_off";
                    }
                    else if($.inArray(i,globals[lvl].bomb) != -1){
                        globals[lvl].context.drawImage(images["bomb"],(row * 50),(col * 50));
                        type = "bomb";
                    }
                    else{
                        type = "floor";
                    }

                    if(type == "hero")
                        var object = new hero(row,col,type,"floor");
                    else if(type == "rock")
                        var object = new item(row,col,type,"floor","dropable");
                    else if(type == "bomb")
                        var object = new item(row,col,type,"floor","movpable");
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
                if(next_block.type == "bordure" || next_block.type == "toggle_rock_off"){
                    return;
                }
                else if(next_block.type == "rock"){
                    var next_rock,prev;
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

                    if(next_rock_block.type == "bordure" || next_rock_block.type == "rock" || next_rock_block.type == "toggle_rock_off")
                        return;

                    var type;
                    prev = next_block.on;

                    globals[current_lvl].context.drawImage(images["floor"],(next_block.x * 50),(next_block.y * 50));

                    if(prev == "toggle_rock_on")
                        globals[current_lvl].context.drawImage(images["toggle_rock_on"],(next_block.x * 50),(next_block.y * 50));

                    if(next_rock_block.type == "button_off")
                        type = "button_on";
                    else
                        type = next_rock_block.type;

                    newRock = new item(next_rock_block.x,next_rock_block.y,next_block.type,type,prev);
                    globals[current_lvl].context.drawImage(images["rock"],(next_rock_block.x * 50),(next_rock_block.y * 50));
                    globals[current_lvl].entities.cases[next_rock] = newRock;
                }
                else if(next_block.type == "bomb"){

                }

                console.log(next_block);
                if(next_block.type == "button_off" || hero_block.on == "button_on" || newRock.on == "button_on" || next_block.on == "button_on"){
                    var bool, pos;
                    if(hero_block.on == "button_on"){
                        bool = "off";
                        pos = hero;
                    }
                    else if(newRock.on == "button_on"){
                        bool = "on";
                        pos = next_rock;
                    }
                    else{
                        bool = "on";
                        pos = next;
                    }

                    console.log(pos);

                    var i = globals[current_lvl].toggle_rock_link[pos].length - 1;
                    var arr = globals[current_lvl].toggle_rock_link[pos];
                    for(i; i >= 0; i--){
                        var object = globals[current_lvl].entities.cases[arr[i]];
                        globals[current_lvl].context.drawImage(images["toggle_rock_" + bool],(object.x * 50),(object.y * 50));
                        globals[current_lvl].entities.cases[arr[i]].type = "toggle_rock_" + bool;
                    }

                    console.log("here");

                    if(newRock.on == "button_on" && bool == "on"){
                        console.log("brick");
                        globals[current_lvl].context.drawImage(images["floor"],(next_rock_block.x * 50),(next_rock_block.y * 50));
                        globals[current_lvl].context.drawImage(images["button_on"],(next_rock_block.x * 50),(next_rock_block.y * 50));
                        globals[current_lvl].context.drawImage(images["rock"],(next_rock_block.x * 50),(next_rock_block.y * 50));

                    }
                    else if(bool == "on"){
                        console.log("seul");
                        globals[current_lvl].context.drawImage(images["floor"],(next_block.x * 50),(next_block.y * 50));
                        globals[current_lvl].context.drawImage(images["button_on"],(next_block.x * 50),(next_block.y * 50));
                    }
                    else{
                        console.log("here3");
                        globals[current_lvl].context.drawImage(images["floor"],(hero_block.x * 50),(hero_block.y * 50));
                        hero_block.on = "button_off";
                    }

                }

                console.log(hero_block);
                // new floor case after move
                var floor = new texture(hero_block.x,hero_block.y,hero_block.on);
                globals[current_lvl].context.drawImage(images[hero_block.on],(hero_block.x * 50),(hero_block.y * 50));
                globals[current_lvl].entities.cases[hero] = floor;

                //update hero object
                hero_block.x = next_block.x;
                hero_block.y = next_block.y;
                if(prev == "toggle_rock_on"){
                    hero_block.on = "toggle_rock_on";
                }
                else if(next_block.type == "rock" && next_block.on != "button_off" && next_block.on != "toggle_rock_off" && prev != "button_on"){
                    hero_block.on = "floor";
                }
                else if(next_block.on == "button_off" || next_block.on == "toggle_rock_off"){
                    hero_block.on = next_block.on;
                }
                else if(next_block.type == "button_off"){
                    hero_block.on = "button_on";
                }
                else if(prev == "button_on"){
                    hero_block.on = "button_on";
                }
                else{
                    hero_block.on = next_block.type;
                }

                // new case of hero
                globals[current_lvl].context.drawImage(images["hero_bot"],(next_block.x * 50),(next_block.y * 50));
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

