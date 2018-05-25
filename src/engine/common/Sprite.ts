import Drawable from "./Drawable";

export default class Sprite extends Drawable {
private image: ImageBitmap;

    public get width(): number {
        return this.image.width;
    }
    public get height(): number {
        return this.image.height;
    }

    constructor(image: ImageBitmap) {
        super();
        this.image = image;
    }
    public render(ctx: CanvasRenderingContext2D, width: number = this.width, height: number = this.height) {
        ctx.drawImage(this.image, this.transform.x, this.transform.y, width, height);
    }
}
