import Camera from "./Camera";
import Chunk from "./Chunk";
import { Entity } from "./Entity";
import { EntityManager } from "./EntityManager";
import { Game } from "./Game";
import { InputController } from "./InputController";
import Point from "./Point";
import Rectangle from "./Rectangle";
import { TestSquare } from "./TestSquare";
import { TestSquare2 } from "./TestSquare2";
import { Transform } from "./Transform";
import UILabel from "./UILabel";
import UIManager from "./UIManager";

export class World {
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

    // Welp. I spent several hours figuring this out, but it's crap. I'm just going to scale
    // Tiles based on the camera zoom. That seems to do the trick.
    // public drawTileMap() {
    //     const tileCanvas = document.createElement("canvas");
    //     const camera = this.game.getActiveCamera();
    //     const cameraRect = camera.getBoundingRectangle();
    //     tileCanvas.width = 1920;
    //     tileCanvas.height = 1080;
    //     const tileCanvasCtx = tileCanvas.getContext("2d");
    //     const scale = camera.getScale();

    //     this.tileMapScale = scale;
    //     this.tileMapOffset = camera.transform.position;

    //     tileCanvasCtx.scale(scale, scale);
    //     tileCanvasCtx.translate(-this.tileMapOffset.x, -this.tileMapOffset.y);
    //     for (const chunk of this.loadedChunks) {
    //         if (!chunk.tiles.isEmpty()) {
    //             chunk.render(tileCanvasCtx);
    //         }
    //     }
    //     const image = new Image();
    //     image.src = tileCanvas.toDataURL();
    //     this.tileMap = image;
    // }

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

        // Render tile map
        // ctx.save();
        // ctx.translate(this.tileMapOffset.x, this.tileMapOffset.y);
        // ctx.scale(1 / this.tileMapScale, 1 / this.tileMapScale);
        // ctx.drawImage(this.tileMap, 0, 0);
        // ctx.restore();

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
            ctx.font = "bold 50px sans-serif";
            ctx.fillText(p.x + ", " + p.y, rect.x + 10, rect.y + 40);
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
        const rect = this.game.getActiveCamera().getBoundingRectangle()
            .scaleToGrid(this.chunkSize * this.tileSize)
            .expand(1).translate(1, 1);

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

        // load
        for (const chunk of chunksToLoad) {
            this.loadChunk(chunk, false);
        }

        // console.log(chunksToLoad.length + " " + chunksToUnload.length + " " + this.loadedChunks.length);

        // for(x = this.camera.transform.x) { }
        // Check if chunk is in visible area
        // If not, unload it (if it is loaded)
        // If it is, load it (if it isn't loaded)
        // Might need to be able to get chunks by coordinates or something
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
