var canvasHeight = 1000;
var canvasWidth = 1000;
var tileSize = 20;
var cols = canvasWidth / tileSize;
var rows = canvasHeight / tileSize;
var grid;

let execute = false;
let freeDraw = true;

// Variable to indicate if simulation is running.
// When false, prevents more inputs until sim is done.
var RUNNING = false;

class Tile{
    constructor(x, y, pixX, pixY, red, green, blue){
        this.x = x;
        this.y = y;
        this.pixelsx = pixX;
        this.pixelsy = pixY;
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.checked = false;
    }

    setColour(r, g, b){
        this.red = r;
        this.green = g;
        this.blue = b;
    }

    compareColour(r, g, b){
        return this.red == r && this.green == g && this.blue == b;
    }

    compareColourTile(other){
        return this.red == other.red && this.green == other.green && this.blue == other.blue;
    }

    draw(){
        fill(this.red, this.green, this.blue);
        // noStroke();
        square(this.pixelsx, this.pixelsy, tileSize);
    }
}

class Grid{
    constructor(rows, cols){
        this.rows = rows;
        this.cols = cols;
        this.tiles = [];
        this.scale = 0.1;
        // this.generateTiles();
        this.generateDepthMap();
    }

    // Method to generate an array of tiles of the same colour.
    generateTiles(){
        for(let x = 0; x < this.cols; x += 1){
            for(let y = 0; y < this.rows; y += 1){
                let newTile = new Tile(x, y, x*tileSize, y*tileSize, 100, 0 ,0);
                this.tiles[y*this.cols + x] = newTile;
            }
        }
        print(this.tiles.length);
    }

    // Method used to generate a depth map. Uses Perlin noise to create tiles of varying colour representing different altitudes.
    // Default method called when generating tiles.
    generateDepthMap(){
        let possibleVals = [30, 80, 120, 180, 210, 240];
        for(let y=0; y<this.rows; y++){
            for(let x=0; x<this.cols; x++){
                let noiseValue = noise(x * this.scale, y*this.scale);
                let alt = map(noiseValue, 0, 1, 0, 255);
                let mapped_alt = this.mapToNearestVal(alt, possibleVals);       // map value to nearset value in possibleVals
                let newTile = new Tile(x, y, x*tileSize, y*tileSize, mapped_alt, mapped_alt, mapped_alt);
                this.tiles[y*this.cols + x] = newTile;
            }
        }
    }

    // Helper function to map a val to nearest possible value in values. (Used to limit the number of possible colours from the perlins noise).
    mapToNearestVal(val, values){
        let diff = 10000;
        let chosen_val;
        values.forEach((value) => {
            let difference = abs(value - val);
            if(difference < diff){
                diff = difference;
                chosen_val = value;
            }
        })
        return chosen_val;
    }

    reset(){
        window.location.reload();
        // this.tiles.length = 0;
        // this.generateDepthMap();
    }

    getTile(x, y){
        if(x < 0 || x >= this.cols) return null;
        if(y < 0 || y >= this.rows) return null;
        return this.tiles[y*this.cols + x];
    }

    getUpNeighbour(tile){
        return this.getTile(tile.x, tile.y-1);
    }

    getDownNeighbour(tile){
        return this.getTile(tile.x, tile.y+1);
    }

    getLeftNeighbour(tile){
        return this.getTile(tile.x-1, tile.y);
    }

    getRightNeighbour(tile){
        return this.getTile(tile.x+1, tile.y);
    }

    draw(){
        this.tiles.forEach((tile) => {
            tile.draw();
        });
    }
}

const sleep = (millis) => { 
    return new Promise(resolve => setTimeout(resolve, millis)) 
}

async function dfs_recursive(tile, r, g, b){
    if(tile == null) return;
    if(tile.checked) return;
    if(!tile.compareColour(r, g, b)) return;
    tile.checked = true;
    tile.setColour(0, 100, 100);
    await sleep(100);
    // draw();

    dfs_recursive(grid.getUpNeighbour(tile), r, g, b);
    dfs_recursive(grid.getDownNeighbour(tile), r, g, b);
    dfs_recursive(grid.getRightNeighbour(tile), r, g, b);
    dfs_recursive(grid.getLeftNeighbour(tile), r, g, b);

    return;
}

async function bfs(tile, r, g, b){
    RUNNING = true;
    if(tile == null) return;
    if(tile.checked) return;
    tile.checked = true;
    const queue = [tile];

    while(queue.length > 0){
        const current = queue.shift();
        current.setColour(100, 0, 100);
        let upN = grid.getUpNeighbour(current);
        if(upN!=null && !upN.checked && upN.compareColour(r, g, b)){
            upN.checked = true;
            queue.push(upN);
        }

        let rightN = grid.getRightNeighbour(current);
        if(rightN!=null &&!rightN.checked && rightN.compareColour(r, g, b)){
            rightN.checked = true;
            queue.push(rightN);
        }

        let downN = grid.getDownNeighbour(current);
        if(downN!=null &&!downN.checked && downN.compareColour(r, g, b)){
            downN.checked = true;
            queue.push(downN);
        }

        let leftN = grid.getLeftNeighbour(current);
        if(leftN!=null && !leftN.checked && leftN.compareColour(r, g, b)){
            leftN.checked = true;
            queue.push(leftN);
        }
        await sleep(10);
    }
    RUNNING = false;
}

function setup(){
    print(`rows ${rows} cols ${cols}`);
    grid = new Grid(rows, cols);
    execute_dfs = createCheckbox('dfs');
    execute_bfs = createCheckbox('bfs');
    freeDraw = createCheckbox('free draw');
    reset_btn = createButton('Reset');
    reset_btn.mousePressed(reset);
}

function draw(){
    createCanvas(canvasWidth, canvasHeight);
    background(0);
    grid.draw();
    // noLoop();
    if(freeDraw.checked() && mouseIsPressed){
        let x = floor(mouseX / tileSize);
        let y = floor(mouseY / tileSize);
        chosenTile = grid.getTile(x, y);
        if(chosenTile != null) chosenTile.setColour(0, 0, 0);
    }
}

function mousePressed(){
    if(RUNNING) return;
    // print(mouseX, mouseY);
    let x = floor(mouseX / tileSize);
    let y = floor(mouseY / tileSize);
    let chosenTile = grid.getTile(x, y);
    if(chosenTile){
        if(execute_dfs.checked()) dfs_recursive(chosenTile, chosenTile.red, chosenTile.green, chosenTile.blue);
        if(execute_bfs.checked()) bfs(chosenTile, chosenTile.red, chosenTile.green, chosenTile.blue);
    }
}

function reset(){
    if(RUNNING) return;
    grid.reset();
}

// TODO : Grid and Tiles are set up. Next is to:
/**
 */