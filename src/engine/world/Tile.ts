import Sprite from "../common/Sprite";
import Transform from "../common/Transform";
import SpriteManager from "../SpriteManager";

export default class Tile {
    private _id: number;
    private _x: number;
    private _y: number;
    private _sprite: Sprite;

    public get x() {
        return this._x;
    }

    public get y() {
        return this._y;
    }

    public get id() {
        return this._id;
    }

    public set id(id: number) {
        this._id = id;
    }

    public get sprite() {
        return this._sprite;
    }

    constructor(id: number, x: number, y: number) {
        this._id = id;
        this._x = x;
        this._y = y;
    }

    public applySprite(spritesheet: SpriteManager, transform: Transform) {
        this._sprite = spritesheet.getSprite(this._id);
        this._sprite.transform = transform;
    }
}
