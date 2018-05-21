import { World } from "./World";

export class Game {
    public tickLength: number;
    public stopMain;
    public maxTicks: number;
    public fps: string;
    private lastRender: number;
    private lastTick: number;
    private worlds: World[];
    private ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.worlds = [];
    }

    public init() {
        this.lastTick = performance.now();
        this.lastRender = this.lastTick; // Pretend the first draw was on first update.
        this.tickLength = 50; // This sets your simulation to run at 1000/tickLength Hz
        this.maxTicks = 20; // Maximum queued ticks before disposal

        this.main(performance.now()); // Start the cycle
    }

    public addWorld(world: World) {
        this.worlds.push(world);
    }

    private render(tFrame) {
        const delta = (tFrame - this.lastTick) / this.tickLength;

        // Clear screen
        this.ctx.save();
        this.ctx.fillStyle = "#ffffff";
        const inverseMatrix = (this.ctx as any).getTransform().inverse();
        const position = transformPoint({x: 0, y: 0}, inverseMatrix);
        const scale = transformPoint({x: this.ctx.canvas.width, y: this.ctx.canvas.height}, inverseMatrix);
        this.ctx.fillRect(position.x, position.y, scale.x - position.x, scale.y - position.y);
        this.ctx.restore();

         // Not sure why I'm supporting multiple worlds if they all have the same context
        this.worlds.forEach((world) => {
            world.render(this.ctx, delta);
        });

        // Debug: display fps
        this.ctx.save();
        this.fps = (1000 / (tFrame - this.lastRender)).toPrecision(5);
        this.ctx.font = "20px sans-serif";
        this.ctx.fillStyle = "#eaeaea";
        this.ctx.fillText(this.fps + " fps", 20, 20);
        this.ctx.restore();
    }

    private update(timestamp) {
        this.worlds.forEach((world) => {
            world.update(timestamp);
        });
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
