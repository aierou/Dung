import Drawable from "../common/Drawable";
import Rectangle from "../common/Rectangle";
import InputController from "../InputController";

export default class UIElement extends Drawable {
    public depth: number = 0;
    protected width: number;
    protected height: number;
    protected inputController: InputController = InputController.Instance;

    constructor(x: number, y: number) {
        super(x, y);
    }

    public render(ctx: CanvasRenderingContext2D, screenRect: Rectangle) { /**/ }

    public getBoundingRectangle() {
        return new Rectangle(this.transform.x, this.transform.y, this.width, this.height);
    }

    public resolveMouseEvent(mouse) { /**/ }
    public resolveWheelEvent(wheel, mouse) { /**/ }
}
