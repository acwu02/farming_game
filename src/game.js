var GAME_BOARD = "~~~~~~~~~~~~~~~~~~~~\n~~~~~~~~~~~~~~~~~~~~\n~~~~~~~~~~~~~~~~~~~~\n~~~~~~~~~~~~~~~~~~~~\n~~~~~~~~~~~~~~~~~~~~";
var Plot = /** @class */ (function () {
    function Plot(boardString) {
        this.board = boardString.split('');
    }
    return Plot;
}());
var Game = /** @class */ (function () {
    function Game() {
        this.plot = new Plot(GAME_BOARD);
        GAME_BOARD.split('').forEach(function (char) {
            var $span = $('<span>').text(char);
            $span.on('mouseover', function () {
                $("#selectedSpace").html("bababa");
            });
            $("#game").append($span);
        });
    }
    return Game;
}());
var game = new Game();
