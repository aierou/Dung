import Transform from "./Transform";

export default class Drawable {
    public transform: Transform;

    constructor(x: number = 0, y: number = 0) {
        this.transform = new Transform(x, y);
    }

    public render(ctx: CanvasRenderingContext2D) { /* Override */ }
}
