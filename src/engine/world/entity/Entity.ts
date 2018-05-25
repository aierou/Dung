import Drawable from "../../common/Drawable";
import Rectangle from "../../common/Rectangle";
import Sprite from "../../common/Sprite";
import Transform from "../../common/Transform";

export default class Entity extends Drawable {
    public width: number;
    public height: number;
    private lastTransform: Transform;

    constructor(x: number = 0, y: number = 0) {
        super(x, y);
        this.lastTransform = this.transform.clone();
    }

    public update() { /* Override */ }

    public render(ctx: CanvasRenderingContext2D, renderTransform?: Transform) { /* Override */ }

    public setLastTransform() {
        this.lastTransform = this.transform.clone();
    }

    public getInterpolatedTransform(delta: number): Transform {
        const renderx = this.lastTransform.x + delta * (this.transform.x - this.lastTransform.x);
        const rendery = this.lastTransform.y + delta * (this.transform.y - this.lastTransform.y);
        return new Transform(renderx, rendery);
    }

    public getBoundingRectangle() {
        return new Rectangle(this.transform.x, this.transform.y, this.width, this.height);
    }
}
