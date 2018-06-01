import UIManager from "./UIManager";

export default class InputController {
    private static _instance: InputController;
    private _mouseX: number = 0;
    private _mouseY: number = 0;
    private _mouseDown: boolean = false;
    private _keys: any = {};

    private subscribers: any = {};
    private uiManager: UIManager;
    private ctx: CanvasRenderingContext2D;

    get mouse(): any {
        const ret: any = transformPoint({x: this._mouseX, y: this._mouseY}, (this.ctx as any).getTransform().inverse());
        ret.clientX = this._mouseX;
        ret.clientY = this._mouseY;
        ret.isDown = this._mouseDown;
        return ret;
    }


    private constructor() {}

    public getKey(key: string): boolean {
        return !!this._keys[key];
    }

    public init(target: HTMLElement, ctx: CanvasRenderingContext2D) {
        target.addEventListener("mousemove", this.mousemove);
        target.addEventListener("wheel", this.wheel);
        target.addEventListener("mousedown", this.mousedown);
        target.addEventListener("mouseup", this.mouseup);
        document.addEventListener("keydown", this.keydown);
        document.addEventListener("keyup", this.keyup);
        // target.addEventListener("mouseleave", this.mouseup);
        this.ctx = ctx;
    }

    // Probably needs some sort of unsubscribe in the future
    public subscribe(event: string, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = new Array();
        }
        this.subscribers[event].push(callback);
    }

    public registerUIManager(uiManager: UIManager) {
        this.uiManager = uiManager;
    }

    private wheel = (e: WheelEvent) => {
        this.getMousePosition(e);
        this.uiManager.resolveWheelEvent(e, this.mouse);
        e.preventDefault();
    }

    private keydown = (e: KeyboardEvent) => {
        this._keys[e.key] = true;
    }

    private keyup = (e: KeyboardEvent) => {
        this._keys[e.key] = false;
    }

    private mousedown = (e: MouseEvent) => {
        this._mouseDown = true;
        this.uiManager.resolveClickEvent(this.mouse);
    }

    private mouseup = (e: MouseEvent) => {
        this._mouseDown = false;
        this.uiManager.resolveClickEvent(this.mouse);
    }

    private mousemove = (e: MouseEvent) => {
        this.getMousePosition(e);
        this.uiManager.resolveMouseEvent(this.mouse);
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
