import Chunk from "./Chunk";
import { Entity } from "./Entity";

export class EntityManager {
    public entities: Entity[];

    constructor() {
        this.entities = [];
        // Here we will get the world tiles so we can figure out pathing stuff
    }

    public update() {
        // Handle ai
        // Handle pathing
        this.entities.forEach((entity) => {
            // Store the last position of the entity for interpolation
            entity.setLastTransform();
            entity.update();
        });
    }

    public render(ctx: CanvasRenderingContext2D, delta: number) {
        this.entities.forEach((entity) => {
            entity.render(ctx, entity.getInterpolatedTransform(delta));
        });
    }

    public addEntity(entity: Entity) {
        this.entities.push(entity);
    }

    public addEntities(entities: Entity[]) {
        this.entities = this.entities.concat(entities);
    }

    public unloadAndSaveToChunk(chunk: Chunk) {
        const unloadedEntities = [];
        this.entities = this.entities.filter((entity) => {
            const rect = chunk.getBoundingRectangle();
            if (rect.containsPoint(entity.transform.position)) {
                unloadedEntities.push(entity);
                return false;
            }
            return true;
        });
        return unloadedEntities;
    }
}
