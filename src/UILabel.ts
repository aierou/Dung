import { Transform } from "./Transform";
import UIElement from "./UIElement";

export default class UILabel extends UIElement {
    public text: string;
    public font: string;
    public color: string;
    public outline: boolean;

    constructor(text: string, font: string = "bold 20px sans-serif", color: string = "#ffffff") {
        super(20, 20);
        this.font = font;
        this.color = color;
        this.text = text;
    }

    public render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.transform.x, this.transform.y);
        if (this.outline) {
            ctx.strokeStyle = "#000000";
            ctx.strokeText(this.text, this.transform.x, this.transform.y);
        }
        ctx.restore();
    }
}
