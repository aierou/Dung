import PinchInfo from "./common/PinchInfo";
import Point from "./common/Point";
import UIManager from "./UIManager";

/**
 * This class should pretty much be entirely re-written.
 * Everything here is pretty much proof-of-concept
 */
export default class InputController {
    private static _instance: InputController;
    private _mouseX: number = 0;
    private _mouseY: number = 0;
    private _mouseDown: boolean = false;
    private _keys: any = {};
    private pinching: boolean = false;
    private pinchInfo: PinchInfo;

    private subscribers: any = {};
    private uiManager: UIManager;
    private ctx: CanvasRenderingContext2D;

    get mouse(): any {
        const ret: any
            = new Point(this._mouseX, this._mouseY).applyMatrixTransform((this.ctx as any).getTransform().inverse());
        ret.clientX = this._mouseX;
        ret.clientY = this._mouseY;
        ret.isDown = this._mouseDown;
        return ret;
    }


    private constructor() {}

    public getKey(key: string): boolean {
        return !!this._keys[key];
    }

    public isPinching(): boolean {
        return this.pinching;
    }

    public init(target: HTMLElement, ctx: CanvasRenderingContext2D) {
        target.addEventListener("mousemove", this.mousemove);
        target.addEventListener("wheel", this.wheel);
        target.addEventListener("mousedown", this.mousedown);
        target.addEventListener("mouseup", this.mouseup);
        document.addEventListener("keydown", this.keydown);
        document.addEventListener("keyup", this.keyup);
        // target.addEventListener("mouseleave", this.mouseup);

        // Touch overrides
        document.addEventListener("touchstart", this.touchHandler, { passive: false });
        document.addEventListener("touchmove", this.touchHandler, { passive: false });
        document.addEventListener("touchend", this.touchHandler, { passive: false });
        document.addEventListener("touchcancel", this.touchHandler, { passive: false });
        this.ctx = ctx;
    }

    /**
     * This isn't very good
     */
    public touchHandler = (event: TouchEvent) => {
        const touches = event.touches;
        if (touches.length === 2) {
            const screenPosition = new Point(touches[0].screenX, touches[0].screenY)
            .midpoint(new Point(touches[1].screenX, touches[1].screenY));
            const clientPosition = new Point(touches[0].clientX, touches[0].clientY)
            .midpoint(new Point(touches[1].clientX, touches[1].clientY));
            const dist = Math.hypot(
                touches[0].clientX - touches[1].clientX,
                touches[0].clientY - touches[1].clientY,
            );
            if (!this.pinching) {
                this.pinching = true;
                this.pinchInfo = new PinchInfo(clientPosition, dist);
            }
            this.pinchInfo.distance = dist;
            this.uiManager.resolvePinchEvent(this.pinchInfo);

            // Try to handle moving the camera as well? These touch events are EXTREMELY Work In Progress

            // if (event.changedTouches.length === 2 && event.type === "mousedown") {
            //     this.getMousePosition({clientX: clientPosition.x, clientY: clientPosition.y});
            // }
            // const simulatedEvent = document.createEvent("MouseEvent");
            // simulatedEvent.initMouseEvent("mousemove", true, true, window, 1,
            //     screenPosition.x, screenPosition.y,
            //     clientPosition.x, clientPosition.y, false,
            //     false, false, false, 0/*left*/, null);

            // event.target.dispatchEvent(simulatedEvent);
        } else {
            this.pinching = false;
            const first = event.changedTouches[0];
            let type = "";

            switch (event.type) {
                case "touchstart": type = "mousedown"; break;
                case "touchmove":  type = "mousemove"; break;
                case "touchend":   type = "mouseup";   break;
                default:           return;
            }

            const simulatedEvent = document.createEvent("MouseEvent");
            simulatedEvent.initMouseEvent(type, true, true, window, 1,
                                        first.screenX, first.screenY,
                                        first.clientX, first.clientY, false,
                                        false, false, false, 0/*left*/, null);

            first.target.dispatchEvent(simulatedEvent);
        }
        event.preventDefault();
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
        this.getMousePosition(e);
        this._mouseDown = true;
        this.uiManager.resolveClickEvent(this.mouse);
    }

    private mouseup = (e: MouseEvent) => {
        this.getMousePosition(e);
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
