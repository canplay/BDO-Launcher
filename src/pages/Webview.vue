<template>
  <div class="row" style="padding: 20px">
    <div class="col">
      <webview
        v-if="type === 'webview'"
        id="webview"
        :src="url"
        :httpreferrer="url"
        useragent="Mozilla/5.0 (Windows NT 10.0; WOW64; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.131 Safari/537.36 Core/1.70.3722.400"
      ></webview>
      <webview
        v-else-if="type === 'webviewnode'"
        id="webview"
        :src="url"
        :httpreferrer="url"
        useragent="Mozilla/5.0 (Windows NT 10.0; WOW64; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.131 Safari/537.36 Core/1.70.3722.400"
        nodeintegration
      ></webview>
      <iframe
        v-else
        id="webview"
        :src="url"
        frameborder="0"
        allowtransparency="true"
        allowfullscreen="true"
        scrolling="no"
      ></iframe>
    </div>
  </div>
</template>

<script>
import common from "../store/common.js";
import cp from "child_process";

export default {
  name: "PageWebview",

  props: {
    type: String,
    url: String
  },

  data() {
    return {
      webview: null,
      executeList: []
    };
  },

  methods: {
    onResize() {
      if (this.webview) {
        this.webview.style.width = window.innerWidth - 40 + "px";
        this.webview.style.height = window.innerHeight - 90 + "px";
      }
    },

    domready() {
      // this.webview.openDevTools();

      this.webview.insertCSS(
        "* { -webkit-user-select: none; -webkit-touch-callout: none; } " +
          "body::-webkit-scrollbar { width: 10px; height: 10px; } " +
          "body::-webkit-scrollbar-track { -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2); border-radius: 10px; background: #EDEDED; } " +
          "body::-webkit-scrollbar-thumb { border-radius: 10px; -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2); background: #750050; } "
      );

      this.webview.addEventListener("did-fail-load", this.didfailload);
      this.webview.addEventListener("did-start-loading", this.didstartloading);
      this.webview.addEventListener("did-stop-loading", this.didstoploading);
      this.webview.addEventListener("new-window", this.newwindow);
      this.webview.addEventListener("ipc-message", this.ipcmessage);

      this.executeList.forEach(item => {
        this.webview.executeJavaScript(item.arg, item.user, item.callback);
      });
    },

    didfailload() {
      this.url = window.location.origin + "/404";
    },

    didstartloading() {
      this.$q.loading.show();

      common.ipc("cookies", this.url);

      setInterval(() => {
        this.$q.loading.hide();
      }, 30000);
    },

    didstoploading() {
      this.$q.loading.hide();
    },

    newwindow(event, arg) {
      common.ipc("newWindow", event.url, "webview", arg);
    },

    ipcmessage(event) {
      switch (event.channel) {
        case "notify":
          common.ipc("notify", event.args[0], event.args[1]);
          this.ipc("log", "notify: " + event.args[1]);
          break;
      }
    },

    execute(arg, user, callback) {
      this.executeList.push({ arg, user, callback });
    },

    onmessage(event) {
      let regx = event.message.match(/webview: (.*) { list: \[(.*)\] }/i);
      if (!regx) return;

      switch (regx[1]) {
        case "openFolder":
          cp.exec(
            'explorer.exe /select,"' +
              this.$q.electron.remote.app.getAppPath() +
              '\\downloads\\"' +
              regx[2]
          );
          break;
        case "openFile":
          cp.exec(
            'explorer.exe "' +
              this.$q.electron.remote.app.getAppPath() +
              '\\downloads\\"' +
              regx[2]
          );
          break;
        case "openDownloadFolder":
          cp.exec(
            'explorer.exe "' +
              this.$q.electron.remote.app.getAppPath() +
              '\\downloads\\"'
          );
          break;
      }
    }
  },

  created() {
    window.addEventListener("resize", this.onResize);

    this.$q.loading.show();

    this.$q.electron.ipcRenderer.removeAllListeners();

    let cookies;
    this.$q.electron.ipcRenderer.on("cookies", (event, arg) => {
      cookies = "Cookie:";
      arg.forEach(item => {
        cookies += " " + item.name + "=" + item.value + ";";
      });
    });

    this.$q.electron.ipcRenderer.on("download", (event, arg1, arg2) => {
      const ws = new WebSocket("ws://localhost:6800/jsonrpc");

      ws.onopen = () => {
        let command = {};
        command.id = common.uuid();
        command.jsonrpc = "2.0";
        command.method = "aria2.addUri";
        command.params = [
          "token:CaNplay",
          [arg1],
          { header: [cookies], out: arg2 }
        ];
        ws.send(JSON.stringify(command));
      };

      ws.onmessage = event => {
        let json = JSON.parse(event.data);
        if (!json) return;

        switch (json.method) {
          case "aria2.onDownloadStart":
            this.$root.$emit("download_start", arg2);
            break;

          case "aria2.onDownloadComplete":
            this.$root.$emit("download_complete", arg2);
            ws.close();
            break;
        }
      };
    });

    this.execute("document.getElementsByClassName('input')[0].focus();");
  },

  mounted() {
    this.webview = document.getElementById("webview");
    this.webview.addEventListener("dom-ready", this.domready);
    this.webview.addEventListener("console-message", this.onmessage);
    this.onResize();

    // if (this.url === "./statics/AriaNg.html") {
    //   this.execute(
    //     "document.querySelector('#siderbar-menu > li:nth-child(1)').innerText = 'Download';"
    //   );
    // }
  },

  destroyed() {
    window.removeEventListener("resize", this.onResize);
    this.webview.removeEventListener("dom-ready", this.domready);
    this.webview.removeEventListener("console-message", this.onmessage);
    this.webview.removeEventListener("did-fail-load", this.didfailload);
    this.webview.removeEventListener("did-start-loading", this.didstartloading);
    this.webview.removeEventListener("did-stop-loading", this.didstoploading);
    this.webview.removeEventListener("new-window", this.newwindow);
    this.webview.removeEventListener("ipc-message", this.ipcmessage);
  }
};
</script>

<style></style>
