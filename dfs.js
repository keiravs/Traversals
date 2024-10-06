var canvasHeight = 300;
var canvasWidth = 300;
var tileSize = 5;
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
        this.generateTiles();
    }

    generateTiles(){
        for(let x = 0; x < this.cols; x += 1){
            for(let y = 0; y < this.rows; y += 1){
                let newTile = new Tile(x, y, x*tileSize, y*tileSize, 100, 0 ,0);
                this.tiles[y*this.cols + x] = newTile;
            }
        }
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

async function dfs(x, y){
    RUNNING = true;
    let chosenTile = grid.getTile(x, y);
    let colour = [chosenTile.red, chosenTile.green, chosenTile.blue];
    let queue = [chosenTile];
    
    while(queue.length > 0){
        let cTile = queue.pop();
        cTile.setColour(0, 0, 255);
        cTile.checked = true;
        // Getting the neighbours
        let upTile = grid.getUpNeighbour(cTile);
        if(upTile != null && !upTile.checked && upTile.compareColour(colour[0], colour[1], colour[2])){
            queue.push(upTile);
        }
        let rightTile = grid.getRightNeighbour(cTile);
        if(rightTile != null && !rightTile.checked && rightTile.compareColour(colour[0], colour[1], colour[2])){
            queue.push(rightTile);
        }
        let downTile = grid.getDownNeighbour(cTile);
        if(downTile != null && !downTile.checked && downTile.compareColour(colour[0], colour[1], colour[2])){
            queue.push(downTile);
        }
        let leftTile = grid.getLeftNeighbour(cTile);
        if(leftTile != null && !leftTile.checked && leftTile.compareColour(colour[0], colour[1], colour[2])){
            queue.push(leftTile);
        }
        await sleep(1);
    }
    print("dfs complete");
    RUNNING = false;
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
    if(tile == null) return;
    if(tile.checked) return;
    tile.checked = true;
    const queue = [tile];

    while(queue.length > 0){
        const current = queue.shift();
        current.setColour(0, 100, 100);
        await sleep(10);
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
    }
    print("COMPLETED FROM WITHIN BFS");
}

function setup(){
    print(`rows ${rows} cols ${cols}`);
    grid = new Grid(rows, cols);
    execute_dfs = createCheckbox('dfs');
    execute_bfs = createCheckbox('bfs');
    freeDraw = createCheckbox('free draw');
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
    if(execute_dfs.checked()) dfs_recursive(chosenTile, chosenTile.red, chosenTile.green, chosenTile.blue);
    if(execute_bfs.checked()) bfs(chosenTile, chosenTile.red, chosenTile.green, chosenTile.blue);
    print("Completed");
}

// TODO : Grid and Tiles are set up. Next is to:
/**
 * 1) Implement functionality to pick a specific tile using mouse.
 * 2) Implement DFS and BFS functions.
 * 3) Add GUI toggle to allow selection of specific algo.
 * 4) Define function to generate sample maps.
 */