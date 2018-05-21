import Camera from "./Camera";
import { Entity } from "./Entity";
import { EntityManager } from "./EntityManager";
import { TestSquare } from "./TestSquare";
import { TestSquare2 } from "./TestSquare2";

export class World {
    public entityManager: EntityManager;
    public camera: Camera;

    constructor() {
        this.entityManager = new EntityManager();
        this.camera = new Camera();
        this.entityManager.addEntity(new TestSquare(100, 100));
        this.entityManager.addEntity(new TestSquare2(100, 100));
    }

    public update(timestamp: number) {
        this.entityManager.update();
    }

    public render(ctx: CanvasRenderingContext2D, delta: number) {
        this.camera.render(ctx);
        this.entityManager.render(ctx, delta);
    }
}
