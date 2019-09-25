<template>
  <q-page :style="{ 'min-height': minHeight + 'px', height: minHeight + 'px' }">
    <div class="column vertical-middle">
      <div class="col-auto text-center">
        <q-img src="statics/logo.png" style="width: 500px; height: 111px" />
      </div>

      <div class="col-1" style="margin: 1%" />

      <div class="col">
        <div class="row">
          <div class="col-1"><p style="height: 50px"></p></div>

          <div class="col">
            <div class="column fit">
              <div class="col-10">
                <q-card
                  class="float-right fit"
                  style="background-color: rgba(0, 0, 0, 0.5)"
                >
                  <q-card-section>
                    <q-list dark>
                      <q-item
                        clickable
                        v-ripple
                        v-for="(item, index) in news"
                        :key="index"
                        @click="openurl(item.href)"
                      >
                        <q-item-section avatar>
                          <q-icon :name="item.icon" />
                        </q-item-section>

                        <q-item-section>{{ item.title }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-1" />

              <div class="col">
                <q-card
                  class="fit"
                  style="background-color: rgba(0, 0, 0, 0.5)"
                >
                  <q-card-section class="text-white">{{
                    label_Status
                  }}</q-card-section>
                </q-card>
              </div>
            </div>
          </div>

          <div class="col-1" />

          <div class="col">
            <div class="column">
              <div class="col">
                <q-carousel
                  v-model="slide"
                  animated
                  arrows
                  navigation
                  infinite
                  autoplay
                  class="text-white shadow-1 bg-black"
                  style="height: 250px"
                >
                  <q-carousel-slide
                    class="column no-wrap flex-center"
                    v-for="(item, index) in banner"
                    :name="index"
                    :key="index"
                    :img-src="item.img"
                    @click="openurl(item.href)"
                  >
                    <div class="absolute-bottom custom-caption">
                      <div class="text-subtitle2 text-center">
                        {{ item.title }}
                      </div>
                    </div>
                  </q-carousel-slide>
                </q-carousel>
              </div>

              <div class="col-1" style="margin: 1%" />

              <div class="col">
                <q-card style="background-color: rgba(0, 0, 0, 0.5)">
                  <q-card-section>
                    <div class="q-gutter-md">
                      <q-input
                        standout="bg-teal text-white"
                        v-model="user"
                        :label="label_Username"
                        dark
                        bg-color="black"
                        style="opacity: 0.5"
                      />
                      <q-input
                        standout="bg-teal text-white"
                        v-model="pwd"
                        :label="label_Password"
                        dark
                        bg-color="black"
                        style="opacity: 0.5"
                      />

                      <q-toggle
                        class="text-white"
                        v-model="remember"
                        :label="label_Remember"
                      />
                      <q-toggle
                        class="text-white"
                        v-model="autologin"
                        :label="label_AutoLogin"
                      />

                      <div class="row">
                        <div class="col">
                          <q-btn
                            :label="label_Login"
                            color="primary"
                            class="fit"
                            @click="onLogin"
                          />
                        </div>

                        <div class="col-1" />

                        <div class="col">
                          <q-btn
                            :label="label_Register"
                            color="secondary"
                            class="fit"
                            @click="onShowRegister"
                          />
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>

          <div class="col-1" />
        </div>
      </div>
    </div>

    <q-dialog v-model="dlg_register">
      <q-card style="width: 500px">
        <q-card-section class="fit items-center">
          <div class="q-gutter-md">
            <q-input
              standout="bg-primary text-white"
              v-model="register_Username"
              :label="label_Username"
            />

            <q-input
              standout="bg-primary text-white"
              v-model="register_Password"
              :label="label_Password"
            />

            <div class="row">
              <div class="col-2 relative-position">
                <div class="absolute-center text-h4">{{ img_Captcha }}</div>
              </div>
              <div class="col-1" />
              <div class="col">
                <q-input
                  standout="bg-primary text-white"
                  v-model="register_Captcha"
                  :label="label_Captcha"
                />
              </div>
            </div>

            <!-- <q-img :src="img_Captcha" style="width: 100%; height: 50px" /> -->

            <div>
              <q-btn class="fit" color="primary" :label="label_Register" @click="onRegister"/>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style></style>

<script>
import common from "../store/common.js";
import base64 from "js-base64";
import cp from "child_process";

export default {
  name: "PageIndex",

  data() {
    return {
      user: "",
      pwd: "",
      slide: 0,
      autologin: false,
      remember: false,
      dir: "",
      launcher: "",
      logined: false,
      minHeight: 0,
      news: [],
      banner: [],
      update: "",
      version: "",
      remoteVersion: "",
      server: "",
      lang: "",
      label_Username: "",
      label_Password: "",
      label_Remember: "",
      label_AutoLogin: "",
      label_Login: "",
      label_Register: "",
      label_Status: "",
      label_Captcha: "",
      dlg_register: false,
      register_Username: "",
      register_Password: "",
      register_Captcha: "",
      img_Captcha: ""
    };
  },

  methods: {
    onResize() {
      this.minHeight = window.innerHeight - 50;
    },

    openurl(url) {
      common.ipc("newWindow", url, "webview");
    },

    login() {},

    onLogin() {
      let json = common.GetJson("config.json");
      this.dir = json.dir;
      if (!this.dir || this.dir == "") {
        this.$q.notify(common.lang["请先设置游戏所在的目录"]);
        return;
      }

      if (!this.server || this.server == "") {
        this.label_Status = common.lang["连接服务器失败"];
        return;
      }

      if (!this.user || this.user == "") {
        this.$q.notify(common.lang["请输入用户名"]);
        return;
      }

      if (!this.pwd || this.pwd == "") {
        this.$q.notify(common.lang["请输入密码"]);
        return;
      }

      // this.label_Status = common.lang["正在登录游戏..."];

      this.$q.loading.show();

      let timer = window.setTimeout(() => {
        this.$q.loading.hide();
        this.label_Status = common.lang["启动游戏失败"];
        window.clearTimeout(timer);
      }, 180000);

      this.$root.$emit(
        "saveOption",
        this.remember ? base64.Base64.encode(this.user) : "",
        this.remember ? base64.Base64.encode(this.pwd) : "",
        this.autologin ? true : false,
        this.remember ? true : false
      );

      common.RunGame(this.dir, this.server, this.user, this.pwd, code => {
        if (code) {
          window.close();
        } else {
          this.label_Status = common.lang["启动游戏失败"];
          this.$q.loading.hide();
          window.clearTimeout(timer);
        }
      });
    },

    onShowRegister() {
      this.dlg_register = true;

      common.RequestURL(
        this.launcher + "captcha",
        "",
        "",
        "GET",
        (status, data) => {
          if (status == "success") {
            this.img_Captcha = data;
          }
          else {
            this.$q.notify(common.lang["验证码加载失败，请重新打开注册窗口"]);
          }
        }
      );
    },

    onRegister() {
      if (!this.register_Username || this.register_Username == "") {
        this.$q.notify(common.lang["请输入用户名"]);
        return;
      }

      if (!this.register_Password || this.register_Password == "") {
        this.$q.notify(common.lang["请输入密码"]);
        return;
      }

      if (!this.register_Captcha || this.register_Captcha == "") {
        this.$q.notify(common.lang["请输入验证码"]);
        return;
      }

      common.RequestURL(
        this.launcher + "register",
        {
          username: this.register_Username,
          password: this.register_Password,
          captcha: this.register_Captcha
        },
        "",
        "GET",
        (status, data) => {
          if (status == "success") {
            console.log(data);
          }
        }
      );
    },

    request() {
      let json;

      common.RequestURL(this.launcher, "", "", "GET", (status, data) => {
        if (status == "success") {
          try {
            json = JSON.parse(data.toString());
          } catch (e) {
            this.label_Status = common.lang["连接服务器失败"];
            return;
          }

          this.update = json.update;
          this.remoteVersion = json.version;
          this.server = json.server;

          try {
            json.news.forEach(item => {
              this.news.push({
                title: item.title,
                icon: item.icon,
                href: item.href
              });
            });

            json.banner.forEach(item => {
              this.banner.push({
                title: item.title,
                img: item.img,
                href: item.href
              });
            });

            this.checkUpdate();
          } catch (e) {
            this.label_Status = common.lang["连接服务器失败"];
          }
        } else {
          this.request();
        }
      });
    },

    checkUpdate() {
      this.label_Status = common.lang["正在检查更新..."];

      let result = common.Compare(this.version, this.remoteVersion);
      if (result == -1) {
        this.label_Status = common.lang["正在更新..."];

        try {
          let name = this.update.split("/")[this.update.split("/").length - 1];
          let type = this.update.split(".")[this.update.split(".").length - 1];

          const ws = new WebSocket("ws://localhost:6800/jsonrpc");

          ws.onopen = () => {
            let command = {};
            command.id = common.uuid();
            command.jsonrpc = "2.0";
            command.method = "aria2.addUri";
            command.params = ["token:CaNplay", [this.update]];
            ws.send(JSON.stringify(command));
          };

          ws.onmessage = event => {
            let json = JSON.parse(event.data);
            if (!json) return;
            switch (json.method) {
              case "aria2.onDownloadStart":
                this.$root.$emit("download_start", "更新");
                break;
              case "aria2.onDownloadComplete":
                this.$root.$emit("download_complete", "更新");
                ws.close();
                if (type === "exe") {
                  cp.exec(
                    'explorer.exe "' +
                      this.$q.electron.remote.app.getAppPath() +
                      '\\downloads\\"' +
                      name
                  );
                  window.close();
                }
                break;
            }
          };
        } catch (e) {
          this.label_Status = common.lang["检查更新失败"];
        }
      } else if (result == 0) this.label_Status = common.lang["已是最新"];
      else this.label_Status = common.lang["检查更新失败"];
    }
  },

  created() {
    window.addEventListener("resize", this.onResize);

    this.label_Status = common.lang["正在连接服务器..."];

    let json = common.GetJson("config.json");
    if (json.user != "") this.user = base64.Base64.decode(json.user);
    if (json.pwd != "") this.pwd = base64.Base64.decode(json.pwd);
    this.autologin = json.autologin;
    this.remember = json.remember;
    this.version = json.version;
    this.dir = json.dir;
    this.launcher = json.launcher;

    common.applyLoc();

    this.label_Username = common.lang["用户名"];
    this.label_Password = common.lang["密码"];
    this.label_Remember = common.lang["保存密码"];
    this.label_AutoLogin = common.lang["自动登录"];
    this.label_Login = common.lang["登录"];
    this.label_Register = common.lang["注册"];
    this.label_Captcha = common.lang["请输入左边显示的验证码"];
  },

  mounted() {
    this.onResize();

    this.request();

    if (this.autologin) {
      if (!this.logined) this.login();
    }
  },

  destroyed() {
    window.removeEventListener("resize", this.onResize);
  }
};
</script>
