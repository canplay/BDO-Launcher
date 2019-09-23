import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  session
} from "electron";
import contextMenu from "electron-context-menu";
import fileStream from "fs";
import log from "electron-log";
import cp from "child_process";

// npm run lint
// npm run build
// quasar dev -m electron
// quasar build --mode electron --publish always

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = require("path")
    .join(__dirname, "statics")
    .replace(/\\/g, "\\\\");
}

app.commandLine.appendSwitch("--disable-http-cache");

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
}

let mainWindow, trayIcon, lang;

function createWindow() {
  const packageJson = require("../../package.json");

  const json = require("../../lang.json");
  for (let index = 0; index < json.lang.length; index++) {
    if (json.lang[index].default) lang = json.lang[index];
  }

  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    title: packageJson.productName,
    minWidth: 1366,
    minHeight: 768,
    width: 1366,
    height: 768,
    frame: false,
    show: false,
    center: true,
    icon: __statics + "/icon.png",
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webviewTag: true
    }
  });

  log.transports.console.level = "error, warn, info, verbose, debug, silly";
  log.transports.file.level = "error, warn, info, verbose, debug, silly";
  log.transports.file.maxSize = 5 * 1024 * 1024;
  log.transports.file.file = app.getAppPath() + "/log.log";

  mainWindow.loadURL(process.env.APP_URL + "?appurl=index");

  mainWindow.on("closed", () => {
    mainWindow = null;
    
    let process = cp
      .exec("taskkill /im aria2c.exe /t /f", {
        windowsHide: true
      })
      .on("exit", () => {
        process.kill();
      });

    delDir(app.getAppPath() + "/cached");

    if (trayIcon) trayIcon.destroy();
  });

  mainWindow.on("close", event => {
    // trayIcon.displayBalloon({
    //   title: packageJson.productName,
    //   icon: __statics + "/icon.png",
    //   content: "Click the icon to display the Launcher"
    // });

    // mainWindow.hide();
    // mainWindow.setSkipTaskbar(true);
    // event.preventDefault();
  });

  mainWindow.webContents.session.on(
    "will-download",
    (event, item, webContents) => {
      mainWindow.webContents.send(
        "download",
        item.getURL(),
        item.getFilename()
      );

      event.preventDefault();
    }
  );

  mainWindow.once("ready-to-show", () => {
    trayIcon = new Tray(__statics + "/icon.png");
    const contextMenu = Menu.buildFromTemplate([
      {
        label: lang["退出"],
        type: "normal",
        click: () => {
          app.exit(0);
        }
      }
    ]);
    trayIcon.setTitle(packageJson.productName);
    trayIcon.setToolTip(packageJson.productName);
    trayIcon.setContextMenu(contextMenu);
    trayIcon.on("click", () => {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      mainWindow.setSkipTaskbar(false);
    });

    addDir(app.getAppPath() + "/cached");
    addDir(app.getAppPath() + "/downloads");

    let p = cp
      .exec("aria2c.exe --conf-path=config.conf", {
        cwd: app.getAppPath() + "/aria2",
        windowsHide: true
      })
      .on("exit", () => {
        p.kill();
      });

    mainWindow.show();
    mainWindow.center();
    mainWindow.focus();
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("web-contents-created", (e, contents) => {
  contextMenu({
    window: contents,
    labels: {
      cut: lang["剪切"],
      copy: lang["复制"],
      paste: lang["粘贴"],
      saveImageAs: lang["保存"]
    },
    menu: actions => [
      actions.cut({
        transform: content => `${content}`
      }),
      actions.copy({
        transform: content => `${content}`
      }),
      actions.paste({
        transform: content => `${content}`
      }),
      actions.saveImageAs({
        transform: content => `${content}`
      })
    ]
  });
});

ipcMain.on("newWindow", (event, arg1, arg2) => {
  const packageJson = require("../../package.json");

  let window = new BrowserWindow({
    title: packageJson.productName,
    minWidth: 1280,
    minHeight: 720,
    width: 1280,
    height: 720,
    frame: false,
    show: false,
    center: true,
    icon: __statics + "/icon.png",
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webviewTag: true
    }
  });

  window.loadURL(process.env.APP_URL + "?appurl=" + arg1 + "&type=" + arg2);

  window.on("closed", () => {
    window = null;
  });

  window.once("ready-to-show", () => {
    window.show();
    window.center();
    window.focus();
  });
});

ipcMain.on("log", (event, arg) => {
  log.log(arg);
});

ipcMain.on("notify", (event, title, content) => {
  trayIcon.displayBalloon({
    title: title,
    icon: __statics + "/icon.png",
    content: content
  });
});

ipcMain.on("cookies", (event, url) => {
  session.defaultSession.cookies.get({ url: url }).then(cookies => {
    mainWindow.webContents.send("cookies", cookies);
  });
});

function translate(arg) {
  lang.filter(e => {
    return e.level == arg;
  });
}

async function addDir(path) {
  if (fileStream.existsSync(path)) return;
  await fileStream.mkdirSync(path);
}

async function delDir(path) {
  if (!fileStream.existsSync(path)) return;

  await FileListLoop(path, (file) => {
    if (!fileStream.statSync(file).isDirectory()) fileStream.unlinkSync(file);
    else fileStream.rmdirSync(file);
  });
}

async function dirSize(path) {
  if (!fileStream.existsSync(path)) return;

  let size = 0;

  await FileListLoop(path, (file) => {
    if (!fileStream.statSync(file).isDirectory())
      size += fileStream.statSync(file).size;
    else return (size / 1024 / 1024).toFixed(2);
  });
}

async function FileListLoop(path, callback) {
  if (!fileStream.existsSync(path)) return;

  let files = await fileStream.readdirSync(path);

  files.forEach((file, index) => {
    let curPath = path + "/" + file;

    if (fileStream.statSync(curPath).isDirectory()) {
      FileListLoop(curPath, callback);
    } else {
      callback(curPath);
    }
  });

  callback(path);
}
