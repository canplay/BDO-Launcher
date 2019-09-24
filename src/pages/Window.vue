<template>
  <q-page>
    <myWebview :url="url" :type="type" ref="webview"></myWebview>
  </q-page>
</template>

<style></style>

<script>
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
  },

  mounted() {},

  destroyed() {}
};
</script>
