const GAME_BOARD = [
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~~~~~~~"
];

const PLANT_STAGES = ["germinating", "seedling", "mature"];

const LOW_LEVEL_PLANTS = ['.', ','];
const MED_LEVEL_PLANTS = [';', ':'];
const HIGH_LEVEL_PLANTS = ['Y', 'T', 'V'];

// # of seconds until maturity
interface PLANT_LEVELS {
    [key: string]: PLANT_TYPE;
}

interface PLANT_TYPE {
    maturity: number,
    worth: number
}

interface PLANT_ICONS {
    [key: string]: string[];
}

const PLANT_LEVELS: PLANT_LEVELS = {
    wheat: {
        maturity: 10, // in seconds
        worth: 1,
    },
};

const PLANT_ICONS: PLANT_ICONS = {
    "germinating": LOW_LEVEL_PLANTS,
    "seedling": MED_LEVEL_PLANTS,
    "mature": HIGH_LEVEL_PLANTS
};

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

// Controller superclass for hoverable/selectable elems
class Hoverable {
    public htmlElem: JQuery<HTMLElement>
    private parentElem: JQuery<HTMLElement>

    constructor(htmlElem: JQuery<HTMLElement>, parentElem: JQuery<HTMLElement>) {
        this.htmlElem = htmlElem;
        this.parentElem = parentElem;
        this.addHovering = this.addHovering.bind(this);
        this.removeHovering = this.removeHovering.bind(this);
        this.appendToParent();
    }

    public initHover(onClick: (data: any) => any, arg: any,
        onHover: (() => any) | null,
        onRemoveHover: (() => any) | null): void {
        this.htmlElem
            .on("mouseover", () => {
                if (onHover) {
                    onHover();
                }
            })
            .on("mouseleave", () => {
                if (onRemoveHover) {
                    onRemoveHover();
                }
            })
            .on("click", () => onClick(arg));
    }

    public addHovering(): void {
        this.htmlElem.addClass("hovering");
    }

    public removeHovering(): void {
        this.htmlElem.removeClass("hovering");
    }

    private appendToParent(): void {
        this.parentElem.append(this.htmlElem);
    }
}

// Controller for individual spans
class Span extends Hoverable {
    public id: number;
    public plant: Plant | null;

    constructor(id: number, plant: Plant | null) {
        super($(`<span id=slot${id}>`), $("#plot1"));
        this.id = id;
        this.plant = plant;
        this.selectPlotSpace = this.selectPlotSpace.bind(this);
        this.onPlotHover = this.onPlotHover.bind(this);
        this.onPlotRemoveHover = this.onPlotRemoveHover.bind(this);
        this.initHover(this.selectPlotSpace, null, this.onPlotHover, this.onPlotRemoveHover);
        this.setTilde();
    }

    public displayPlant(): void {
        if (this.plant) {
            $(`#selectedSpace`).html(`${this.plant.species}, ${this.plant.stage}`);
            if (this.plant && this.plant.isMature()) {
                $(`#selectedSpace`).append("<br>click to harvest");
            }
        } else {
            $(`#selectedSpace`).html("empty");
        }
    }

    public addPlantSeed(seed: string | null, plantSeed: () => any): void {
        this.htmlElem.on("click", () => {
            plantSeed();
        })
    }

    public removePlantSeed(): void {
        this.htmlElem.off("mouseover", this.addHovering)
            .off("mouseleave", this.removeHovering)
            .off("click");
    }

    private onPlotHover(): void {
        this.updateSelectedPlotSpace();
        this.addHovering();
    }

    private onPlotRemoveHover(): void {
        this.removeSelectedPlotSpace();
        this.removeHovering();
    }

    private updateSelectedPlotSpace(): void {
        if (this.plant) {
            $(`#selectedSpace`).html(`${this.plant.species}, ${this.plant.stage}`);
            if (this.plant && this.plant.isMature()) {
                $(`#selectedSpace`).append("<br>click to harvest");
            }
        } else {
            $(`#selectedSpace`).html("empty");
        }
    }

