import UIElement from "./ui/UIElement";

export default class UIManager {
    private elements: UIElement[] = new Array();

    public addUIElement(element: UIElement) {
        this.elements.push(element);
    }

    public render(ctx) {
        ctx.save();
        ctx.resetTransform();
        this.elements.forEach((element) => {
            element.render(ctx);
        });
        ctx.restore();
    }
}
