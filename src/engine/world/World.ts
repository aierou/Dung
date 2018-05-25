import Camera from "../Camera";
import Point from "../common/Point";
import Rectangle from "../common/Rectangle";
import Transform from "../common/Transform";
import Game from "../Game";
import InputController from "../InputController";
import UILabel from "../ui/UILabel";
import UIManager from "../UIManager";
import Chunk from "./Chunk";
import Entity from "./entity/Entity";
import TestSquare from "./entity/TestSquare";
import TestSquare2 from "./entity/TestSquare2";
import EntityManager from "./EntityManager";

export default class World {
    public entityManager: EntityManager;
    public camera: Camera;
    private game: Game;
    private loadedChunks: Chunk[] = new Array();
    private chunks: Map<string, Chunk>;
    // Expect these to come in as metadata
    private chunkSize: number = 32;
    private tileSize: number = 128;
    private inputController: InputController = InputController.Instance;

    constructor(game: Game) {
        this.game = game;
        this.entityManager = new EntityManager();

        this.chunks = new Map();

        // Debug
        const entities: Entity[] = new Array();
        entities.push(new TestSquare(100, 100));
        entities.push(new TestSquare2(100, 100));
        const chunk = new Chunk(0, 0, this.tileSize, this.chunkSize);
        chunk.saveEntities(entities);
        this.chunks.set(chunk.position.toString(), chunk);
    }

    public update(timestamp: number) {
        this.entityManager.update();

        this.updateChunks();

        const mouse = this.inputController.mouse;
        if (mouse.isDown) {
            const chunk = this.getChunkAtPosition(mouse.x, mouse.y);
            if (chunk) {
                const pos = chunk.getTilePosition(mouse.x, mouse.y);
                chunk.tiles.setTile(0, pos.x, pos.y);
            }
        }

        const scaledTileSize = Math.min(this.game.getActiveCamera().getScale() * this.tileSize, this.tileSize);
        for (const chunk of this.loadedChunks) {
            chunk.resizeImage(scaledTileSize);
        }

        // Loaded chunk logic in here or render?
        // Actually, I think we'll load chunks in here, and maybe do visibility checks for rendering?
    }

    public render(ctx: CanvasRenderingContext2D, delta: number) {
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
            ctx.font = "bold 1000px sans-serif";
            ctx.fillText(p.x + ", " + p.y, rect.x + (rect.width / 3), rect.y + (rect.height / 2));
        }

        // Render entities
        this.entityManager.render(ctx, delta);
    }

    public loadChunk(chunk: Chunk, safe: boolean = true) {
        if (!safe || !this.loadedChunks.find((a) => a === chunk)) {
            this.loadedChunks.push(chunk);
            this.entityManager.addEntities(chunk.getEntities());
        }
    }

    public unloadChunk(chunk: Chunk, safe: boolean = true) {
        const index = this.loadedChunks.findIndex((a) => a === chunk);
        if (!safe || index !== -1) {
            chunk.saveEntities(this.entityManager.unloadAndSaveToChunk(chunk));
            this.loadedChunks.splice(index, 1);
        }
    }

    public getChunkAtPosition(x: number, y: number): Chunk {
        const size = this.tileSize * this.chunkSize;
        return this.chunks.get(new Point(Math.floor(x / size), Math.floor(y / size)).toString());
    }

    private updateChunks() {

        // Grid of visible chunks
        const rect = this.game.getActiveCamera().getBoundingRectangle()
            .scaleToGrid(this.chunkSize * this.tileSize)
            .expand(1).translate(1, 1);

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