    private removeSelectedPlotSpace(): void {
        $(`#selectedSpace`).html("");
    }

    private setTilde(): void {
        this.htmlElem.html("~");
    }

    private selectPlotSpace(): void {
        if (!this.plant) {
            this.populateSpace();
        } else if (this.plant.isMature()) {
            this.clearSpace();
        }
    }

    private populateSpace(): void {
        this.htmlElem.html(getRandomElementFromArray(LOW_LEVEL_PLANTS));
        this.htmlElem.css("color", "green");
    }

    private clearSpace(): void {
        this.htmlElem.html("~");
        this.htmlElem.css("color", "brown");
    }

    // private initEventListeners(): void {
    //     this.htmlElem.addClass("slot");
    //     this.htmlElem.on('mouseover', this.displayPlant)
    //         .on('mouseleave', () => {
    //             $("#selectedSpace").html("");
    //         })
    //         .on('click', () => {
    //             this.displayPlant();
    //         });
    // }
}

class InventorySlot extends Hoverable {
    public seed: string;
    public quantity: number;

    public id: number;
    private onClick: (data: any) => any;
    private disablePlantSeed: () => any;

    constructor(id: number, seed: string, quantity: number,
        onClick: (data: any) => any,
        disablePlantSeed: () => any) {
        super($(`<div id=inventory${id}>`),
            $("#inventory_contents"));
        this.id = id;
        this.seed = seed;
        this.quantity = quantity;
        this.onClick = onClick;
        this.disablePlantSeed = disablePlantSeed;
        this.select = this.select.bind(this);
        this.deselect = this.deselect.bind(this);;
        this.initHover(() => {
            this.onClick(this);
        }, null,
            this.addHovering, this.removeHovering
        );
        this.updateState();
    }

    public select(): void {
        this.htmlElem.off("click");
        this.htmlElem.addClass("selected");
        this.htmlElem.on("click", () => {
            this.deselect();
            this.disablePlantSeed();
        });
    }

    public decrement(): void {
        this.quantity -= 1;
        this.updateState();
    }

    private updateState(): void {
        if (this.quantity === 0) {
            this.seed = "";
            this.deselect();
            this.htmlElem.html("- empty");
        } else {
            this.htmlElem.html(`- ${this.seed}: ${this.quantity}`);
        }
    }

    private deselect(): void {
        this.htmlElem.off("click");
        this.htmlElem.removeClass("selected");
        this.htmlElem.on("click", () => {
            this.onClick(this);
        });
    }
}

// Model for localStorage API
class LocalStorage {
    constructor() {}

    public update(data: string, plotSize: number): void {
        let clientData = localStorage.getItem('clientData');
        if (clientData) {
            let parsedData = this.parseClientData(clientData);
            if (plotSize >= parsedData.length) {
                localStorage.setItem('clientData', data);
            }
        } else {
            localStorage.setItem('clientData', data);
        }
    }

    public load(): [number, Plant][] | undefined {
        let fetchedData = localStorage.getItem('clientData');
        if (fetchedData) {
            return JSON.parse(fetchedData);
        }
    }

    private parseClientData(data: string): [number, Plant][] {
        let parsedArray: [number, Plant][] = JSON.parse(data);
        return parsedArray;
    }

}

// Controller for global event listeners
class EventHandler {
    private plot: Plot;
    private inventory: Inventory;
    private market: Market;
    private spans: Map<number, Span>;
    private localStorage: LocalStorage;

