<template>
  <q-page :style="{ 'min-height': minHeight + 'px', height: minHeight + 'px' }">
    <div class="column">
      <div class="col text-center">
        <q-img src="statics/logo.png" style="width: 500px; height: 111px" />
      </div>

      <div class="col" style="padding-top: 3%" />

      <div class="col">
        <div class="row">
          <div class="col">
            <q-card
              class="float-right"
              style="background-color: rgba(0, 0, 0, 0.5); width: 70%; height: 90%"
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

          <div class="col" style="padding-left: 50px">
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
                  style="width: 80%; height: 250px"
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

              <div class="col" style="padding-top: 1%" />

              <div class="col">
                <q-card
                  style="background-color: rgba(0, 0, 0, 0.5); width: 80%"
                >
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

                      <div class="text-center">
                        <q-btn
                          :label="label_Login"
                          color="primary"
                          style="width: 50%"
                          @click="onLogin"
                          ref="btnLogin"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style></style>

<script>
import common from "../store/common.js";
import base64 from "js-base64";

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
      server: "",
      lang: "",
      label_Username: "",
      label_Password: "",
      label_Remember: "",
      label_AutoLogin: "",
      label_Login: ""
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
        this.$q.notify("连接服务器失败");
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

      this.$q.loading.show({
        message: "<b>" + common.lang["正在登录游戏..."] + "</b>"
      });

      let timer = window.setTimeout(() => {
        this.$q.loading.hide();
        this.$q.notify(common.lang["启动游戏失败"]);
      }, 180000);

      common.SaveJson(
        '{"user":"' +
          (this.remember ? base64.Base64.encode(this.user) : "") +
          '","pwd":"' +
          (this.remember ? base64.Base64.encode(this.pwd) : "") +
          '","autostart":' +
          false +
          ',"autologin":' +
          (this.autologin ? true : false) +
          ',"remember":' +
          (this.remember ? true : false) +
          ',"dir":"' +
          this.dir +
          '","launcher":"' +
          this.launcher +
          '"}',
        "config.json"
      );

      common.RunGame(this.dir, this.server, this.user, this.pwd);

      this.$q.loading.hide();
      window.clearTimeout(timer);

      window.close();
    },

    readRemote(data) {
      let json;
      try {
        json = JSON.parse(data.toString());
      } catch (e) {
        this.news.push({
          title: common.lang["连接服务器失败"],
          icon: "",
          href: window.location.origin + "/404"
        });
        return;
      }

      this.update = json.update;
      this.server = json.server;

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
    }
  },

  created() {
    window.addEventListener("resize", this.onResize);

    let json = common.GetJson("config.json");
    if (json.user != "") this.user = base64.Base64.decode(json.user);
    if (json.pwd != "") this.pwd = base64.Base64.decode(json.pwd);
    this.autologin = json.autologin;
    this.remember = json.remember;
    this.dir = json.dir;
    this.launcher = json.launcher;

    common.applyLoc();

    this.label_Username = common.lang["用户名"];
    this.label_Password = common.lang["密码"];
    this.label_Remember = common.lang["保存密码"];
    this.label_AutoLogin = common.lang["自动登录"];
    this.label_Login = common.lang["登录"];
  },

  mounted() {
    this.onResize();

    common.RequestURL(this.launcher, "", "", "GET", (status, data) => {
      if (status == "success") {
        this.readRemote(data);
      } else {
        common.RequestURL(this.launcher, "", "", "GET", (status, data) => {
          if (status == "success") {
            this.readRemote(data);
          } else {
            common.RequestURL(this.launcher, "", "", "GET", (status, data) => {
              if (status == "success") {
                this.readRemote(data);
              } else {
                this.readRemote(data);
              }
            });
          }
        });
      }
    });

    if (this.autologin) {
      if (!this.logined) this.login();
    }
  },

  destroyed() {
    window.removeEventListener("resize", this.onResize);
  }
};
</script>
