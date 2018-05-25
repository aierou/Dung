import Transform from "../../common/Transform";
import InputController from "../../InputController";
import Entity from "./Entity";

export default class TestSquare2 extends Entity {
    private frameCount: number = 0;
    private inputController: InputController = InputController.Instance;

    public constructor(x, y) {
        super(x, y);
    }

    public update() {
        this.frameCount++;
        // this.transform.x = Math.floor(this.inputController.mouse.x / 128) * 128;
        // this.transform.y = Math.floor(this.inputController.mouse.y / 128) * 128;
        // this.transform.x = 100;
        // this.transform.y = 100;
    }

    public render(ctx: CanvasRenderingContext2D, transform: Transform) {
        this.transform.x = Math.floor(this.inputController.mouse.x / 128) * 128;
        this.transform.y = Math.floor(this.inputController.mouse.y / 128) * 128;
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(this.transform.x, this.transform.y, 128, 128);
    }
}
