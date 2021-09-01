<template>
  <div>
    <TopBar />
    <el-container>
      <!-- <el-header> </el-header> -->

      <el-main>
        <!-- page -->
        <router-view />
      </el-main>

      <el-footer>
        <p>
          <el-link href="/">UCS Archive</el-link>&nbsp;
          <el-link
            type="primary"
            href="https://gall.dcinside.com/board/lists/?id=pumpitup"
            target="_blank"
            >Pump It Up Gallery</el-link
          >
        </p>
      </el-footer>
    </el-container>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import TopBar from "./components/TopBar.vue";

export default defineComponent({
  name: "App",
  components: {
    TopBar,
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
