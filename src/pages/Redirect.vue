<template>
  <q-page></q-page>
</template>

<script>
export default {
  name: "PageRedirect",

  created() {
    let url = this.$route.query;
    let str = "";
    for (let i in url) {
      str += url[i];
    }
    this.$router.push({
      path: str
    });
  }
};
</script>

<style></style>
