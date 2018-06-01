import Camera from "./Camera";
import Rectangle from "./common/Rectangle";
import WorldEditorInfo from "./common/WorldEditorInfo";
import Constants from "./Constants";
import InputController from "./InputController";
import TilePalette from "./ui/TilePalette";
import UILabel from "./ui/UILabel";
import WorldContainer from "./ui/WorldContainer";
import WorldElement from "./ui/WorldElement";
import UIManager from "./UIManager";
import World from "./world/World";

export default class Game {
    public tickLength: number;
    public stopMain;
    public maxTicks: number;
    public fps: string;
    private lastRender: number;
    private lastTick: number;
    private ctx: CanvasRenderingContext2D;
    private uiManager: UIManager;
    private fpsLabel: UILabel;
    private worldContainer: WorldContainer;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;

        const mainWorld = new World();
        this.worldContainer = new WorldContainer(this.ctx, mainWorld);

        // UI Stuff
        this.uiManager = new UIManager();
        this.fpsLabel = new UILabel(this.fps);
        this.fpsLabel.outline = true;
        this.uiManager.addUIElement(this.fpsLabel);
    }

    public init() {
        this.lastTick = performance.now();
        this.lastRender = this.lastTick; // Pretend the first draw was on first update.
        this.tickLength = 50; // This sets your simulation to run at 1000/tickLength Hz
        this.maxTicks = 20; // Maximum queued ticks before disposal

        this.main(performance.now()); // Start the cycle
    }

    public resize(width, height) {
        this.worldContainer.resize(width, height);
    }

    private render(tFrame) {
        const delta = (tFrame - this.lastTick) / this.tickLength;

        // Clear screen
        this.ctx.save();
        this.ctx.fillStyle = Constants.backgroundColor;
        const inverseMatrix = (this.ctx as any).getTransform().inverse();
        const position = transformPoint({x: 0, y: 0}, inverseMatrix);
        const scale = transformPoint({x: this.ctx.canvas.width, y: this.ctx.canvas.height}, inverseMatrix);
        const bounds = new Rectangle(position.x, position.y, scale.x - position.x, scale.y - position.y);
        this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        this.ctx.restore();

        this.fps = (1000 / (tFrame - this.lastRender)).toPrecision(5);

        this.worldContainer.render(this.ctx, delta);

        this.fpsLabel.text = this.fps + " fps";
        this.uiManager.render(this.ctx, new Rectangle(0, 0, this.ctx.canvas.width, this.ctx.canvas.height));
    }

    private update(timestamp) {
        this.worldContainer.update(timestamp);
    }

    private main(tFrame) {
        this.stopMain = window.requestAnimationFrame((frame) => this.main(frame));
        const nextTick = this.lastTick + this.tickLength;
        let numTicks = 0;

        // Calculate the number of ticks that should have passed since the last update
        if (tFrame > nextTick) {
              const timeSinceTick = tFrame - this.lastTick;
              numTicks = Math.floor(timeSinceTick / this.tickLength);
        }

        this.queueUpdates(numTicks);
        this.render(tFrame);
        this.lastRender = tFrame;
    }

    private queueUpdates(numTicks) {
        if (numTicks > this.maxTicks) {
            console.log("System couldn't keep up -- skipping " + numTicks + " ticks");
            this.lastTick = this.lastTick + (this.tickLength * numTicks);
            return; // System was too slow or game was unfocused; throw out updates
        }
        for (let i = 0; i < numTicks; i++) {
              this.lastTick = this.lastTick + this.tickLength; // Now lastTick is this tick.
              this.update(this.lastTick);
        }
    }
}

function transformPoint(point, matrix) {
    return { x: (point.x * matrix.a) + (point.y * matrix.c) + matrix.e,
            y: (point.x * matrix.b) + (point.y * matrix.d) + matrix.f };
}
