import { Entity } from "./Entity";
import { InputController } from "./InputController";
import { Transform } from "./Transform";

export class TestSquare extends Entity {
    private frameCount: number = 0;
    private inputController: InputController = InputController.Instance;

    public update() {
        this.frameCount++;
        // this.transform.x = this.inputController.mouseX;
        // this.transform.y = this.inputController.mouseY;
        this.transform.x = 150 + Math.cos(this.frameCount / 5) * 100;
        this.transform.y = 150 + Math.sin(this.frameCount / 5) * 100;
    }

    public render(ctx: CanvasRenderingContext2D, transform: Transform) {
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(transform.x, transform.y, 50, 50);
        // let n = 0;
        // for (let i = 0; i < 100000000; i++) {
        //     n += i;
        // }
    }
}
