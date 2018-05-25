import DragInfo from "./common/DragInfo";
import Rectangle from "./common/Rectangle";
import Transform from "./common/Transform";
import InputController from "./InputController";

const SCALING_RATIO = 1.15;
export default class Camera {
    private zoom: number = 0.5;
    private inputController: InputController = InputController.Instance;
    private dragInfo: DragInfo = new DragInfo();
    private MINIMUM_SCALE: number = 0.1; // Performance constrained
    private MAXIMUM_SCALE: number = 20; // Arbitrary
    private transform: Transform = new Transform(0, 0);
    private width: number;
    private height: number;

    constructor() {
        this.inputController.subscribe("wheel", (e: WheelEvent) => {
            if (this.inputController.getKey("Control")) {
                this.zoomToPoint(this.zoom * (e.deltaY > 0 ? (1 / SCALING_RATIO) : SCALING_RATIO),
                    this.inputController.mouse.clientX,
                    this.inputController.mouse.clientY);
                e.preventDefault();
            }
        });

        this.inputController.subscribe("mousemove", (e: MouseEvent) => {
            if (this.dragInfo.dragging && this.inputController.getKey("Control")) {
                const mouse = this.inputController.mouse;

                let transform = createMatrix();
                transform = transform.scaleNonUniform(this.zoom, this.zoom)
                    .translate(this.transform.x, this.transform.y);

                const pos = {
                    x: this.dragInfo.dragPosition.x - mouse.x,
                    y: this.dragInfo.dragPosition.y - mouse.y,
                };

                this.transform.x = this.dragInfo.objectPosition.x + pos.x;
                this.transform.y = this.dragInfo.objectPosition.y + pos.y;
            }
        });
    }

    public resize(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    public getScale() {
        return this.zoom;
    }

    public getBoundingRectangle() {
        return new Rectangle(this.transform.x, this.transform.y, this.width, this.height);
    }

    public zoomToPoint(zoomLevel: number, x: number, y: number) {
        zoomLevel = Math.min(Math.max(zoomLevel, this.MINIMUM_SCALE), this.MAXIMUM_SCALE);
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

    public performDrag() {
        const mouse = this.inputController.mouse;
        if (mouse.isDown && this.inputController.getKey("Control")) {
            if (!this.dragInfo.dragging) {
                this.dragInfo.startDrag(this.transform, mouse.x, mouse.y);
            }
        } else {
            if (this.dragInfo.dragging) {
                this.dragInfo.stopDrag();
            }
        }
    }

    public shake() {
        //
    }

    public render(ctx) {
        ctx.resetTransform();
        ctx.scale(this.zoom, this.zoom);
        ctx._scale = this.zoom;
        ctx.translate(-this.transform.x, -this.transform.y);
        this.performDrag();
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
