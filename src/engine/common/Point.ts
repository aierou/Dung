/**
 * This needs some arithmetic methods.
 */
export default class Point {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public toString(): string {
        return this.x + ", " + this.y;
    }

    public clone(): Point {
        return new Point(this.x, this.y);
    }

    public midpoint(point: Point): Point {
        return new Point(
            (this.x + point.x) / 2,
            (this.y + point.y) / 2,
        );
    }

    public applyMatrixTransform(matrix: SVGMatrix): Point {
        return new Point((this.x * matrix.a) + (this.y * matrix.c) + matrix.e,
                         (this.x * matrix.b) + (this.y * matrix.d) + matrix.f);
    }
}
