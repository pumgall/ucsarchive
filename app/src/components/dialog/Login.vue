<template>
  <el-dialog
    title="Login"
    v-model="conf.show"
    width="30%"
    :before-close="close()"
    @opened="open"
  >
    <el-form label-width="auto">
      <el-form-item label="ID">
        <el-input placeholder="id" v-model="loginId" ref="autofocus"></el-input>
      </el-form-item>
      <el-form-item label="PW">
        <el-input
          placeholder="pw"
          v-model="loginPw"
          show-password
          @keyup.enter="login()"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="conf.show = false">Cancel</el-button>
        <el-button type="primary" @click="login()">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, ref, PropType } from "vue";
import { getStore } from "../../store";

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<{ show: boolean }>,
      default: () => ({ show: false }),
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const store = getStore();

    const autofocus = ref<any>(null);
    const loginId = ref("");
    const loginPw = ref("");

    const conf = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });

    const login = async () => {
      const id = loginId.value;
      const pw = loginPw.value;
      if (!id || !pw) return;

      const { level } = await store.state.cmd.login(id, pw);
      store.commit("userInfo", { id, level });

      conf.value.show = false;
    };

    const open = () => {
      autofocus.value?.focus();
    };

    const close = () => {
      loginId.value = loginPw.value = "";
    };

    return {
      conf,
      autofocus,
      loginId,
      loginPw,

      login,
      open,
      close,
    };
  },
});
</script>