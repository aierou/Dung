import Point from "../common/Point";
import Rectangle from "../common/Rectangle";
import Transform from "../common/Transform";
import Chunk from "./Chunk";
import Entity from "./entity/Entity";
import TestSquare from "./entity/TestSquare";
import EntityManager from "./EntityManager";

export default class World {
    public entityManager: EntityManager;
    private loadedChunks: Chunk[] = new Array();
    // Can't key with Point object because Map.get doesn't compare properties
    private chunks: Map<string, Chunk>;
    // Expect these to come in as metadata
    private tileSize: number = 128;
    private scaledTileSize: number;
    private visibleArea: Rectangle;

    public get chunkSize() {
        return 2048 / this.tileSize; // 2048 - max image size before slowdowns
    }

    constructor() {
        this.entityManager = new EntityManager();

        this.chunks = new Map();

        // Debug
        const entities: Entity[] = new Array();
        entities.push(new TestSquare(100, 100));
        const chunk = new Chunk(0, 0, this.tileSize, this.chunkSize);
        chunk.saveEntities(entities);
        this.chunks.set(chunk.position.toString(), chunk);

        this.scaledTileSize = this.tileSize;
    }

    public setScaledTileSize(scaledTileSize: number) {
        this.scaledTileSize = scaledTileSize;
    }

    public setVisibleArea(rect: Rectangle) {
        this.visibleArea = rect;
    }

    public update(timestamp: number) {
        this.entityManager.update();

        for (const chunk of this.loadedChunks) {
            chunk.resizeImage(this.scaledTileSize);
        }
    }

    public render(ctx: CanvasRenderingContext2D, delta: number) {
        this.updateChunks();
        for (const chunk of this.loadedChunks) {
            if (!chunk.tiles.isEmpty()) {
                chunk.render(ctx);
            }
        }

        // Render entities
        this.entityManager.render(ctx, delta);
    }

    public getChunkAtPosition(x: number, y: number): Chunk {
        const size = this.tileSize * this.chunkSize;
        return this.chunks.get(new Point(Math.floor(x / size), Math.floor(y / size)).toString());
    }

    public getLoadedChunks(): Chunk[] {
        return this.loadedChunks;
    }

    private loadChunk(chunk: Chunk, safe: boolean = true) {
        if (!safe || !this.loadedChunks.find((a) => a === chunk)) {
            this.loadedChunks.push(chunk);
            this.entityManager.addEntities(chunk.getEntities());
        }
    }

    private unloadChunk(chunk: Chunk, safe: boolean = true) {
        const index = this.loadedChunks.findIndex((a) => a === chunk);
        if (!safe || index !== -1) {
            chunk.saveEntities(this.entityManager.unloadAndSaveToChunk(chunk));
            this.loadedChunks.splice(index, 1);
        }
    }

    private updateChunks() {
        // Grid of visible chunks
        const rect = this.visibleArea.scaleToGrid(this.chunkSize * this.tileSize).expand(1).translate(1, 1);

        // List of chunks in grid
        const validChunks: Chunk[] = new Array();
        const iterator = rect.iterateGrid();
        for (const point of iterator) {
            let chunk = this.chunks.get(point.toString());
            if (!chunk) {
                chunk = new Chunk(point.x, point.y, this.tileSize, this.chunkSize);
                this.chunks.set(point.toString(), chunk);
            }
            validChunks.push(chunk);
        }

        for (let i = this.loadedChunks.length - 1; i >= 0; i--) {
            if (validChunks.indexOf(this.loadedChunks[i]) === -1) {
                this.unloadChunk(this.loadedChunks[i], false);
            }
        }

        for (const chunk of validChunks) {
            if (this.loadedChunks.indexOf(chunk) === -1) {
                this.loadChunk(chunk, false);
            }
        }
    }
}
