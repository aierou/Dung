import { Entity } from "./Entity";
import { InputController } from "./InputController";
import { Transform } from "./Transform";

export class TestSquare2 extends Entity {
    private frameCount: number = 0;
    private inputController: InputController = InputController.Instance;
    private img;
    private imgloaded: boolean = false;

    public constructor(x, y) {
        super(x, y);
        this.img = new Image();
        this.img.onload = () => {
            console.log("loaded");
            this.imgloaded = true;
        };
        this.img.src = "tilesets/tileset1.png";
    }

    public update() {
        this.frameCount++;
        this.transform.x = this.inputController.mouse.x;
        this.transform.y = this.inputController.mouse.y;
        // this.transform.x = 100;
        // this.transform.y = 100;
    }

    public render(ctx: CanvasRenderingContext2D, transform: Transform) {
        ctx.fillStyle = "#ff0000";
        if (!this.imgloaded) {
            ctx.fillRect(transform.x, transform.y, 50, 50);
        } else {
            ctx.drawImage(this.img, transform.x, transform.y);
        }
    }
}
