import { Sprite } from "./Sprite";
import { Transform } from "./Transform";

export class Entity {
    public transform: Transform;
    private lastTransform: Transform;

    constructor(x: number, y: number) {
        this.transform = new Transform(x, y);
        this.lastTransform = this.transform.clone();
    }

    public update() { /* Override */ }

    public render(ctx: CanvasRenderingContext2D, renderTransform: Transform) { /* Override */ }

    public setLastTransform() {
        this.lastTransform = this.transform.clone();
    }

    public getInterpolatedTransform(delta: number): Transform {
        const renderx = this.lastTransform.x + delta * (this.transform.x - this.lastTransform.x);
        const rendery = this.lastTransform.y + delta * (this.transform.y - this.lastTransform.y);
        return new Transform(renderx, rendery);
    }
}
