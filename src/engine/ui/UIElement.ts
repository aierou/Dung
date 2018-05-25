import Drawable from "../common/Drawable";

export default class UIElement extends Drawable {
    constructor(x: number, y: number) {
        super(x, y);
    }

    public render(ctx: CanvasRenderingContext2D) { /**/ }
}
