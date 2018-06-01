import Point from "./Point";

export default class Rectangle {
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    public get bottom(): number {
        return this.height === Infinity ? Infinity : this.y + this.height;
    }

    public get right(): number {
        return this.width === Infinity ? Infinity : this.x + this.width;
    }

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public contains(rect: Rectangle): boolean {
        return rect.x >= this.x
            && rect.y >= this.y
            && rect.x + rect.width < this.right
            && rect.y + rect.height < this.bottom;
    }

    public containsPoint(point: Point): boolean {
        return point.x >= this.x
            && point.y >= this.y
            && point.x < this.right
            && point.y < this.bottom;
    }

    public intersects(rect: Rectangle): boolean {
        return rect.right > this.x
            && rect.bottom > this.y
            && this.right > rect.x
            && this.bottom > rect.y;
    }

    public expand(size: number) {
        this.x -= size;
        this.y -= size;
        this.width += size * 2;
        this.height += size * 2;
        return this;
    }

    public translate(x: number, y: number) {
        this.x += x;
        this.y += y;
        return this;
    }

    public scaleToGrid(gridSize) {
        this.x = Math.floor(this.x / gridSize);
        this.y = Math.floor(this.y / gridSize);
        this.width = Math.floor(this.width / gridSize);
        this.height = Math.floor(this.height / gridSize);
        return this;
    }

    public *iterateGrid(cellSize: number = 1): IterableIterator<Point> {
        const right = Math.floor(this.right / cellSize);
        const bottom = Math.floor(this.bottom / cellSize);
        for (let x = Math.floor(this.x / cellSize); x < right; x++) {
            for (let y = Math.floor(this.y / cellSize); y < bottom; y++) {
                yield new Point(x, y);
            }
        }
    }
}
