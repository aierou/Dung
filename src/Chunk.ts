import { Entity } from "./Entity";
import Point from "./Point";
import Rectangle from "./Rectangle";
import Tile from "./Tile";
import TileManager from "./TileManager";
import { Transform } from "./Transform";

export default class Chunk {
    private entities: Entity[];
    private tileManager: TileManager;
    private chunkSize: number;
    private tileSize: number;
    private transform: Transform;
    private scaledTileSize: number;

    public get width() {
        return this.chunkSize * this.tileSize;
    }

    public get height() {
        return this.chunkSize * this.tileSize;
    }

    public get tiles() {
        return this.tileManager;
    }

    public get position(): Point {
        return this.transform.position;
    }

    constructor(x: number, y: number, tileSize: number, chunkSize: number) {
        this.transform = new Transform(x, y);
        this.entities = new Array();
        this.tileManager = new TileManager("tileset1", tileSize, chunkSize);
        this.chunkSize = chunkSize;
        this.tileSize = tileSize;
        this.scaledTileSize = tileSize;
    }

    public getEntities(): Entity[] {
        return this.entities;
    }

    public isEmpty(): boolean {
        return this.entities.length === 0 && this.tileManager.isEmpty();
    }

    public saveEntities(entities: Entity[]) {
        this.entities = entities;
    }

    public getTilePosition(x: number, y: number) {
        return {
            x: Math.floor((x - (this.transform.x * this.width)) / this.tileSize),
            y: Math.floor((y - (this.transform.y * this.height)) / this.tileSize),
        };
    }

    public getBoundingRectangle(): Rectangle {
        return new Rectangle(this.transform.x * this.width, this.transform.y * this.height, this.width, this.height);
    }

    public containsTransform(transform: Transform) {
        return transform.x >= this.transform.x
            && transform.y >= this.transform.y
            && transform.x < this.transform.x + this.width
            && transform.y < this.transform.y + this.height;
    }

    public resizeImage(size: number) {
        if (size !== this.scaledTileSize) {
            this.scaledTileSize = size;
            this.tileManager.resizeImage(size);
        }
    }

    public render(ctx: CanvasRenderingContext2D) {
        this.tileManager.render(ctx, this.transform.x * this.width, this.transform.y * this.height);
    }
}
