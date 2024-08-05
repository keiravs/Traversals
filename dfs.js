var canvasHeight = 500;
var canvasWidth = 500;
var tileSize = 5;
var cols = canvasWidth / tileSize;
var rows = canvasHeight / tileSize;
var grid;

class Tile{
    constructor(x, y, red, green, blue){
        this.x = x;
        this.y = y;
        this.red = red;
        this.green = green;
        this.blue = blue;
    }

    draw(){
        fill(this.red, this.green, this.blue);
        // noStroke();
        square(this.x, this.y, tileSize);
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
        for(let c = 0; c < this.cols; c += 1){
            for(let r = 0; r < this.rows; r += 1){
                let newTile = new Tile(c*tileSize, r*tileSize, 100, 0 ,0);
                this.tiles[r*this.cols + c] = newTile;
            }
        }
    }

    draw(){
        this.tiles.forEach((tile) => {
            tile.draw();
        });
    }
}

function setup(){
    grid = new Grid(rows, cols);
}

function draw(){
    createCanvas(canvasWidth, canvasHeight);
    background(0);
    grid.draw();
}

// TODO : Grid and Tiles are set up. Next is to:
/**
 * 1) Implement functionality to pick a specific tile using mouse.
 * 2) Implement DFS and BFS functions.
 * 3) Add GUI toggle to allow selection of specific algo.
 * 4) Define function to generate sample maps.
 */