import { Transform } from "./Transform";

export default class DragInfo {
    private _dragPosition: Transform;
    private _dragging: boolean = false;
    private _objectPosition: Transform;

    public get dragging() {
        return this._dragging;
    }

    public get dragPosition() {
        return this._dragPosition;
    }

    public get objectPosition() {
        return this._objectPosition;
    }

    public startDrag(transform: Transform, x: number, y: number) {
        this._objectPosition = transform;
        this._dragPosition = new Transform(x, y);
        this._dragging = true;
    }

    public stopDrag() {
        this._dragging = false;
    }
}