    constructor(plot: Plot, inventory: Inventory, market: Market) {
        this.plot = plot;
        this.inventory = inventory;
        this.market = market;
        this.spans = new Map();
        this.localStorage = new LocalStorage();
        this.selectSlot = this.selectSlot.bind(this);
        this.updateClientStorage = this.updateClientStorage.bind(this);
        this.addPlantHandlers = this.addPlantHandlers.bind(this);
        this.removePlantHandlers = this.removePlantHandlers.bind(this);
        this.initializeEventListeners();
        this.addLoad();
        setInterval(() => {
            this.updateClientStorage();
        }, 1000);
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
                // $("#plot1").append($(`<span id=slot${counter}>`).text(char));
                let span = new Span(counter, null);
                counter += 1;
                this.spans.set(counter, span);
            }
            $("#plot1").append('\n');
        }
    }

    private initializeInventory(): void {
        let firstInventorySlot = new InventorySlot(0, "wheat", 3, this.selectSlot, this.removePlantHandlers);
        for (let i = 1; i < INVENTORY_SPACE; i++) {
            let inventorySlot = new InventorySlot(i, "", 0, this.selectSlot, this.removePlantHandlers);
        }
    }

    private selectSlot(inventorySlot: InventorySlot): void {
        event?.preventDefault();
        if (inventorySlot.seed) {
            inventorySlot.select();
            this.addPlantHandlers(inventorySlot);
        } else {
            alert("Slot empty");
        }
    }

    private addPlantHandlers(inventorySlot: InventorySlot): void {
        for (let [slotID, span] of this.spans) {
            span.addPlantSeed(inventorySlot.seed, () => {
                this.plantSeed(span, inventorySlot);
            });
        }
    }

    private removePlantHandlers(): void {
        for (let [slotID, span] of this.spans) {
            span.removePlantSeed();
        }
    }

    private plantSeed(plotSpace: Span, inventorySlot: InventorySlot): void {
        let seed = inventorySlot.seed;
        let plant = this.plot.plant(plotSpace.id, seed);
        plotSpace.plant = plant;
        this.inventory.remove(seed);
        inventorySlot.decrement();
    }

    private updateClientStorage(): void {
        let plotData = JSON.stringify(Array.from(this.plot.contents));
        this.localStorage.update(plotData, this.plot.contents.size);
    }

    private addLoad(): void {
        window.addEventListener('load', () => {
            if (localStorage.getItem('clientData') === null) {
                localStorage.setItem('clientData', "[]");
            } else {
                this.loadClientStorage();
            }
        })
    }

    private loadClientStorage(): void {
        let data = this.localStorage.load();
        if (data) {
            for (let [key, plant] of data) {
                let plantInstance = new Plant(plant.species, plant.slotID, plant.level);
                this.plot.set(plant.slotID, plantInstance);
                // TODO update spans
                this.updateSpan(plant.slotID + 1, plantInstance);
            }
        }
    }

    private updateSpan(slotID: number, plant: Plant): void {
        let span = this.spans.get(slotID);
        if (span) {
            span.plant = plant;
            span.htmlElem.html(plant.icon);
            span.htmlElem.addClass("plant");
        }
    }

    private initializeMarket(): void {

    }

}

class Plant {
    public level: number;
    public species: string;
    public maturity: number;
    public slotID: number;
    public icon: string;
    public stage: string;

    private halfwayMature: number;

    constructor(species: string, slotID: number, level: number) {
        this.species = species;
        this.slotID = slotID;
        this.level = level; // seconds since plant
        this.maturity = PLANT_LEVELS[this.species].maturity;
        this.halfwayMature = this.maturity / 2;

        this.stage = this.getStage();
        this.icon = this.getIcon();
        this.harvest = this.harvest.bind(this);
        this.updateSlot();

        // TODO Clean up
        if (this.isMature()) {
            $(`#slot${this.slotID}`).html(this.icon);
        }
    }

    public levelUp(): void {
        this.level += 1;
        if (this.level === this.halfwayMature) {
            this.updateStage(PLANT_STAGES[1]);
        } else if (this.level === this.maturity) {
            this.updateStage(PLANT_STAGES[2]);
        }
    }

    public isMature(): boolean {
        return (this.stage === PLANT_STAGES[-1]);
    }

    private getStage(): string {
        let i = Math.floor(this.level / (this.maturity / 2));
        if (i > 2) i = 2;
        return PLANT_STAGES[i];
    }

