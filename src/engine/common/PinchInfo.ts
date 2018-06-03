import Point from "./Point";

export default class PinchInfo {
    public startValue: number;
    private _distance: number;
    private _startDistance: number;
    private _startPosition: Point;

    public get startDistance() {
        return this._startDistance;
    }

    public get startPosition() {
        return this._startPosition.clone();
    }

    public get distance() {
        return this._distance;
    }

    public set distance(distance: number) {
        this._distance = distance;
    }

    constructor(startPosition: Point, startDistance: number) {
        this._startDistance = startDistance;
        this._startPosition = startPosition;
    }
}
