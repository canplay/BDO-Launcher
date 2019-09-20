<template>
  <q-layout>
    <q-img
      src="../statics/bg.png"
      class="fixed-center fit"
      style="z-index: -1"
    />

    <q-toolbar class="text-white q-electron-drag transprent">
      <q-img
        src="statics/icon.png"
        style="width: 36px; height: 36px"
      />&nbsp;&nbsp;
      <div class="text-black">
        <q-badge class="bg-accent">{{ title }} {{ version }}</q-badge>
      </div>

      <q-space />

      <q-btn
        v-if="appurl === 'index'"
        dense
        flat
        color="black"
        icon="file_download"
        @click="download"
      >
        <q-tooltip v-model="show_download" content-style="font-size: 12px">{{
          download_tip
        }}</q-tooltip>
      </q-btn>

      <q-btn
        v-if="appurl === 'index'"
        dense
        flat
        color="black"
        icon="settings"
        @click="option"
      >
        <q-tooltip content-style="font-size: 12px">Option</q-tooltip>
      </q-btn>

      <q-btn dense flat color="black" icon="minimize" @click="minimize">
        <q-tooltip content-style="font-size: 12px">Minimize</q-tooltip>
      </q-btn>

      <!-- <q-btn dense flat color="black" icon="crop_square" @click="maximize">
        <q-tooltip content-style="font-size: 12px">maximize</q-tooltip>
      </q-btn> -->

      <q-btn dense flat color="black" icon="close" @click="close">
        <q-tooltip content-style="font-size: 12px">Close</q-tooltip>
      </q-btn>
    </q-toolbar>

    <q-page-container>
      <router-view ref="container" />
    </q-page-container>

    <q-dialog v-model="dlg_option">
      <q-card>
        <q-card-section class="row items-center">
          <q-form
            ref="option"
            @submit="onSubmit"
            @reset="onReset"
            class="q-gutter-md"
          >
            <q-input
              standout="bg-primary text-white"
              v-model="user"
              label="Account"
              lazy-rules
              :rules="[
                val => (val && val.length > 0) || 'Please enter account'
              ]"
            />

            <q-input
              standout="bg-primary text-white"
              v-model="pwd"
              label="Password"
              lazy-rules
              :rules="[
                val => (val && val.length > 0) || 'Please enter password'
              ]"
            />

            <q-toggle v-model="autologin" label="Auto login" />
            <q-toggle v-model="remember" label="Keep Password" />

            <div class="text-center">
              <q-btn class="fit" label="Save" type="submit" color="primary" />
              <q-btn
                class="fit"
                label="Reset"
                type="reset"
                color="primary"
                flat
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dlg_alert">
      <q-card>
        <q-card-section>
          <div class="text-h6">Notice</div>
        </q-card-section>

        <q-card-section>{{ dlg_alertInfo }}</q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Ok" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<style>
* {
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
body::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
body::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  background: #ededed;
}
body::-webkit-scrollbar-thumb {
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #750050;
}
</style>

<script>
import common from "../store/common.js";
import base64 from "js-base64";

export default {
  name: "MyLayout",

  data() {
    return {
      title: this.$q.electron.remote.getCurrentWindow().getTitle(),
      version: "0.0.0",
      appurl: "index",
      style: { width: "", height: "" },
      dlg_option: false,
      dlg_alert: false,
      dlg_alertInfo: "",
      download_tip: "Downloads",
      show_download: false,
      url_prefix: "",
      user: "",
      pwd: "",
      autostart: false,
      autologin: false,
      remember: false
    };
  },

  methods: {
    minimize() {
      this.$q.electron.remote.getCurrentWindow().minimize();
    },

    maximize() {
      if (this.$q.electron.remote.getCurrentWindow().isMaximized()) {
        this.$q.electron.remote.getCurrentWindow().unmaximize();
      } else {
        this.$q.electron.remote.getCurrentWindow().maximize();
      }
    },

    close() {
      window.close();
    },

    onResize() {
      this.style = {
        width: window.innerWidth + "px",
        height: window.innerHeight - 32 + "px"
      };
    },

    reload(url) {
      this.$router.push({
        path: "/redirect",
        query: url
      });
    },

    download() {
      common.ipc("newWindow", "./statics/AriaNg.html", "webview");
    },

    option() {
      let json = common.GetJson("config.json");
      this.user = base64.Base64.decode(json.user);
      this.pwd = base64.Base64.decode(json.pwd);
      this.autostart = common.CheckAutoStart();
      this.autologin = json.autologin;
      this.remember = json.remember;
      this.dlg_option = true;
    },

    onSubmit() {
      this.$refs.option.validate().then(success => {
        if (success) {
          this.$q.loading.show({
            message: "<b>Saving Settings, please wait...</b>"
          });

          let timer = window.setTimeout(() => {
            this.$q.loading.hide();
          }, 180000);

          if (this.autostart) common.EnableAutoStart();
          else common.DisableAutoStart();

          common.SaveJson(
            '{"user":"' +
              base64.Base64.encode(this.oauser) +
              '","pwd":"' +
              base64.Base64.encode(this.oapwd) +
              '",' +
              '"autostart":' +
              true +
              ',"autologin":' +
              false +
              ',"remember":' +
              (this.remember ? true : false) +
              "}"
          );

          this.$q.loading.hide();
          window.clearTimeout(timer);
        }
      });
    },

    onReset() {
      this.name = null;
      this.pwd = null;
      this.autologin = false;
      this.autostart = false;
      this.remember = false;
    },

    alert(val) {
      this.dlg_alertInfo = val;
      this.dlg_alert = true;
    },

    download_start(arg) {
      this.download_tip = "正在下载: " + arg;
      this.show_download = true;

      self.setInterval(() => {
        this.download_tip = "下载";
        this.show_download = false;
      }, 3000);
    },

    download_complete(arg) {
      this.download_tip = "下载完成: " + arg;
      this.show_download = true;

      self.setInterval(() => {
        this.download_tip = "下载";
        this.show_download = false;
      }, 3000);
    }
  },

  created() {
    window.addEventListener("resize", this.onResize);
    this.appurl = common.GetUrlParamValue("appurl");

    if (this.appurl != "index")
      this.$router.push("window" + window.location.search);

    let json = common.GetJson("launcher.json");
    if (json) this.version = json.version;

    json = common.GetJson("config.json");
    this.user = base64.Base64.decode(json.user);
    this.pwd = base64.Base64.decode(json.pwd);
    this.autostart = common.CheckAutoStart();
    this.autologin = json.autologin;
    this.remember = json.remember;

    if (this.autostart) common.EnableAutoStart();
    else common.DisableAutoStart();

    this.$root.$on("download_start", this.download_start);
    this.$root.$on("download_complete", this.download_complete);
  },

  destroyed() {
    window.removeEventListener("resize", this.onresize);
    this.$root.$off("download_start", this.download_start);
    this.$root.$off("download_complete", this.download_complete);
  },

  mounted() {
    this.onResize();
  }
};
</script>
