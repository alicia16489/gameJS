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
        var globals, texture, images, current_lvl, hero, item, load, levels_win;

        load = 0;

        levels_win = [];

        globals = {
            1:{
                $canvas : '',

                has_bomb : 'false',
                lose : 'false',
                win : 'false',

                context : '',

                entities : {
                    cases : []
                },

                //config on draw
                floor_img : "./images/floor/floor1.png",
                hero_img : "./images/hero/small/hero_bot.png",
                goal_img : "./images/food/food1.png",

                bordures : [153,152,151,150,149,148,147,
                    141,129,117,105,93,
                    135,123,111,99,87,
                    81,80,79,78,77,76,75],
                hero : [112],
                rock : [127,103,91,125],
                bomb : [88],
                hard_rock : [140],
                hard_rock_on : {140:"fake_goal"},
                button : [113,137],
                toggle_rock : [138,126,114,104,92,
                100,101,89,102],
                toggle_rock_link : {113:[138,126,114,104,92],
                137:[100,101,89,102]},
                goal_suit:[139],
                goal : []
            }};

        images = {
            out : "./images/floor/out.png",
            floor_levels : {
                1:{
                    "floor":"./images/floor/floor1.png"
                },
                2:{
                    "floor":"./images/floor/floor2.png"
                },
                3:{
                    "floor":"./images/floor/floor3.png"
                },
                4:{
                    "floor":"./images/floor/floor4.png"
                },
                5:{
                    "floor":"./images/floor/floor5.png"
                }
            },
            floor : "",
            hero : "",
            goal : "",
            goal_levels : {
                1:{
                    "food":"./images/food/food1.png"
                },
                2:{
                    "food":"./images/food/food2.png"
                },
                3:{
                    "food":"./images/food/food3.png"
                },
                4:{
                    "food":"./images/food/food4.png"
                },
                5:{
                    "food":"./images/food/food5.png"
                }
            },
            hero_levels : {
                1 : {
                    "hero_top" : "./images/hero/small/hero_top.png",
                    "hero_left" : "./images/hero/small/hero_left.png",
                    "hero_right" : "./images/hero/small/hero_right.png",
                    "hero_bot" : "./images/hero/small/hero_bot.png"
                },
                2 : {
                    "hero_top" : "./images/hero/small/hero_top.png",
                    "hero_left" : "./images/hero/small/hero_left.png",
                    "hero_right" : "./images/hero/small/hero_right.png",
                    "hero_bot" : "./images/hero/small/hero_bot.png"
                },
                3 : {
                    "hero_top" : "./images/hero/medium/hero_top.png",
                    "hero_left" : "./images/hero/medium/hero_left.png",
                    "hero_right" : "./images/hero/medium/hero_right.png",
                    "hero_bot" : "./images/hero/medium/hero_bot.png"
                },
                4 : {
                    "hero_top" : "./images/hero/tall/hero_top.png",
                    "hero_left" : "./images/hero/tall/hero_left.png",
                    "hero_right" : "./images/hero/tall/hero_right.png",
                    "hero_bot" : "./images/hero/tall/hero_bot.png"
                },
                5 : {
                    "hero_top" : "./images/hero/rage/hero_top.png",
                    "hero_left" : "./images/hero/rage/hero_left.png",
                    "hero_right" : "./images/hero/rage/hero_right.png",
                    "hero_bot" : "./images/hero/rage/hero_bot.png"
                }
            },
            rock : "./images/items/rock.png",
            toggle_rock_on : "./images/items/toggle_rock_on.png",
            toggle_rock_off : "./images/items/toggle_rock_off.png",
            bomb : "./images/items/bomb.png",
            hard_rock : "./images/items/hard_rock.png",
            button_off : "./images/items/button_off.png",
            button_on : "./images/items/button_on.png",
            fake_goal : "./images/food/badFood.png",
            win : "./images/win.png",
            gameover : "./images/gameover.png"
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
            loadImages : function(imgs){
                var img;
                for(var key in imgs){
                    if($.isPlainObject(imgs[key])){
                        CMB.game.loadImages(imgs[key]);
                    }
                    else{
                        img = new Image();
                        img.src = imgs[key];
                        img.name = key;
                        imgs[key] = img;
                        img.onload = CMB.game.preload;
                    }
              }
            },
            preload : function(){
                var length = Object.keys(images).length;
                load++;
                if(load === length){
                  CMB.game.draw();
                }
            },
            init : function (lvl) {
                current_lvl = lvl;
                globals[lvl].$canvas = $("#canvas");
                globals[lvl].context = globals[lvl].$canvas[0].getContext('2d');

                //config texture lvl in object
                images.hero = globals[lvl].hero_img;
                images.floor = globals[lvl].floor_img;
                images.goal = globals[lvl].goal_img;

                // async preload imgs + draw
                CMB.game.loadImages(images);
                //set objects for config lvl
                globals[lvl].hero_img = images.hero;
                globals[lvl].floor_img = images.floor;
                globals[lvl].goal_img = images.goal;

                console.log(images);
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
                        globals[lvl].context.drawImage(globals[current_lvl].hero_img,(row * 50),(col * 50));
                        type = "hero";
                    }
                    else if($.inArray(i,globals[lvl].rock) != -1){
                        globals[lvl].context.drawImage(images["rock"],(row * 50),(col * 50));
                        type = "rock";
                    }
                    else if($.inArray(i,globals[lvl].goal_suit) != -1){
                        globals[lvl].context.drawImage(images["rock"],(row * 50),(col * 50));
                        type = "goal_suit";
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
                    else if($.inArray(i,globals[lvl].hard_rock) != -1){
                        globals[lvl].context.drawImage(images["hard_rock"],(row * 50),(col * 50));
                        type = "hard_rock";
                    }
                    else{
                        type = "floor";
                    }

                    if(type == "hero")
                        var object = new hero(row,col,type,"floor");
                    else if(type == "rock")
                        var object = new item(row,col,type,"floor","dropable");
                    else if(type == "bomb")
                        var object = new item(row,col,type,"floor","movable");
                    else if(type == "hard_rock"){
                        var underElem = globals[current_lvl].hard_rock_on[i];
                        var object = new item(row,col,type,underElem);
                    }
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

                if($.inArray(current_lvl,levels_win) != -1 || globals[current_lvl].lose == "true")
                    return;

                var hero = globals[current_lvl].hero;
                var hero_block = globals[current_lvl].entities.cases[hero];
                var next;
                var delNext = false;
                var delPrev = false;
                var newRock = {'on':'false'};

                // move
                if(key == 37){
                    next = parseInt(hero) + 12;
                    globals[current_lvl].hero_img = images.hero_levels[current_lvl].hero_left;
                }
                else if(key == 38){
                    next = parseInt(hero) + 1;
                    globals[current_lvl].hero_img = images.hero_levels[current_lvl].hero_top;
                }
                else if(key == 39){
                    next = hero - 12;
                    globals[current_lvl].hero_img = images.hero_levels[current_lvl].hero_right;
                }
                else if(key == 40){
                    next = hero - 1;
                    globals[current_lvl].hero_img = images.hero_levels[current_lvl].hero_bot;
                }
                var next_block = globals[current_lvl].entities.cases[next];
                globals[current_lvl].context.drawImage(images[hero_block.on],(hero_block.x * 50),(hero_block.y * 50));
                globals[current_lvl].context.drawImage(globals[current_lvl].hero_img,(hero_block.x * 50),(hero_block.y * 50));

                if(key == 66){
                    var sigh = globals[current_lvl].hero_img.name.replace("hero_","");
                    console.log(sigh);
                    if(sigh == "left"){
                        next = parseInt(hero) + 12;
                    }
                    else if(sigh == "top"){
                        next = parseInt(hero) + 1;
                    }
                    else if(sigh == "right"){
                        next = hero - 12;
                    }
                    else if(sigh == "bot"){
                        next = hero - 1;
                    }
                    var next_block = globals[current_lvl].entities.cases[next];
                    if(next_block.type == "hard_rock" && globals[current_lvl].has_bomb == "true"){
                        globals[current_lvl].context.drawImage(images["floor"],(next_block.x * 50),(next_block.y * 50));

                        var floor = new item(next_block.x,next_block.y,"fake_goal","floor");
                        globals[current_lvl].context.drawImage(images[next_block.on],(next_block.x * 50),(next_block.y * 50));
                        globals[current_lvl].entities.cases[next] = floor;

                        if(next_block.on == "fake_goal"){
                            var goal = globals[current_lvl].goal_suit[0];
                            var goal_case = globals[current_lvl].entities.cases[goal];
                            var floor = new item(goal_case.x,goal_case.y,"goal","floor");
                            globals[current_lvl].context.drawImage(images["floor"],(goal_case.x * 50),(goal_case.y * 50));
                            globals[current_lvl].context.drawImage(images[floor.type],(goal_case.x * 50),(goal_case.y * 50));
                            globals[current_lvl].entities.cases[goal] = floor;
                        }
                    }
                }

                // collision bord
                if(next_block.type == "bordure"
                    || next_block.type == "toggle_rock_off"
                    || next_block.type == "hard_rock"
                    || next_block.type == "goal_suit"
                    ){
                    return;
                }
                else if(hero_block.on == "button_on" && next_block.type == "toggle_rock_on"){
                    var arr = globals[current_lvl].toggle_rock_link[hero];
                    console.log(next);
                    console.log(arr);
                    if($.inArray(next,arr) != -1){
                        return;
                    }
                }

                if(next_block.type == "rock"){
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

                    if(next_rock_block.type == "bordure"
                        || next_rock_block.type == "rock"
                        || next_rock_block.type == "toggle_rock_off"
                        || next_rock_block.type == "hard_rock"
                        || next_rock_block.type == "goal_suit"
                        )
                        return;

                    if(next_block.on == "button_on" && next_rock_block.type == "toggle_rock_on"){
                        var arr = globals[current_lvl].toggle_rock_link[next];
                        console.log(next);
                        console.log(arr);
                        if($.inArray(next_rock,arr) != -1){
                            return;
                        }
                    }

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
                    delNext = true;
                    globals[current_lvl].has_bomb = "true";
                }
                else if(next_block.type == "fake_goal"){
                    delNext = true;
                    globals[current_lvl].lose = "true";
                }
                else if(next_block.type == "goal"){
                    delNext = true;
                    levels_win.push(current_lvl);
                    globals[current_lvl].win = "true";
                }

                if(hero_block.on == "bomb"){
                    delPrev = true;
                }

                if(next_block.type == "button_off" || hero_block.on == "button_on" || next_block.on == "button_on"){
                    var bool, pos;
                    if(hero_block.on == "button_on"){
                        bool = "off";
                        pos = hero;
                    }
                    else{
                        bool = "on";
                        pos = next;
                    }

                    var i = globals[current_lvl].toggle_rock_link[pos].length - 1;
                    var arr = globals[current_lvl].toggle_rock_link[pos];
                    for(i; i >= 0; i--){
                        var object = globals[current_lvl].entities.cases[arr[i]];
                        globals[current_lvl].context.drawImage(images["toggle_rock_" + bool],(object.x * 50),(object.y * 50));
                        globals[current_lvl].entities.cases[arr[i]].type = "toggle_rock_" + bool;
                    }

                    if(bool == "on"){
                        globals[current_lvl].context.drawImage(images["floor"],(next_block.x * 50),(next_block.y * 50));
                        globals[current_lvl].context.drawImage(images["button_on"],(next_block.x * 50),(next_block.y * 50));
                    }
                    else{
                        globals[current_lvl].context.drawImage(images["floor"],(hero_block.x * 50),(hero_block.y * 50));
                        hero_block.on = "button_off";
                    }
                }

                if(newRock.on == "button_on"){
                    var bool, pos;
                    bool = "on";
                    pos = next_rock;

                    var i = globals[current_lvl].toggle_rock_link[pos].length - 1;
                    var arr = globals[current_lvl].toggle_rock_link[pos];
                    for(i; i >= 0; i--){
                        var object = globals[current_lvl].entities.cases[arr[i]];
                        globals[current_lvl].context.drawImage(images["toggle_rock_" + bool],(object.x * 50),(object.y * 50));
                        globals[current_lvl].entities.cases[arr[i]].type = "toggle_rock_" + bool;
                    }

                    globals[current_lvl].context.drawImage(images["floor"],(next_rock_block.x * 50),(next_rock_block.y * 50));
                    globals[current_lvl].context.drawImage(images["button_on"],(next_rock_block.x * 50),(next_rock_block.y * 50));
                    globals[current_lvl].context.drawImage(images["rock"],(next_rock_block.x * 50),(next_rock_block.y * 50));
                }


                // new floor case after move
                if(delPrev)
                {
                    hero_block.on = "floor";
                }
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
                if(delNext){
                    globals[current_lvl].context.drawImage(images["floor"],(next_block.x * 50),(next_block.y * 50));
                }
                globals[current_lvl].context.drawImage(globals[current_lvl].hero_img,(next_block.x * 50),(next_block.y * 50));
                globals[current_lvl].entities.cases[next] = hero_block;

                // reset number case of hero
                globals[current_lvl].hero = next;

                if(globals[current_lvl].win == "true"){
                    globals[current_lvl].context.drawImage(images["win"],0,0);
                }
                else if(globals[current_lvl].lose == "true"){
                    globals[current_lvl].context.drawImage(images["gameover"],0,0);
                }
            }
        };

    })(CMB);

    CMB.game.init(1);
    $(window).keydown(function(e){
        var key = e.keyCode;
        if(key == 37 || key == 38 || key == 39 || key == 40 || key == 66){
            CMB.game.gameLoop(key);
        }
    });

})(jQuery);

