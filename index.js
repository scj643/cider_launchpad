const path = require("path")
const {ipcMain} = require("electron")


module.exports = class V2Plugin {
    constructor(env) {
        // Define plugin enviornment within the class
        this.env = env
    }

    // Called when the backend is ready
    onReady(win) {
        console.log("=== Backend Plugin Loaded ===")
    }

    // Called when the renderer is ready (app.init())
    onRendererReady(win) {
        console.log("Renderer Ready Called")
        this.env.utils.loadJSFrontend(path.join(this.env.dir, "index.frontend.js"))
    }
}