export class InputController {
    private static _instance: InputController;
    private _mouseX: number = 0;
    private _mouseY: number = 0;
    private subscribers: any = {};
    private ctx: CanvasRenderingContext2D;

    get mouse(): any {
        const ret: any = transformPoint({x: this._mouseX, y: this._mouseY}, (this.ctx as any).getTransform().inverse());
        ret.clientX = this._mouseX;
        ret.clientY = this._mouseY;
        return ret;
    }

    private constructor() {}

    public init(target: HTMLElement, ctx: CanvasRenderingContext2D) {
        target.addEventListener("mousemove", this.mousemove);
        target.addEventListener("wheel", this.wheel);
        this.ctx = ctx;
    }

    // Probably needs some sort of unsubscribe in the future
    public subscribe(event: string, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = new Array();
        }
        this.subscribers[event].push(callback);
    }

    private wheel = (e: WheelEvent) => {
        this.getMousePosition(e);
        for (const callback of this.subscribers.wheel) {
            callback(e);
        }
    }

    private mousemove = (e: MouseEvent) => {
        this.getMousePosition(e);
    }

    private getMousePosition(e) {
        const rect = this.ctx.canvas.getBoundingClientRect();
        this._mouseX = e.clientX - rect.left;
        this._mouseY = e.clientY - rect.top;
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }
}

function transformPoint(point, matrix) {
    return { x: (point.x * matrix.a) + (point.y * matrix.c) + matrix.e,
            y: (point.x * matrix.b) + (point.y * matrix.d) + matrix.f };
}
