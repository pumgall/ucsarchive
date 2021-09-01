<template>
  <div>
    <el-card class="box-card">
      <el-button
        v-if="isAuthorLevel"
        @click="newPost"
        type="primary"
        >New</el-button
      >
      <post-table
        :modelValue="postList"
        :cartButton="true"
        :modifyDeleteButton="true"
        :filterSelect="true"
        @refresh="getList"
      />
    </el-card>
    <post-dialog v-model="postDialog" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from "vue";

import PostTable from "./table/Post.vue";
import PostDialog from "./dialog/Post.vue";

import { getStore } from "../store";
import { LEVEL_AUTHOR, PostDoc } from "../common";

export default defineComponent({
  components: {
    PostTable,
    PostDialog,
  },
  setup() {
    const store = getStore();

    const postList = ref([] as PostDoc[]);
    const getList = async () => {
      const r = await store.state.cmd.postList("", []);

      postList.value = r;
    };


    const userId = computed(() => store.state.userId);
    const userLevel = computed(() => store.state.userLevel);
    const loading = computed(() => store.state.loading);
    const isAuthorLevel = computed(() => LEVEL_AUTHOR <= userLevel.value);

    const postDialog = reactive({
      show: false,
      post: {} as PostDoc,
      confirmed: getList,
    });
    const newPost = () => (postDialog.show = true);

    getList();

    return {
      postList,
      userId,
      userLevel,
      loading,
      isAuthorLevel,

      getList,
      newPost,

      postDialog,
    };
  },
});
</script>