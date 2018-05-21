export class Transform {
    public x: number;
    public y: number;
    public rot: number;

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
