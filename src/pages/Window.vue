<template>
  <q-page>
    <myWebview :url="url" :type="type" ref="webview"></myWebview>
  </q-page>
</template>

<style></style>

<script>
import common from "../store/common.js";
import PageWebview from "./Webview.vue";

export default {
  name: "PageWindow",

  data() {
    return {
      url: window.location.origin + "/404",
      type: "webview"
    };
  },

  components: {
    myWebview: PageWebview
  },

  methods: {},

  created() {
    this.url = this.$route.query.appurl;
    this.type = this.$route.query.type;

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
  },

  mounted() {},

  destroyed() {}
};
</script>
