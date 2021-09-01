<template>
  <div>
    <el-card class="box-card">
      <el-button @click="copyIds" type="success" :disabled="isEmptyCart"
        >Copy Ids</el-button
      >
      <el-button @click="copyCode" type="success" :disabled="isEmptyCart"
        >Copy Code</el-button
      >
      <el-button @click="clearCart" type="danger" :disabled="isEmptyCart"
        >Clear Cart</el-button
      >
      <post-table
        :modelValue="postList"
        :cartButton="true"
        :modifyDeleteButton="false"
        :filterSelect="false"
        @refresh="nothing"
      />
    </el-card>
    <el-input v-model="clipboardData" ref="text" readonly style="position: fixed; left: 9999px;"></el-input>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { ElMessage } from "element-plus";

import PostTable from "./table/Post.vue";

import { cartStorage } from "../storage";

export default defineComponent({
  components: {
    PostTable,
  },
  setup() {
    const postList = ref(cartStorage.get());
    const text = ref<HTMLInputElement>();
    const clipboardData = ref('');

    const isEmptyCart = computed(() => !postList.value.length);

    const clearCart = () => {
      postList.value.length = 0;
      cartStorage.save();
      ElMessage({ message: "Cleared!" });
    };

    const copy = (data: string) => {
      clipboardData.value = data;
      console.log(data);
      setTimeout(() => {
        text.value?.select();
        document.execCommand("copy");
      }, 0);
      ElMessage({ message: "Copied!" });
    }
    const getIds = () => postList.value.map((v) => v._id).join(",");
    const copyIds = () => copy(getIds());
    const copyCode = () => {
      const data = `
        alert = msg => console.log(msg);
        confirm = msg => true;

        let newList = [${getIds()}];
        let curList = $('[data-ucs_no]').map((i, v) => $(v).attr('data-ucs_no')).get();
        while (curList.length) {
          const n = curList.pop();
          RemovetoUCSSLOT2(n);
        }
        while (newList.length) {
          const n = newList.pop();
          AddtoUCSSLOT(n);
        }
        makeUCSZip();
        location.reload(true);
      `;
      copy(data);
    };

    return {
      postList,
      text,
      clipboardData,

      isEmptyCart,
      clearCart,
      copyIds,
      copyCode,
    };
  },
});
</script>