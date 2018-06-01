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
    private chunks: Map<string, Chunk>;
    // Expect these to come in as metadata
    private tileSize: number = 128;
    private scaledTileSize: number;
    private visibleArea: Rectangle;

    private get chunkSize() {
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

        // Debug
        for (const chunk of this.loadedChunks) {
            ctx.fillStyle = ((chunk.position.x + chunk.position.y) % 2 === 0) ? "#66666666" : "#88888866";
            const rect = chunk.getBoundingRectangle();
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            const p = new Point(rect.x / (this.chunkSize * this.tileSize), rect.y / (this.chunkSize * this.tileSize));
            ctx.fillStyle = "#ffffffaa";
            ctx.font = "bold 500px sans-serif";
            ctx.fillText(p.x + ", " + p.y, rect.x + (rect.width / 3), rect.y + (rect.height / 2));
        }

        // Render entities
        this.entityManager.render(ctx, delta);
    }

    public getChunkAtPosition(x: number, y: number): Chunk {
        const size = this.tileSize * this.chunkSize;
        return this.chunks.get(new Point(Math.floor(x / size), Math.floor(y / size)).toString());
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

        const chunksToUnload = this.loadedChunks.filter((n) => {
            return validChunks.indexOf(n) === -1;
        });

        const chunksToLoad = validChunks.filter((n) => {
            return this.loadedChunks.indexOf(n) === -1;
        });

        // unload
        for (const chunk of chunksToUnload) {
            this.unloadChunk(chunk, false);
        }
        if (chunksToUnload.length > 0) {console.log("Unloading " + chunksToUnload.length + " chunks"); }

        // load
        for (const chunk of chunksToLoad) {
            this.loadChunk(chunk, false);
        }
        if (chunksToLoad.length > 0) {console.log("Loading " + chunksToLoad.length + " chunks"); }
    }
}

function transformPoint(point, matrix) {
    return { x: (point.x * matrix.a) + (point.y * matrix.c) + matrix.e,
            y: (point.x * matrix.b) + (point.y * matrix.d) + matrix.f };
}
const createMatrix = function() {
    const svgNamespace = "http://www.w3.org/2000/svg";
    return document.createElementNS(svgNamespace, "g").getCTM();
};
