import { Entity } from "./Entity";
import { InputController } from "./InputController";

const SCALING_RATIO = 1.15;
export default class Camera extends Entity {
    private zoom: number = 1;
    private inputController: InputController = InputController.Instance;

    constructor() {
        super(0, 0);
        this.inputController.subscribe("wheel", (e: WheelEvent) => {
            this.zoomToPoint(this.zoom * (e.deltaY > 0 ? (1 / SCALING_RATIO) : SCALING_RATIO),
                this.inputController.mouse.clientX,
                this.inputController.mouse.clientY);
        });
    }

    public zoomToPoint(zoomLevel: number, x: number, y: number) {
        // Point before zoom
        let transform = createMatrix();
        transform = transform.scaleNonUniform(this.zoom, this.zoom).translate(this.transform.x, this.transform.y);
        const pos1 = transformPoint({x, y}, transform.inverse());

        // Point after zoom
        transform = createMatrix();
        transform = transform.scaleNonUniform(zoomLevel, zoomLevel).translate(this.transform.x, this.transform.y);
        const pos2 = transformPoint({x, y}, transform.inverse());

        this.transform.x -= pos2.x - pos1.x;
        this.transform.y -= pos2.y - pos1.y;
        this.zoom = zoomLevel;
    }

    public shake() {
        //
    }

    public render(ctx) {
        ctx.resetTransform();
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-this.transform.x, -this.transform.y);
    }
}

function transformPoint(point, matrix) {
    return { x: (point.x * matrix.a) + (point.y * matrix.c) + matrix.e,
            y: (point.x * matrix.b) + (point.y * matrix.d) + matrix.f };
}
const createMatrix = function() {
    const svgNamespace = "http://www.w3.org/2000/svg";
    return document.createElementNS(svgNamespace, "g").getCTM();
};
