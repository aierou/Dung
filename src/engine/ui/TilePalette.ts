import Point from "../common/Point";
import Rectangle from "../common/Rectangle";
import WorldEditorInfo from "../common/WorldEditorInfo";
import SpriteManager from "../SpriteManager";
import TilesetManager from "../TilesetManager";
import World from "../world/World";
import UIElement from "./UIElement";

// How I want the tilepalette to work:

// Little box that displays the current tile
// Hover or click (mobile) expands the window
// Select the tile you want to use
// Alternatively, use framework like React to handle all the UI stuff.
// That means I don't have to re-invent the wheel.
export default class TilePalette extends UIElement {
    private tileset: SpriteManager;
    private columns: number = 6;
    private CONTAINER_PADDING: number = 5;
    private selection: number = 1;
    private worldEditorInfo: WorldEditorInfo;
    private mouseDown: boolean = false;

    private get cellSize() {
        return (this.width - (this.CONTAINER_PADDING * 2)) / this.columns;
    }

    constructor(worldEditorInfo: WorldEditorInfo) {
        super(0, 0);
        this.worldEditorInfo = worldEditorInfo;
        this.setTileset("tileset1");
        this.width = 196;
        this.height = 512;
    }

    public setTileset(name: string) {
        this.tileset = TilesetManager.getTileset(name, 128);
    }

    public render(ctx: CanvasRenderingContext2D, screenRect: Rectangle) {
        if (!this.tileset) {
            return;
        }
        this.transform.x = screenRect.width - this.width - this.CONTAINER_PADDING;
        this.transform.y = (screenRect.height / 2) - (this.height / 2);
        ctx.fillStyle = "#eeeeee";
        ctx.fillRect(this.transform.x, this.transform.y, this.width, this.height);
        const iterator = this.tileset.iterateSpriteImages();
        let i = 0;

        for (const sprite of iterator) {
            const rect = this.getCoordinatesFromId(i);
            ctx.drawImage(sprite, rect.x, rect.y, rect.width, rect.height);
            i++;
        }

        const selectionRect = this.getCoordinatesFromId(this.selection);
        ctx.save();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        ctx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
        ctx.restore();
    }

    public setSelection(selection: number) {
        if (selection != null && selection < this.tileset.getNumberOfSprites()) {
            this.selection = selection;
            this.worldEditorInfo.selectedTile = this.selection;
        }
    }

    public resolveMouseEvent(mouse) {
        if (mouse.isDown) {
            this.mouseDown = true;
        } else if (this.mouseDown) {
            this.mouseDown = false;
            this.setSelection(this.getIdFromCoordiantes(mouse.clientX, mouse.clientY));
        }
    }

    private getIdFromCoordiantes(x: number, y: number) {
        const rect = this.getTileSpace();
        if (!rect.containsPoint(new Point(x, y))) {
            return null;
        }
        const cellSize = this.cellSize;
        const tileX = Math.floor((x - rect.x) / cellSize);
        const tileY = Math.floor((y - rect.y) / cellSize);
        return (tileY * this.columns) + tileX;
    }
    private getTileSpace(): Rectangle {
        return new Rectangle(
            this.transform.x + this.CONTAINER_PADDING,
            this.transform.y + this.CONTAINER_PADDING,
            this.width - (this.CONTAINER_PADDING * 2),
            this.height - (this.CONTAINER_PADDING * 2),
        );
    }

    private getCoordinatesFromId(id: number): Rectangle {
        const rect: Rectangle = this.getTileSpace();
        const cellSize = this.cellSize;
        return new Rectangle(
            rect.x + ((id % this.columns) * cellSize),
            rect.y + (Math.floor(id / this.columns) * cellSize),
            cellSize,
            cellSize,
        );
    }
}
