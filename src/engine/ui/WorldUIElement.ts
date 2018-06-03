import Camera from "../Camera";
import PinchInfo from "../common/PinchInfo";
import Rectangle from "../common/Rectangle";
import WorldEditorInfo from "../common/WorldEditorInfo";
import World from "../world/World";
import UIElement from "./UIElement";

export default class WorldElement extends UIElement {
    private worldEditorInfo: WorldEditorInfo;

    constructor(worldEditorInfo: WorldEditorInfo) {
        super(0, 0);
        this.worldEditorInfo = worldEditorInfo;
    }

    public resolveMouseEvent(mouse) {
        if (this.inputController.getKey("Control")
                || !this.worldEditorInfo.editing
                || this.inputController.isPinching()) {

            this.worldEditorInfo.getActiveCamera().resolveMouseEvent(mouse);
        } else {
            if (mouse.isDown) {
                const chunk = this.worldEditorInfo.world.getChunkAtPosition(mouse.x, mouse.y);
                if (chunk) {
                    const pos = chunk.getTilePosition(mouse.x, mouse.y);
                    chunk.tiles.setTile(this.worldEditorInfo.selectedTile, pos.x, pos.y);
                }
            }
        }
    }

    public resolveWheelEvent(wheel: WheelEvent, mouse) {
        if (this.inputController.getKey("Control") || !this.worldEditorInfo.editing) {
            const camera: Camera = this.worldEditorInfo.getActiveCamera();
            const zoomLevel =
                camera.getScale() * (wheel.deltaY > 0 ? (1 / camera.SCALING_RATIO) : camera.SCALING_RATIO);
            camera.zoomToPoint(zoomLevel, mouse.clientX, mouse.clientY);
        }
    }

    public resolvePinchEvent(pinch: PinchInfo) {
        if (!pinch.startValue) {
            pinch.startValue = this.worldEditorInfo.getActiveCamera().getScale();
        }
        const zoomLevel = pinch.startValue + ((pinch.distance / pinch.startDistance) - 1);
        this.worldEditorInfo.getActiveCamera().zoomToPoint(zoomLevel, pinch.startPosition.x, pinch.startPosition.y);
    }

    public getBoundingRectangle() {
        return new Rectangle(-Infinity, -Infinity, Infinity, Infinity);
    }
}
