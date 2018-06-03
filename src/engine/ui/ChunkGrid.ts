import Point from "../common/Point";
import WorldEditorInfo from "../common/WorldEditorInfo";
import UIElement from "./UIElement";

export default class ChunkGrid extends UIElement {
    private worldEditorInfo: WorldEditorInfo;

    constructor(worldEditorInfo: WorldEditorInfo) {
        super();
        this.worldEditorInfo = worldEditorInfo;
    }

    public render(ctx: CanvasRenderingContext2D) {
        const loadedChunks = this.worldEditorInfo.world.getLoadedChunks();
        const chunkSize = this.worldEditorInfo.world.chunkSize;
        const tileSize = this.worldEditorInfo.tileSize;
        const m = this.worldEditorInfo.getActiveCamera().getRenderMatrix();

        ctx.save();
        ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
        for (const chunk of loadedChunks) {
            ctx.fillStyle = ((chunk.position.x + chunk.position.y) % 2 === 0) ? "#66666666" : "#88888866";
            const rect = chunk.getBoundingRectangle();
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            const p = new Point(rect.x / (chunkSize * tileSize), rect.y / (chunkSize * tileSize));
            ctx.fillStyle = "#ffffffaa";
            ctx.font = "bold 500px sans-serif";
            ctx.fillText(p.x + ", " + p.y, rect.x + (rect.width / 3), rect.y + (rect.height / 2));
        }
        ctx.restore();
    }
}
