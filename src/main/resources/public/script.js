$(function(){




    //--- Subfunctions

    var playerColors = {
        a : 'pink',
        b : 'blue'
    }
    var turns = ['ne', 'es', 'sw', 'wn'];

    function onUserInput(callback){
        var listening = true;
        $(document).keydown(function(e){
            if(! listening){
                return;
            }
            var dir = getDirectionForKeyCode(e.keyCode);
            if (dir != null) {
                listening = false;
                callback(dir);
            }
        });
    }
    function getDirectionForKeyCode(keyCode){
        switch(keyCode){
            case 37 : return 'w';
            case 38 : return 'n';
            case 39 : return 'e';
            case 40 : return 's';
            default : return null
        }
    }
    function getCell(pos) {
        return $("table tr:nth-child(" + (pos.y + 1) +") td:nth-child(" + (pos.x + 1) +")");
    }
    function translateDirectionLettersIntoTurn(directionLetterFrom, directionLetterTo){
        var turn = directionLetterFrom + directionLetterTo;
        if($.inArray(turn, turns) !== -1){
            return turn;
        }
        return translateDirectionLettersIntoTurn(directionLetterTo, directionLetterFrom);
    }
    function translateDirectionLetterIntoAxis(directionLetter){
        return directionLetter == 'n' || directionLetter == 's'
               ? 'vertical'
               : 'horizontal';
    }
    function markPlayerPartial(pos, directionLetter, playerLetter){
        setTrackBackgroundImage(pos, playerLetter,  'partial_' + directionLetter);
    }
    function markPlayerStart(pos, playerLetter){
        setTrackBackgroundImage(pos, playerLetter, 'dot');
    }
    function markPlayerStraightLine(pos, directionLetter, playerLetter){
        setTrackBackgroundImage(pos, playerLetter,  'straight_' + translateDirectionLetterIntoAxis(directionLetter));
    }
    function markPlayerTurn(pos, directionLetterFrom, directionLetterTo, playerLetter){
        setTrackBackgroundImage(pos, playerLetter,  'turn_' + translateDirectionLettersIntoTurn(directionLetterFrom, directionLetterTo));
    }
    function markByCompletingIntoNextDirection(pos, directionLetterTo, playerLetter){
        if(isDot(pos)){
            //turn the dot into a partial
            markPlayerPartial(pos, directionLetterTo, playerLetter);
        } else {
            //turn the partial into a straight line or a turn
            markByCompletingPartial(pos, directionLetterTo, playerLetter);
        }
    }
    function markByCompletingPartial(pos, directionLetterTo, playerLetter){
        var directionLetterFrom = readOriginDirectionAtPos(pos);
        if(isTurn(directionLetterFrom, directionLetterTo)){
            markPlayerTurn(pos, directionLetterFrom, directionLetterTo, playerLetter);
        } else {
            markPlayerStraightLine(pos, directionLetterTo, playerLetter);
        }
    }
    function isDot(pos){
        return getCell(pos).css('background-image').indexOf('_dot') != -1;
    }
    function isTurn(directionLetterFrom, directionLetterTo){
        if(directionLetterFrom == "n" || directionLetterFrom == "s"){
            return directionLetterTo == "e" || directionLetterTo == "w";
        }
        return directionLetterTo == "n" || directionLetterTo == "s";
    }
    function getOppositeDirection(directionLetter){
        switch (directionLetter){
            case 'n' : return 's';
            case 's' : return 'n';
            case 'e' : return 'w';
            case 'w' : return 'e';
        }
    }
    function readOriginDirectionAtPos(pos){
        var url = getCell(pos).css('background-image');
        if(url.indexOf("partial") == -1){
            console.error("trying to read the origin direction at a cell which doesn't have the 'partial' image");
        }
        var regexp = /.*_([ensw])\.png.*/;
        return url.replace(regexp, "$1");
    }
    function setTrackBackgroundImage(pos, playerLetter, fileNameCore){
        setBackgroundImage(pos, 'track_' + playerColors[playerLetter] + '_' + fileNameCore + '.png');
    }
    function setBackgroundImage(pos, fileName){
        getCell(pos).css('background-image', 'url(\'img/' + fileName + '\')');
    }
    function applyBackgroundColor(pos, playerLetter){
        getCell(pos).css('background-color', playerLetter == 'a' ? '#fdd' : '#ddf');
        getCell(pos).css('border', 0);
    }
    function applyMove(pos, move){
        return {
            x : move == "n" || move == "s"
                ? pos.x
                : (move == "w"
                    ? pos.x - 1
                    : pos.x + 1),
            y : move == "w" || move == "e"
                ? pos.y
                : (move == "n"
                    ? pos.y - 1
                    : pos.y + 1)
        }
    }
    function log(msg){
        $("#log").append("<p>" + msg + "</p>");
    }


    //-- Core function
    function loop(){
        onUserInput(function(directionLetter){
            markByCompletingIntoNextDirection(aPos, directionLetter, 'a');
            aPos = applyMove(aPos, directionLetter);
            //display the new pos with a partial
            markPlayerPartial(aPos, getOppositeDirection(directionLetter), 'a');
            applyBackgroundColor(aPos, 'a');
            //ask the server
            $.get("/next", {
                move : directionLetter
            }).done(function(res){
                if(res.playerDied){
                    log("You lost.");
                } else {
                    //complete the display of the previous pos
                    markByCompletingIntoNextDirection(bPos, res.botMove, 'b');
                    if(res.botDied){
                        log("The opponent lost.")
                    } else {
                        bPos = applyMove(bPos, res.botMove);
                        //display the new pos with a partial
                        markPlayerPartial(bPos, getOppositeDirection(res.botMove), 'b');
                        applyBackgroundColor(bPos, 'b');
                        loop();
                    }
                }
            });
        });
    }

    $(function(){
        //-- Launch
        markPlayerStart(aPos, "a");
        markPlayerStart(bPos, "b");
        applyBackgroundColor(aPos, 'a');
        applyBackgroundColor(bPos, 'b');
        loop();
    });

});