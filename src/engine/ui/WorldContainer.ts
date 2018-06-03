import Camera from "../Camera";
import Point from "../common/Point";
import Rectangle from "../common/Rectangle";
import WorldEditorInfo from "../common/WorldEditorInfo";
import InputController from "../InputController";
import UIManager from "../UIManager";
import World from "../world/World";
import ChunkGrid from "./ChunkGrid";
import TilePalette from "./TilePalette";
import WorldUIElement from "./WorldUIElement";

export default class WorldContainer {
    public width: number = 1280;
    public height: number = 720;
    private world: World;
    private uiManager: UIManager;
    private worldEditorInfo: WorldEditorInfo;
    private ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D, world: World) {
        this.world = world;
        this.ctx = ctx;
        this.worldEditorInfo = new WorldEditorInfo(world, new Camera());
        this.uiManager = new UIManager();
        if (this.worldEditorInfo.editing) {
            this.uiManager.addUIElement(new TilePalette(this.worldEditorInfo));
        }
        this.uiManager.addUIElement(new WorldUIElement(this.worldEditorInfo), 999999999);
        this.uiManager.addUIElement(new ChunkGrid(this.worldEditorInfo), 999999998);

        // This will be done away with at some point when I figure out better control systems
        InputController.Instance.registerUIManager(this.uiManager);
    }

    public resize(width, height) {
        this.width = width;
        this.height = height;
        this.resizeCamera();
    }

    public resizeCamera() {
        const inverseMatrix = (this.ctx as any).getTransform().inverse();
        const position = new Point(0, 0).applyMatrixTransform(inverseMatrix);
        const scale = new Point(this.width, this.height).applyMatrixTransform(inverseMatrix);
        const bounds = new Rectangle(position.x, position.y, scale.x - position.x, scale.y - position.y);

        this.worldEditorInfo.getActiveCamera().resize(bounds.width, bounds.height);
    }

    public getBoundingRect() {
        return new Rectangle(0, 0, this.width, this.height);
    }

    public update(timestamp: number) {
        const scaledTileSize = Math.min(
            this.worldEditorInfo.getActiveCamera().getScale() * this.worldEditorInfo.tileSize,
            this.worldEditorInfo.tileSize,
        );
        this.world.setScaledTileSize(scaledTileSize);

        this.world.update(timestamp);
    }

    public render(ctx, delta) {
        this.resizeCamera();
        this.worldEditorInfo.getActiveCamera().render(ctx);
        this.world.setVisibleArea(this.worldEditorInfo.getActiveCamera().getBoundingRectangle());
        this.world.render(ctx, delta);
        this.uiManager.render(ctx, this.getBoundingRect());
    }
}
