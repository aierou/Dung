import Camera from "./Camera";
import PinchInfo from "./common/PinchInfo";
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

        // Index relates to depth, so reverse iterate to draw highest depth first
        for (let i = this.elements.length - 1; i >= 0; i--) {
            const element = this.elements[i];
            if (element.enabled) {
                element.render(ctx, screenRect);
            }
        }
        ctx.restore();
    }

    public getElementAtPosition(x: number, y: number) {
        for (const element of this.elements) {
            if (element.enabled && element.getBoundingRectangle().containsPoint(new Point(x, y))) {
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

    public resolvePinchEvent(pinch: PinchInfo) {
        const element = this.getElementAtPosition(pinch.startPosition.x, pinch.startPosition.y);
        if (element) { element.resolvePinchEvent(pinch); }
    }
}
