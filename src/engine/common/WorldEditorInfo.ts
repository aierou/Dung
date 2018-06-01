import Camera from "../Camera";
import World from "../world/World";

export default class WorldEditorInfo {
    public selectedTile: number = 1;
    public backgroundColor: string = "#333333";
    public world: World;
    public tileSize: number = 128;
    private camera: Camera;

    constructor(world: World, camera: Camera) {
        this.world = world;
        this.camera = camera;
    }

    public getActiveCamera() {
        return this.camera;
    }
}
