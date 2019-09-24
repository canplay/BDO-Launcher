import fileStream from "fs";
import cp from "child_process";
import electron from "electron";
import querystring from "querystring";
import url_module from "url";
import http from "http";
import https from "https";

export default {
  data() {
    return {
      lang: ""
    };
  },

  uuid() {
    return "xxxxxxxx-xxxx-yxxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      let r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  GetUrlParamValue(name) {
    let regex = window.location.search
      .substr(1)
      .match("(^|&)" + name + "=([^&]*)(&|$)", "i");
    if (!regex) return null;
    return decodeURIComponent(regex[2]);
  },

  GetRequest() {
    let url = location.search;
    let theRequest = new Object();
    if (url.indexOf("?") != -1) {
      let str = url.substr(1);
      let strs = str.split("&");
      strs.forEach(item => {
        theRequest[item.split("=")[0]] = decodeURIComponent(item.split("=")[1]);
      });
    }
    return theRequest;
  },

  RequestURL(url, data, cookie, type, callback) {
    data = data || {};

    let content = querystring.stringify(data);
    let parse_u = url_module.parse(url, true);
    let isHttp = parse_u.protocol === "http:";
    let options = {
      host: parse_u.hostname,
      port: parse_u.port || (isHttp ? 80 : 443),
      path: parse_u.path,
      method: type, // "GET" : "POST"
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": content.length,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.139 Electron/6.0.7 Safari/537.36",
        Referer: url,
        Cookie: cookie
      }
    };

    let req = (isHttp ? http : https).request(options, function(res) {
      let _data = "";

      res.on("data", function(chunk) {
        _data += chunk;
      });

      res.on("end", function() {
        let cookie = "";
        let cookies = res.headers["set-cookie"];
        if (cookies) {
          cookies.forEach(val => {
            cookie += val + ";";
          });
        }

        callback != undefined && callback("success", _data, cookie);
      });
    });

    req.on("error", err => {
      callback != undefined && callback("error", err);
    });

    req.write(content);
    req.end();
  },

  SimlateURL(url, callback) {
    let view = new electron.remote.BrowserView();

    view.webContents.loadURL(url, {
      httpReferrer: url
    });

    view.webContents.on("did-fail-load", (code, error) => {
      callback("fail", error);
      view.destroy();
    });

    view.webContents.on("did-finish-load", () => {
      view.webContents
        .executeJavaScript(`document.body.innerHTML;`)
        .then(result => {
          callback("success", result);
          view.destroy();
        });
    });
  },

  ipc(event, arg1, arg2, arg3) {
    electron.ipcRenderer.send(event, arg1, arg2, arg3);
  },

  GetJson(file) {
    file = electron.remote.app.getAppPath() + "\\" + file;
    return JSON.parse(fileStream.readFileSync(file).toString());
  },

  SaveJson(data, file) {
    file = electron.remote.app.getAppPath() + "\\" + file;
    fileStream.writeFile(file, data, err => {
      if (err) this.ipc("log", err);
    });
  },

  applyLoc() {
    let json = this.GetJson("lang.json");
    for (let index = 0; index < json.lang.length; index++) {
      if (json.lang[index].default) {
        this.lang = json.lang[index];
        break;
      }
    }
  },

  _endWith(string, str) {
    if (arguments.length != 2) {
      throw "arg number error";
    }
    return string.slice(-str.length) == str;
  },

  _formatString() {
    if (arguments.length != 1) {
      throw "arg number error";
    }
    var reg = /([a-zA-Z])/g;
    var regarray = arguments[0].match(reg);
    if (regarray == null) {
      return arguments[0].split(".");
    }
    if (regarray && regarray.length != 1) {
      throw "version format error";
    }
    var regString = regarray.join("");
    if (this._endWith(arguments[0], regString) != true) {
      throw "version format error";
    }
    return arguments[0]
      .replace(regString, "." + regString.charCodeAt())
      .split(".");
  },

  Compare() {
    if (arguments.length > 2) {
      throw "arg number error";
    } else if (arguments.length < 2) {
      throw "arg number error";
    } else {
      if (arguments[0] == arguments[1]) {
        return 0;
      }
      var arr1 = this._formatString(arguments[0]);
      var arr2 = this._formatString(arguments[1]);
      var length = Math.min(arr1.length, arr2.length);
      for (var i = 0; i != length; i++) {
        if (arr1[i] > arr2[i]) {
          return 1;
        } else if (arr1[i] < arr2[i]) {
          return -1;
        }
      }
      if (length == arr1.length) {
        return -1;
      } else {
        return 1;
      }
    }
  },

  CheckAutoStart() {
    if (
      !fileStream.existsSync(
        "C:/ProgramData/Microsoft/Windows/Start Menu/Programs/StartUp/BDO Launcher.lnk"
      )
    )
      return false;
    return true;
  },

  EnableAutoStart() {
    let process = cp
      .exec(
        'Permission.exe EnableAutoStartShotcut "' +
          electron.remote.app.getAppPath() +
          '/../../../BDO Launcher.exe" BDO Launcher.lnk',
        {
          cwd: electron.remote.app.getAppPath(),
          windowsHide: true
        }
      )
      .on("exit", () => {
        process.kill();
      });
  },

  DisableAutoStart() {
    let process = cp
      .exec(
        'Permission.exe DisableAutoStartShotcut "' +
          electron.remote.app.getAppPath() +
          '/../../../BDO Launcher.exe" BDO Launcher.lnk',
        {
          cwd: electron.remote.app.getAppPath(),
          windowsHide: true
        }
      )
      .on("exit", () => {
        process.kill();
      });
  },

  async RunGame(dir, server, username, password, callback) {
    let process = await cp
      .exec(
        'Permission.exe RunGame "' +
          dir +
          '" "' +
          server +
          '" ' +
          username +
          " " +
          password,
        {
          cwd: electron.remote.app.getAppPath(),
          windowsHide: true
        }
      )
      .on("exit", code => {
        process.kill();
        callback(code);
      });
  }
};
