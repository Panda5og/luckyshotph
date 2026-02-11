const { app, BrowserWindow } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

let win;

// --------------------
// CREATE MAIN WINDOW
// --------------------
function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, "frontend", "public", "icon.ico")
  });

  const indexPath = path.join(app.getAppPath(), "frontend", "build", "index.html");
  win.loadFile(indexPath).catch(err => {
    console.error("❌ Failed to load index.html:", err);
  });

  // win.webContents.openDevTools();
}

// --------------------
// SET UPDATE SOURCE
// --------------------
autoUpdater.setFeedURL({
  provider: "github",
  owner: "Panda5og",
  repo: "luckyshotph",
  releaseType: "release"
});

// --------------------
// AUTO UPDATER EVENTS
// --------------------
autoUpdater.on("checking-for-update", () => {
  console.log("🔍 Checking for updates...");
});

autoUpdater.on("update-available", info => {
  console.log("⬆️ Update available:", info.version);
});

autoUpdater.on("update-not-available", () => {
  console.log("✔ No updates available.");
});

autoUpdater.on("download-progress", progressObj => {
  console.log(`💾 Downloading update - ${Math.round(progressObj.percent)}%`);
});

autoUpdater.on("update-downloaded", () => {
  console.log("✅ Update downloaded. Installing now...");
  autoUpdater.quitAndInstall();
});

autoUpdater.on("error", err => {
  console.error("❌ Auto-update error:", err);
});

// --------------------
// APP READY
// --------------------
app.whenReady().then(() => {
  createWindow();

  setTimeout(() => {
    console.log("🔄 Checking for updates via GitHub...");
    autoUpdater.checkForUpdates();
  }, 1500);
});

// --------------------
// MACOS BEHAVIOR
// --------------------
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
