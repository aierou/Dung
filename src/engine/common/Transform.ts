import Point from "./Point";

export default class Transform {
    public x: number;
    public y: number;
    public rot: number;

    public get position(): Point {
        return new Point(this.x, this.y);
    }

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public clone(): Transform {
        return (Object.assign(Object.create(Object.getPrototypeOf(this)), this) as Transform);
    }

    public equals(transform: Transform) {
        return transform.x === this.x
            && transform.y === this.y
            && transform.rot === this.rot;
    }
}
