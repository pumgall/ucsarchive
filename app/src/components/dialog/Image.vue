<template>
  <el-dialog
    title="Image"
    v-model="conf.show"
    width="50%"
    :before-close="close()"
    @opened="open"
  >
    <el-image :src="conf.src" />
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<{ show: boolean; src: string }>,
      default: () => ({ show: false, src: '' }),
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const conf = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });

    const open = () => {
      const _ = 1;
    };

    const close = () => {
      const _ = 1;
    };

    return {
      conf,
      open,
      close,
    };
  },
});
</script>