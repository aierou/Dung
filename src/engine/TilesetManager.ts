import SpriteManager from "./SpriteManager";

export default class TilesetManager {
    private static tilesets: Map<string, SpriteManager> = new Map();

    public static getTileset(tileset: string, tileSize: number) {
        let spriteManager = this.tilesets.get(tileset);
        if (!spriteManager) {
            spriteManager = new SpriteManager("tilesets/" + tileset + ".png", tileSize, tileSize);
            this.tilesets.set(tileset, spriteManager);
            spriteManager.load();
        }
        return spriteManager;
    }
}
