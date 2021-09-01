<template>
  <div>
    <el-menu :default-active="activeIndex" mode="horizontal" router>
      <el-menu-item index="/main">Main</el-menu-item>
      <el-menu-item index="/post">List</el-menu-item>
      <el-menu-item index="/cart">Cart</el-menu-item>
      <el-menu-item v-if="isAdminLevel" index="/userList"
        >User List</el-menu-item
      >

      <!-- login menu -->
      <el-submenu v-if="!userId" index="/login">
        <template #title>Login</template>
        <el-menu-item @click="loginDialog.show = true">Login</el-menu-item>
        <el-menu-item @click="registerDialog.show = true"
          >Register</el-menu-item
        >
      </el-submenu>
      <el-submenu v-else>
        <template #title>Hi, {{ userId }}</template>
        <el-menu-item>Level: {{ userLevel }}</el-menu-item>
        <el-menu-item @click="logout()">Logout</el-menu-item>
      </el-submenu>
    </el-menu>

    <login-dialog v-model="loginDialog" />
    <register-dialog v-model="registerDialog" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, ref } from "vue";
import { useRoute } from "vue-router";

import { getStore } from "../store";
import { LEVEL_ADMIN } from "../../../types";

import LoginDialog from "./dialog/Login.vue";
import RegisterDialog from "./dialog/Register.vue";

export default defineComponent({
  components: {
    LoginDialog,
    RegisterDialog,
  },
  setup() {
    const store = getStore();
    const route = useRoute();
    const activeIndex = route.path;

    console.log(route.path, route.name);
    console.log(typeof route.path);
    console.log(route.hash)

    const loginDialog = reactive({ show: false });
    const registerDialog = reactive({ show: false });

    const userId = computed(() => store.state.userId);
    const userLevel = computed(() => store.state.userLevel);
    const isAdminLevel = computed(() => LEVEL_ADMIN <= userLevel.value);

    const logout = async () => {
      await store.state.cmd.logout();
      store.commit("userInfo", { id: "", level: 0 });
    };

    return {
      loginDialog,
      registerDialog,

      userId,
      userLevel,
      isAdminLevel,

      activeIndex,

      logout,
    };
  },
});
</script>