    private getIcon(): string {
        return getRandomElementFromArray(PLANT_ICONS[this.stage]);
    }

    private updateStage(stage: string): void {
        this.stage = stage;
        this.icon = this.getIcon();
        if ($("#selectedSpace").html() !== "") {
            // this.display();
        }
        this.updateSlot();
    }

    private updateSlot(): void {
        $(`#slot${this.slotID}`).html(this.icon);
    }

    // private isMature(): boolean {
    //     return (this.level >= this.maturity);
    // }

    // TODO
    private harvest(): void {
        $(`#slot${this.slotID}`).html("~");
        $(`#slot${this.slotID}`).css("color", "green");
    }
}

class Plot {
    public contents: Map<number, Plant>;
    public board: string[] = GAME_BOARD;

    constructor() {
        this.contents = new Map();
        this.displayPlant = this.displayPlant.bind(this);
        setInterval(() => {
            this.updatePlants();
        }, 1000);
    }

    public displayPlant(event: { target: any; }): void {
        let slot = event.target;
        let id = parseInt(slot.id.slice(4, slot.id.length));
        if (this.contents.has(id)) {
            let plant = this.contents.get(id);
            if (plant) {
                // plant.display();
            }
        } else {
            $("#selectedSpace").html("empty");
        }
    }

    public plant(id: number, seed: string): Plant {
        let plant = new Plant(seed, id, 0);
        // plant.display();
        this.set(id, plant);
        return plant;
    }

    public harvest(id: number): void {
        this.contents.delete(id);
    }

    public updatePlants(): void {
        for (let [id, plant] of this.contents) {
            plant.levelUp();
        }
    }

    public isOccupied(i: number): boolean {
        return (this.contents.has(i));
    }

    public getPlant(i: number): Plant | undefined {
        return (this.contents.get(i));
    }

    public set(id: number, plant: Plant): void {
        this.contents.set(id, plant);
    }
}

class Inventory {
    private contents: Map<string, number>;

    constructor() {
        this.contents = new Map();
    }

    public get(seed: string): number | null {
        let quantity = this.contents.get(seed);
        if (quantity) {
            return quantity;
        } else {
            return null;
        }
    }

    public insert(seed: string, number: number): void {
        let quantity = this.get(seed);
        if (quantity) {
            this.contents.set(seed, quantity + number);
        } else {
            this.contents.set(seed, number);
        }
    }

    public remove(seed: string): void {
        let quantity = this.get(seed);
        if (quantity) {
            this.contents.set(seed, quantity - 1);
            if (this.get(seed) === 0) {
                this.contents.delete(seed);
            }
        }
    }

    public contains(seed: string): boolean {
        return (this.get(seed) !== null);
    }
}

// TODO
class Market {

}

function clearLocalStorage(event: any): void {
    if (event.code === "Space") {
        localStorage.clear();
        alert("Cleared local storage");
        window.location.reload();
    }
}

class Game {
    public eventHandler: EventHandler;

    private plot: Plot;
    private inventory: Inventory;
    private market: Market;

    constructor() {
        this.plot = new Plot();
        this.inventory = new Inventory();
        this.market = new Market();
        this.eventHandler = new EventHandler(
            this.plot,
            this.inventory,
            this.market);
        this.inventory.insert("wheat", 3);
        $("#inventory0").html("- wheat: 3");
        document.addEventListener("keydown", clearLocalStorage); // for debugging
    }

    public onLoad(clientData: string): void {
        let data = JSON.parse(clientData);
        this.loadData(data);
    }

    private loadData(data: any): void {
        for (let [key, plant] of data) {
            let plantInstance = new Plant(plant.species, plant.slotID, plant.level);
            this.plot.set(plant.slotID, plantInstance);

            $(`#slot${plant.slotID}`).html(plantInstance.icon);
            $(`#slot${plant.slotID}`).css("color", "green");
        }
    }
}

const game = new Game();