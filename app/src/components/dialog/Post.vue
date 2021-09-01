<template>
  <el-dialog
    :title="`${isModify ? 'Modify #' + conf.post._id : 'New'} Post`"
    v-model="conf.show"
    :before-close="close()"
    @opened="open"
    width="80%"
  >
    <el-row>
      <el-col :span="4">
        <el-input
          placeholder="UCS ID"
          v-model="id"
          @keyup.enter="loadUcs(true)"
          @blur="loadUcs(false)"
          :disabled="isModify"
          v-loading="loading"
          ref="autofocus"
          ><!-- @change="loadUcs(false)" -->
        </el-input>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="loadUcs(true)" v-loading="loading"
          >Load UCS</el-button
        >
      </el-col>
    </el-row>
    <el-row v-if="ucs.id">
      <el-card shadow="never" style="width: 100%">
        <el-col :span="6">
          <el-row>
            <el-image :src="song.id ? `/assets/songs/${song.id}.jpg` : ''" />
          </el-row>
          <!-- <el-row> &nbsp; </el-row> -->
        </el-col>
        <el-col :span="17" :offset="1">
          <el-row>
            <span>Time : {{ dateFormat(ucs.time) }}</span>
          </el-row>
          <el-row>
            <span>Song : {{ song.artist }} / {{ song.title }}</span>
          </el-row>
          <el-row>
            <span>Maker : {{ ucs.maker }} ({{ ucs.makerCountry }})</span>
          </el-row>
          <el-row>
            <span>Mode : {{ ucs.mode }}, Level : {{ ucs.level }}</span>
          </el-row>
        </el-col>
      </el-card>
    </el-row>
    <el-row style="width: 100%" v-if="ucs.id">
      <el-card shadow="never" style="width: 100%">
        <el-form
          :model="conf.post"
          :rules="rules"
          ref="postForm"
          label-width="auto"
        >
          <el-form-item label="Grade" prop="grade" ref="autofocus2">
            <el-input v-model="conf.post.grade"></el-input>
          </el-form-item>
          <el-form-item label="Youtube Url" prop="youtubeUrl">
            <el-input v-model="conf.post.youtubeUrl"></el-input>
          </el-form-item>
          <el-form-item label="Month">
            <el-date-picker
              v-model="conf.post.time"
              type="month"
              style="width: 100%"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="Description">
            <editor
              api-key="no-api-key"
              v-model="conf.post.description"
              :init="editorConf"
            />
          </el-form-item>
          <el-form-item label="Tag">
            <el-tag
              :key="tag"
              v-for="tag in conf.post.tags"
              closable
              @close="removeTag(tag)"
              style="margin-left: 10px"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-model="inputTag"
              size="mini"
              @keyup.enter="addTag()"
              style="width: 100px; margin-left: 10px"
            >
            </el-input>
            <el-button size="small" @click="addTag()" style="margin-left: 10px"
              >Add Tag</el-button
            >
          </el-form-item>
        </el-form>
      </el-card>
    </el-row>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="conf.show = false">Cancel</el-button>
        <el-button type="primary" @click="updatePost()">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref } from "vue";
import { DateTime } from "luxon";
import Editor from "@tinymce/tinymce-vue";
import { getStore } from "../../store";
import { UcsDoc, SongDoc, PostDoc } from "../../../../types";

export default defineComponent({
  components: {
    Editor,
  },
  props: {
    modelValue: {
      type: Object as PropType<{
        show: boolean;
        post: PostDoc;
        confirmed?: () => Promise<void>;
      }>,
      default: () => ({ show: false, post: {} }),
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const store = getStore();

    const autofocus = ref<any>(null);
    const autofocus2 = ref<any>(null);
    const id = ref("");
    const ucs = ref<UcsDoc>({} as UcsDoc);
    const song = ref<SongDoc>({} as SongDoc);
    const inputTag = ref("");

    const loading = computed(() => store.state.loading);

    const conf = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });

    const isModify = computed(() => !!conf.value.post._id);

    const loadUcs = async (crawlMode: boolean) => {
      if (isModify.value) return;

      const idn = +id.value;
      if (!idn) return;

      const doc = await store.state.cmd.searchUcsById(idn, crawlMode);
      if (doc) {
        ucs.value = doc;

        const songDoc = await store.state.cmd.songInfo(doc.songId);
        if (songDoc) song.value = songDoc;

        conf.value.post.id = doc.id;
        conf.value.post.tags = [];
      }

      // console.log(doc);
      // console.log(song.value);
    };

    const removeTag = (tag: string) => {
      const tags = conf.value.post.tags;
      if (!tag || !tags) return;

      const idx = tags.indexOf(tag);
      if (-1 < idx) tags.splice(idx, 1);
    };

    const addTag = () => {
      const tags = conf.value.post.tags;
      const tag = inputTag.value;
      if (!tag) return;

      const idx = tags.indexOf(tag);
      if (0 > idx) tags.push(tag);
      inputTag.value = "";
    };

    const updatePost = async () => {
      await store.state.cmd.updatePost(conf.value.post);
      await conf.value.confirmed?.();
      conf.value.show = false;
    };

    // fome rules
    const checkYoutubeUrl = (
      _: any,
      url: string,
      callback: (e?: Error) => void
    ) => {
      if (!url) return callback();

      if (url.match(/https:\/\/youtu\.be\/\w+/)) return callback();

      return callback(
        new Error("invalid youtube url. ex) https://youtu.be/aaaaaaaa")
      );
    };

    const rules = {
      grade: [{ required: true, message: "require input", trigger: "blur" }],
      youtubeUrl: [{ validator: checkYoutubeUrl, trigger: "blur" }],
    };

    const dateFormat = (date: Date) => {
      return DateTime.fromJSDate(date).toFormat("yyyy-LL-dd HH:mm:ss");
    };

    const open = async () => {
      const post = conf.value.post;

      if (post._id) {
        autofocus2.value?.focus();
        ucs.value = post.ucs;
        song.value = post.song;
        id.value = post._id;
      } else autofocus.value?.focus();
    };

    const close = () => {
      ucs.value = {} as UcsDoc;
      song.value = {} as SongDoc;
      inputTag.value = "";
    };

    const editorConf = {
      height: 500,
      menubar: false,
      toolbar:
        "undo redo | formatselect | " +
        "bold italic forecolor backcolor | alignleft aligncenter " +
        "alignright alignjustify | bullist numlist outdent indent | " +
        "removeformat | help",
    };

    return {
      autofocus,
      autofocus2,
      id,
      ucs,
      song,
      inputTag,
      loading,
      conf,
      isModify,

      loadUcs,
      removeTag,
      addTag,
      updatePost,

      rules,

      open,
      close,
      dateFormat,

      editorConf,
    };
  },
});
</script>
<style scoped>
.el-row {
  margin-bottom: 20px;
}
</style>