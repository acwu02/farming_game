const GAME_BOARD = [
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~"
];

class Plant {
    private level: number;
    private name: string;

    constructor(name: string) {
        this.level = 0;
        this.name = name;
    }

    public display(): void {

    }
}

class Plot {
    private board: string[];
    private contents: Plant[] = [];

    constructor(board: string[]) {
        this.board = board;
        this._initializeEventListeners();
    }

    // TODO populate rows at once instead of incrementally
    private _initializeEventListeners(): void {
        for (let i = 0; i < this.board.length; i++) {
            let row = this.board[i];
            for (let j = 0; j < row.length; j++) {
                let char = row[j];
                let $span = $('<span>').text(char);
                $span.on('mouseover', this._displayPlant);
                $span.on('mouseleave', () => {
                    $("#selectedSpace").html("");
                })
                $("#board").append($span);
            }
            $("#board").append('\n');
        }
    }

    private _displayPlant(event: { target: any; }): void {
        let slot = event.target;
        let id = slot.id[5];
        if (id ) {
            let plant = this.contents[id];
            plant.display();
        } else {
            $("#selectedSpace").html("empty");
        }
    }
}

class Inventory {

}

class Market {

}

class Game {
    private plot: Plot;

    constructor() {
        this.plot = new Plot(GAME_BOARD);
        $("#market").click(() => {
            alert("market");
        });
        $("#inventory").click(() => {
            alert("inventory");
        });
    }
}

const game = new Game();