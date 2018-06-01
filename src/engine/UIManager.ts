import Camera from "./Camera";
import Point from "./common/Point";
import InputController from "./InputController";
import UIElement from "./ui/UIElement";

export default class UIManager {
    private elements: UIElement[] = new Array();
    private activeElement: UIElement;
    private inputController: InputController;

    public addUIElement(element: UIElement, depth?: number) {
        if (depth) {
            element.depth = depth;
        }
        this.elements.push(element);
        this.elements.sort((a, b) => {
            return a.depth - b.depth;
        });
    }

    public render(ctx, screenRect) {
        ctx.save();
        ctx.resetTransform();
        this.elements.forEach((element) => {
            element.render(ctx, screenRect);
        });
        ctx.restore();
    }

    public getElementAtPosition(x: number, y: number) {
        for (const element of this.elements) {
            if (element.getBoundingRectangle().containsPoint(new Point(x, y))) {
                return element;
            }
        }
    }

    public resolveWheelEvent(wheel: WheelEvent, mouse) {
        const element = this.getElementAtPosition(mouse.clientX, mouse.clientY);
        if (element) { element.resolveWheelEvent(wheel, mouse); }
    }

    public resolveClickEvent(mouse) {
        if (mouse.isDown) {
            this.activeElement = this.getElementAtPosition(mouse.clientX, mouse.clientY);
        }
        this.activeElement.resolveMouseEvent(mouse);
        if (!mouse.isDown) {
            this.activeElement = null;
        }
    }

    public resolveMouseEvent(mouse) {
        const element = this.activeElement || this.getElementAtPosition(mouse.clientX, mouse.clientY);
        if (element) { element.resolveMouseEvent(mouse); }
    }
}
