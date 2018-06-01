import Camera from "../Camera";
import Rectangle from "../common/Rectangle";
import WorldEditorInfo from "../common/WorldEditorInfo";
import InputController from "../InputController";
import UIManager from "../UIManager";
import World from "../world/World";
import TilePalette from "./TilePalette";
import WorldElement from "./WorldElement";

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
        this.uiManager.addUIElement(new TilePalette(this.worldEditorInfo));
        this.uiManager.addUIElement(new WorldElement(this.worldEditorInfo), 999999999);

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
        const position = transformPoint({x: 0, y: 0}, inverseMatrix);
        const scale = transformPoint({x: this.width, y: this.height}, inverseMatrix);
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

function transformPoint(point, matrix) {
    return { x: (point.x * matrix.a) + (point.y * matrix.c) + matrix.e,
            y: (point.x * matrix.b) + (point.y * matrix.d) + matrix.f };
}
