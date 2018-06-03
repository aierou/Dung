import DragInfo from "./common/DragInfo";
import Matrix from "./common/Matrix";
import Point from "./common/Point";
import Rectangle from "./common/Rectangle";
import Transform from "./common/Transform";
import InputController from "./InputController";

export default class Camera {
    public SCALING_RATIO: number = 1.15;
    private zoom: number = 0.5;
    private inputController: InputController = InputController.Instance;
    private dragInfo: DragInfo = new DragInfo();
    private MINIMUM_SCALE: number = 0.1; // Performance constrained
    private MAXIMUM_SCALE: number = 20; // Arbitrary
    private transform: Transform = new Transform(0, 0);
    private width: number;
    private height: number;

    public resolveMouseEvent(mouse) {
        if (mouse.isDown) {
            if (!this.dragInfo.dragging) {
                if (this.transform.x !== 0 && this.transform.y !== 0) {

                    this.dragInfo.startDrag(this.transform, mouse.x, mouse.y);
                }
            }
        } else {
            if (this.dragInfo.dragging) {
                this.dragInfo.stopDrag();
            }
        }

        if (this.dragInfo.dragging) {
            const pos = {
                x: this.dragInfo.dragPosition.x - mouse.x,
                y: this.dragInfo.dragPosition.y - mouse.y,
            };

            this.transform.x = this.dragInfo.objectPosition.x + pos.x;
            this.transform.y = this.dragInfo.objectPosition.y + pos.y;
        }
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

    public getRenderMatrix() {
        return new Matrix().scaleNonUniform(this.zoom, this.zoom).translate(-this.transform.x, -this.transform.y);
    }

    public zoomToPoint(zoomLevel: number, x: number, y: number) {
        zoomLevel = Math.min(Math.max(zoomLevel, this.MINIMUM_SCALE), this.MAXIMUM_SCALE);
        // Point before zoom
        const pos1 = new Point(x, y).applyMatrixTransform(this.getRenderMatrix().inverse());

        // Point after zoom
        let transform = new Matrix();
        transform = transform.scaleNonUniform(zoomLevel, zoomLevel).translate(-this.transform.x, -this.transform.y);
        const pos2 = new Point(x, y).applyMatrixTransform(transform.inverse());

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
        ctx._scale = this.zoom;
        ctx.translate(-this.transform.x, -this.transform.y);
    }
}
