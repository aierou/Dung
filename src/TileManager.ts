import SpriteManager from "./SpriteManager";
import Tile from "./Tile";
import { Transform } from "./Transform";

export default class TileManager {
    private tileset: string;
    private tiles: Tile[] = new Array();
    private spritesheet: SpriteManager;
    private tileCanvas: HTMLCanvasElement;
    private tileCanvasCtx: CanvasRenderingContext2D;
    private chunkSize: number;
    private tileSize: number;
    private scaledTileSize: number;

    // Welp. Definitely going to need some efficiency stuff. Probably building the image from all our tiles once
    // and updating that image only when a tile is added/removed. Rendering 250,000 tiles every frame does not
    // work so well.
    constructor(tileset: string, tileSize: number, chunkSize: number) {
        this.tileset = tileset;
        this.spritesheet = new SpriteManager("tilesets/" + tileset + ".png", tileSize, tileSize);
        this.tileCanvas = document.createElement("canvas");
        this.tileCanvas.width = chunkSize * tileSize;
        this.tileCanvas.height = chunkSize * tileSize;
        this.chunkSize = chunkSize;
        this.tileSize = tileSize;
        this.scaledTileSize = tileSize;
        this.tileCanvasCtx = this.tileCanvas.getContext("2d");
        this.load().then(() => {
            // DEBUG FUN TIMES
            for (let x = 0; x < chunkSize; x++) {
                for (let y = 0; y < chunkSize; y++) {
                    const tile = new Tile(1, x, y);
                    tile.applySprite(this.spritesheet, new Transform(x * this.scaledTileSize, y * this.scaledTileSize));
                    this.tiles.push(tile);
                }
            }
            // YEAH
            this.tiles.forEach((tile) => {
                tile.sprite.render(this.tileCanvasCtx, this.scaledTileSize, this.scaledTileSize);
            });
        });
    }

    public setTile(id: number, x: number, y: number) {
        if (x < this.chunkSize && y < this.chunkSize) {
            let tile = this.tiles.find((a) => a.x === x && a.y === y);
            if (!tile) {
                tile = new Tile(id, x, y);
                this.tiles.push(tile);
            }
            if (tile.id !== id) {
                tile.id = id;
                tile.applySprite(this.spritesheet, new Transform(x * this.scaledTileSize, y * this.scaledTileSize));
                tile.sprite.render(this.tileCanvasCtx, this.scaledTileSize, this.scaledTileSize);
            }
        }
    }

    public getTile(x: number, y: number) {
        return this.tiles.find((a) => a.x === x && a.y === y);
    }

    public isEmpty(): boolean {
        return this.tiles.length === 0;
    }

    public load(): Promise<any> {
        return this.spritesheet.load();
    }

    public resizeImage(size: number) {
        this.scaledTileSize = size;
        this.tileCanvas.width = this.chunkSize * size;
        this.tileCanvas.height = this.chunkSize * size;
        // this.tileCanvasCtx.fillStyle = ""
        this.tileCanvasCtx.fillRect(0, 0, this.chunkSize * size, this.chunkSize * size);
        this.tiles.forEach((tile) => {
            tile.sprite.transform.x = tile.x * size;
            tile.sprite.transform.y = tile.y * size;
            tile.sprite.render(this.tileCanvasCtx, size, size);
        });
    }

    public render(ctx: CanvasRenderingContext2D, x, y) {
        const size = this.chunkSize * this.tileSize;
        ctx.drawImage(this.tileCanvas, x, y, size, size);
    }
}
