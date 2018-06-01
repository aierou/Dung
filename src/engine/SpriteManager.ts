import Sprite from "./common/Sprite";

export default class SpriteManager {
    // Going to have a .getSprite(id) method which returns a Sprite, as well as a .setSpritesheet
    // or maybe a set/add sprite instead, keeping the spritesheet a separate object.
    private spritesheetFileName: string;
    private spritesheet: HTMLImageElement;
    private spriteWidth: number;
    private spriteHeight: number;
    private sprites: ImageBitmap[] = new Array();
    private loaded: boolean = false;

    public constructor(spritesheetFileName: string, spriteWidth: number, spriteHeight: number) {
        this.spritesheetFileName = spritesheetFileName;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
    }

    public load(): Promise<any> {
        if (this.loaded) {
            return Promise.resolve();
        } else {
            return new Promise((resolve, reject) => {
                this.spritesheet = new Image();
                this.spritesheet.onload = () => {
                    this.loaded = true;
                    return resolve(this.createSprites());
                };
                this.spritesheet.src = this.spritesheetFileName;
            });
        }
    }

    public *iterateSpriteImages(): IterableIterator<ImageBitmap> {
        for (const sprite of this.sprites) {
            yield sprite;
        }
    }

    public getSprite(id: number): Sprite {
        if (this.sprites[id]) {
            return new Sprite(this.sprites[id]);
        }
    }

    public getNumberOfSprites(): number {
        return this.sprites.length;
    }

    private createSprites(): Promise<any> {
        const xsize = this.spritesheet.width / this.spriteWidth;
        const ysize = this.spritesheet.height / this.spriteHeight;
        const promises: Array<Promise<ImageBitmap>> = new Array();
        for (let x = 0; x < xsize; x++) {
            for (let y = 0; y < ysize; y++) {
                promises.push(new Promise((resolve, reject) => {
                    createImageBitmap(
                        this.spritesheet,
                        x * this.spriteWidth,
                        y * this.spriteHeight,
                        this.spriteWidth,
                        this.spriteHeight,
                    ).then((sprite: ImageBitmap) => {
                        const id = (y * ysize) + x;
                        this.sprites[id] = sprite;
                        resolve();
                    });
                }));
            }
        }
        return Promise.all(promises);
    }
}
