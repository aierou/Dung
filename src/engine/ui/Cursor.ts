import UIElement from "./UIElement";

export default class Cursor extends UIElement {
    constructor() {
        super(0, 0);
    }

    public render(ctx: CanvasRenderingContext2D, screenRect) {
        // this.transform.x = Math.floor(this.inputController.mouse.x / 128) * 128;
        // this.transform.y = Math.floor(this.inputController.mouse.y / 128) * 128;
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(this.transform.x, this.transform.y, 128, 128);
    }
}
