<template>
  <div class="fixed-center text-center">
    <p>
      <img src="~assets/sad.svg" style="width:30vw;max-width:150px;" />
    </p>
    <p class="text-faded">程序出错啦...<strong>(404)</strong></p>
    <q-btn color="secondary" style="width:200px;" @click="$router.push('/')"
      >返回</q-btn
    >
  </div>
</template>

<script>
export default {
  name: "Error404"
};
</script>
