<template>
  <div>
    <el-card class="box-card">
      <el-button @click="getList()">get list</el-button>
      <el-table :data="userList" stripe style="width: 100%">
        <el-table-column prop="id" label="id" width="200"> </el-table-column>
        <el-table-column prop="level" label="level" width="200">
          <template v-slot="scope">
            <el-input-number
              placeholder="id"
              v-model.number="scope.row.level"
              min="0"
              max="100"
            ></el-input-number>
          </template>
        </el-table-column>
        <el-table-column label="Operations">
          <template v-slot="scope">
            <el-button
              size="small"
              @click="modifyLevel(scope.row.id, scope.row.level)"
              >Modify</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { getStore } from "../store";
import { UserDoc } from "../../../types";

export default defineComponent({
  setup() {
    const store = getStore();
    const userList = ref([] as UserDoc[]);

    const getList = async () => {
      userList.value = await store.state.cmd.userList();
    };

    const modifyLevel = async (id: string, level: number) => {
      await store.state.cmd.modifyLevel(id, level);
      await getList();
    };

    return {
      userList,

      getList,
      modifyLevel,
    };
  },
});
</script>