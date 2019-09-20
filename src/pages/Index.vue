<template>
  <q-page :style="{ 'min-height': minHeight + 'px', height: minHeight + 'px' }">
    <div class="column">
      <div class="col text-center">
        <q-img src="../statics/logo.png" style="width: 500px; height: 111px" />
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
                  class="text-white shadow-1"
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
                    <form
                      @submit.prevent.stop="onSubmit"
                      @reset.prevent.stop="onReset"
                      class="q-gutter-md"
                    >
                      <q-input
                        standout="bg-teal text-white"
                        v-model="text"
                        label="Username"
                        dark
                        bg-color="black"
                        style="opacity: 0.5"
                      />
                      <q-input
                        standout="bg-teal text-white"
                        v-model="text"
                        label="Password"
                        dark
                        bg-color="black"
                        style="opacity: 0.5"
                      />

                      <q-toggle
                        class="text-white"
                        v-model="remember"
                        label="Keep Password"
                      />
                      <q-toggle
                        class="text-white"
                        v-model="autologin"
                        label="Auto login"
                      />

                      <div class="text-center">
                        <q-btn
                          label="Login"
                          type="submit"
                          color="primary"
                          style="width: 50%"
                        />
                      </div>
                    </form>
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
import fileStream from "fs";

export default {
  name: "PageIndex",

  data() {
    return {
      user: "",
      pwd: "",
      slide: 0,
      text: "",
      autologin: false,
      remember: false,
      logined: false,
      minHeight: 0,
      news: [],
      banner: []
    };
  },

  methods: {
    onResize() {
      this.minHeight = window.innerHeight - 50;
    },

    openurl(url) {
      common.ipc("newWindow", url, "webview");
    },

    fill() {},

    login() {},

    onSubmit() {},

    onReset() {}
  },

  created() {
    window.addEventListener("resize", this.onResize);

    let json = common.GetJson("config.json");
    this.user = base64.Base64.decode(json.user);
    this.pwd = base64.Base64.decode(json.pwd);
    this.autologin = json.autologin;
    this.remember = json.remember;

    // common.RequestURL("http://launcher.json", "", "", "GET", data => {
    //   if (data != "error") {
    //     data.banner.forEach(element => {

    //     });
    //   }
    // });

    json = JSON.parse(fileStream.readFileSync("launcher.json").toString());
    if (json) {
      json.news.forEach(item => {
        this.news.push({ title: item.title, icon: item.icon, href: item.href });
      });

      json.banner.forEach(item => {
        this.banner.push({ title: item.title, img: item.img, href: item.href });
      });
    }
  },

  mounted() {
    this.onResize();

    if (this.autologin) {
      if (!this.logined) this.login();
    } else if (this.remember) {
      this.fill();
    }
  },

  destroyed() {
    window.removeEventListener("resize", this.onResize);
  }
};
</script>
