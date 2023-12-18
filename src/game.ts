const GAME_BOARD = [
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~"
];

const LOW_LEVEL_PLANTS = ['.', ','];
const MED_LEVEL_PLANTS = ['*', '~', '^'];
const HIGH_LEVEL_PLANTS = ['#', '%', '&'];

const NUM_OPEN_SPACES = 100;

const INVENTORY_SPACE = 15;

const START_PLANTS = 3;

function getRandomElementFromArray(arr: string[]) {
    if (arr.length === 0) {
        return "";
    }
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}


class EventHandler {
    private plot: Plot;
    private inventory: Inventory;
    private market: Market;

    constructor(plot: Plot, inventory: Inventory, market: Market) {
        this.plot = plot;
        this.inventory = inventory;
        this.market = market;
        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        this.initializePlot();
        this.initializeInventory();
        this.initializeMarket();
    }

    // TODO populate rows at once instead of incrementally
    private initializePlot(): void {
        let counter = 0;
        for (let i = 0; i < this.plot.board.length; i++) {
            let row = this.plot.board[i];
            for (let j = 0; j < row.length; j++) {
                let char = row[j];
                let $span = $(`<span id=slot${counter}>`).text(char);
                $span.addClass("slot");
                counter += 1;
                $span.on('mouseover', this.plot.displayPlant)
                .on('mouseleave', () => { $("#selectedSpace").html(""); });
                $("#plot1").append($span);
            }
            $("#plot1").append('\n');
        }
    }

    private initializeInventory(): void {
        for (let i = 0; i < INVENTORY_SPACE; i++) {
            let $space = $(`<div id=inventory${i}>`).text("empty");
            $("#inventory_contents").append($space);
            $space.on("mouseover", () => {
                $space.addClass("hovering");
            }).on("mouseleave", () => {
                $space.removeClass("hovering");
            }).on("click", () => {
                $space.removeClass("hovering");
                $space.addClass("selected");
                $space.on("click", () => {
                    $space.removeClass("selected");
                });
                let parsedString = this.parseString($space.html());
                if (parsedString !== "") {
                    this.addPlantSeed(parsedString);
                }
            });
        }
    }

    private parseString(str: string): string {
        const inputString = str;
        const match = inputString.match(/\b\w+\b/);
        if (match) {
            return match[0];
        } else {
            return "";
        }

    }

    private addPlantSeed(seed: string): void {
        $("#board_container").children().each((index, board) => {
            $(board).children().each((index, element) => {
                $(element).on("mouseover", () => {
                    $(element).addClass("hovering");
                }).on("mouseleave", () => {
                    $(element).removeClass("hovering");
                }).on("click", () => {
                    $(element).removeClass("hovering");
                    this.plot.plant(index, seed);
                    this.inventory.remove(index, seed);
                })
            })
        });
    }

    private initializeMarket(): void {

    }


}

class Plant {
    private level: number;
    public species: string;

    constructor(species: string) {
        this.level = 0;
        this.species = species;
    }

    public display(): void {
        // TODO
    }
}

class Plot {
    private contents: Map<number, Plant>;
    public board: string[] = GAME_BOARD;

    constructor() {
        this.contents = new Map();
        this.displayPlant = this.displayPlant.bind(this);
    }


    public displayPlant(event: { target: any; }): void {
        let slot = event.target;
        let id = slot.id[5];
        if (this.contents.has(id)) {
            let plant = this.contents.get(id);
            if (plant) {
                plant.display();
            }
        } else {
            $("#selectedSpace").html("empty");
        }
    }

    public plant(id: number, seed: string): boolean {
        let space = $(`#slot${id}`);
        let icon = getRandomElementFromArray(LOW_LEVEL_PLANTS);
        space.html(icon);
        space.css("color", "green");
        this.contents.set(id, new Plant(seed));

        return true;
    }
}

interface InventoryValue {
    plant: string;
    quantity: number;
}

class Inventory {
    private contents: Map<number, InventoryValue>;

    constructor() {
        this.contents = new Map();
        this.insert("wheat", START_PLANTS);
    }

    private selectSpace(): void {
        $("#plot1").children().each((index, element) => {
            $(element).on("mouseenter", () => {
                $(element).addClass("hovering");
            }).on("mouseleave", () => {
                $(element).removeClass("hovering");
            }).on("click", () => {
                $(element).removeClass("hovering");
            });
        });
    }

    public insert(seed: string, number: number): number {
        for (let i = 1; i <= INVENTORY_SPACE; i++) {
            if (!this.contents.hasOwnProperty(i)) {
                let val = {
                    plant: seed,
                    quantity: number
                }
                this.contents.set(i, val);
                return i;
            }
        }
        return 0;
    }

    public remove() {

    }
}

class Market {

}

class Game {
    private plot: Plot;
    private inventory: Inventory;
    private market: Market;
    private eventHandler: EventHandler;

    constructor() {
        this.plot = new Plot();
        this.inventory = new Inventory();
        this.market = new Market();
        this.eventHandler = new EventHandler(this.plot, this.inventory, this.market);
        this.inventory.insert("wheat", 3);
        $("#inventory0").html("- wheat: 3");
    }
}

const game = new Game();