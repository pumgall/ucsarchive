<template>
  <div>
    <div v-if="filterSelect">
      <el-select
        v-model="filterData['song._id']"
        clearable
        filterable
        multiple
        collapse-tags
        placeholder="Song"
        @change="changeFilter"
      >
        <el-option
          v-for="item in songFilterList"
          :key="item"
          :label="songMap[item]"
          :value="item"
        >
        </el-option>
      </el-select>
      <el-select
        v-model="filterData['ucs.maker']"
        clearable
        filterable
        multiple
        collapse-tags
        placeholder="Maker"
        @change="changeFilter"
      >
        <el-option
          v-for="item in makerFilterList"
          :key="item"
          :label="item"
          :value="item"
        >
        </el-option>
      </el-select>
      <el-select
        v-model="filterData.tag"
        clearable
        filterable
        multiple
        collapse-tags
        placeholder="Tag"
        @change="changeFilter"
      >
        <el-option
          v-for="item in tagFilterList"
          :key="item"
          :label="item"
          :value="item"
        >
        </el-option>
      </el-select>
      <el-select
        v-model="filterData.mode"
        clearable
        filterable
        multiple
        collapse-tags
        placeholder="Mode"
        @change="changeFilter"
      >
        <el-option
          v-for="item in modeFilterList"
          :key="item"
          :label="item"
          :value="item"
        >
        </el-option>
      </el-select>
      <el-select
        v-model="filterData.level"
        clearable
        filterable
        multiple
        collapse-tags
        placeholder="Level"
        @change="changeFilter"
      >
        <el-option
          v-for="item in levelFilterList"
          :key="item"
          :label="item"
          :value="item"
        >
        </el-option>
      </el-select>
    </div>

    <el-table :data="postList" stripe style="width: 100%" v-loading="loading">
      <el-table-column type="expand">
        <template #default="props">
          <p></p>
          <p v-html="props.row.description"></p>
          <p>
            <el-tag
              :key="tag"
              v-for="tag in props.row.tags"
              style="margin-left: 10px"
            >
              {{ tag }}
            </el-tag>
          </p>
          <p v-if="props.row.youtubeUrl">
            <iframe
              width="640"
              height="360"
              :src="getYoutubeEmbedUrl(props.row.youtubeUrl)"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="#UCS" sortable width="100">
      </el-table-column>
      <el-table-column
        label="Song"
        sortable
        :sort-method="songSortHandler"
        width="250"
      >
        <template #default="props">
          <span @click="showSongTitle(props.row.song.id)">
            {{ props.row.song.title }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="Maker"
        sortable
        prop="ucs.maker"
        :sort-method="makerSortHandler"
        width="200"
      >
        <template #default="props">
          {{ props.row.ucs.maker }} ({{ props.row.ucs.makerCountry }})
        </template>
      </el-table-column>
      <el-table-column
        label="Level"
        sortable
        :sort-method="levelSortHandler"
        width="100"
      >
        <template #default="props">
          <el-image
            :src="getLevelImage(props.row.ucs.mode, props.row.ucs.level)"
          />
        </template>
      </el-table-column>
      <el-table-column label="Grade" width="100">
        <template #default="props">
          {{ props.row.grade }}
        </template>
      </el-table-column>
      <el-table-column prop="time" label="Date" sortable width="100">
        <template #default="props">
          {{ dateFormat(props.row.time) }}
        </template>
      </el-table-column>
      <el-table-column label="">
        <template #default="props">
          <el-button
            v-if="cartButton && isAddableCart(props.row._id)"
            type="primary"
            size="medium"
            @click="addCart(props.row)"
            >Add Cart</el-button
          >
          <el-button
            v-if="cartButton && !isAddableCart(props.row._id)"
            type="danger"
            size="medium"
            @click="deleteCart(props.row._id)"
            >Delete Cart</el-button
          >
          <el-button
            type="primary"
            size="medium"
            v-if="isShowModifyDelete(props.row)"
            @click="modifyPost(props.row)"
            >Modify</el-button
          >
          <el-popconfirm
            v-if="isShowModifyDelete(props.row)"
            confirm-button-text="Confirm"
            cancel-button-text="Cancel"
            icon="el-icon-info"
            icon-color="red"
            title="Really?"
            @confirm="deletePost(props.row._id)"
          >
            <template v-slot:reference>
              <el-button type="danger" size="medium">Delete</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <post-dialog v-model="postDialog" />
    <image-dialog v-model="imageDialog" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, computed, ref } from "vue";
import { ElMessageBox } from "element-plus";
import { DateTime } from "luxon";

import PostDialog from "../dialog/Post.vue";
import ImageDialog from "../dialog/Image.vue";

import { getStore } from "../../store";
import { cartStorage } from "../../storage";
import { LEVEL_AUTHOR, PostDoc, PostParamDoc, SongDoc } from "../../common";

type FilterDataType = { [k: string]: string[] };

export default defineComponent({
  props: {
    modelValue: {
      type: Array as PropType<PostDoc[]>,
      default: () => [],
    },
    cartButton: Boolean,
    modifyDeleteButton: Boolean,
    filterSelect: Boolean,
  },
  emits: ["refresh"],
  components: {
    PostDialog,
    ImageDialog,
  },
  setup(props, { emit }) {
    const store = getStore();

    const refresh = () => emit("refresh");

    const origPostList = computed(() => props.modelValue);
    const userId = computed(() => store.state.userId);
    const userLevel = computed(() => store.state.userLevel);
    const loading = computed(() => store.state.loading);
    const isShowModifyDelete = (doc: PostDoc) =>
      props.modifyDeleteButton &&
      LEVEL_AUTHOR <= userLevel.value &&
      doc.author == userId.value;

    const songMap = ref({} as { [k: string]: string });
    const getSongList = async () => {
      const r = await store.state.cmd.songList();
      songMap.value = r.reduce<typeof songMap.value>((o, v) => {
        o[v._id] = v.title;
        return o;
      }, {});
    };

    const filterList = ref([] as PostParamDoc[]);
    const filterData = ref<FilterDataType>({
      "song._id": [],
      "ucs.maker": [],
      tag: [],
      mode: [],
      level: [],
    });

    const filterPostList = (filterList: [string, string[]][]) => {
      let list = origPostList.value;
      for (const [p, l] of filterList) {
        if (!l?.length) continue;

        switch (p) {
          case "song._id":
            list = list.filter((v) => -1 < l.indexOf(v.song._id));
            break;
          case "ucs.maker":
            list = list.filter((v) => -1 < l.indexOf(v.ucs.maker));
            break;
          case "tag":
            list = list.filter((v) => {
              if (!v.tags) return false;
              for (const tag of v.tags) if (-1 < l.indexOf(tag)) return true;
              return false;
            });
            break;
          case "mode":
            list = list.filter((v) => {
              const mode = v.ucs.mode.toLowerCase();
              if (mode.startsWith("coop")) return -1 < l.indexOf("coop");
              return -1 < l.indexOf(mode);
            });
            break;
          case "level":
            list = list.filter((v) => -1 < l.indexOf(`${v.ucs.level}`));
            break;
          default:
            list = list.filter((v) => -1 < l.indexOf((v as any)[p]));
        }
      }
      return list;
    };

    // const postList = ref([...origPostList.value]);
    const postList = computed(() => {
      const list = filterPostList(Object.entries(filterData.value));
      console.log(filterData.value);
      console.log(list);
      return list;
    });

    const changeFilter = () => {
      console.log(filterData);
    };

    const songFilterList = computed(() => {
      const filter = Object.entries(filterData.value).filter(
        (v) => v[0] != "song._id"
      );
      const list = filterPostList(filter).map((v) => v.song._id);
      return [...new Set(list)].sort((a, b) =>
        songMap.value[a]?.localeCompare(songMap.value[b])
      );
    });

    const makerFilterList = computed(() => {
      const filter = Object.entries(filterData.value).filter(
        (v) => v[0] != "ucs.maker"
      );
      const list = filterPostList(filter).map((v) => v.ucs.maker);
      return [...new Set(list)].sort();
    });

    const tagFilterList = computed(() => {
      const filter = Object.entries(filterData.value).filter(
        (v) => v[0] != "tag"
      );
      const list = filterPostList(filter).reduce((list, v) => {
        if (v.tags?.length) list.push(...v.tags);
        return list;
      }, [] as string[]);
      return [...new Set(list)].sort();
    });

    const modeFilterList = ["single", "double", "sinper", "douper", "coop"];
    const levelFilterList = Array.from(Array(30), (_, i) => `${i + 1}`);

    const getFilterList = async () => {
      const r = await store.state.cmd.postParamList();
      filterList.value = r;
    };

    if (props.filterSelect) {
      getSongList();
      getFilterList();
    }

    const cartList = ref(cartStorage.get());
    const isAddableCart = (id: string) =>
      !cartList.value.find((v) => v._id == id);

    const addCart = (doc: PostDoc) => {
      if (cartList.value.find((v) => v._id === doc._id)) return;
      if (10 <= cartList.value.length) throw new Error("cart is full");

      // same song -> need replace

      const idx = cartList.value.findIndex((v) => v.song._id == doc.song._id);
      if (-1 < idx) {
        const toStr = (v: PostDoc) =>
          `${v.ucs.maker} ${v.ucs.mode} ${v.ucs.level}`;
        return ElMessageBox({
          type: "warning",
          title: "Warning",
          message: `
            Cart item will change <br>
            Old: ${toStr(cartList.value[idx])} => <br>
            New: ${toStr(doc)} <br>
            Really?
          `,
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
          showCancelButton: true,
          dangerouslyUseHTMLString: true,
        })
          .then(() => {
            cartList.value[idx] = doc;
            cartStorage.save();
          })
          .catch(() => console.log("cancel"));
      }

      cartList.value.push(doc);
      cartStorage.save();
    };

    const deleteCart = (id: string) => {
      const idx = cartList.value.findIndex((v) => v._id === id);
      if (0 > idx) return;

      cartList.value.splice(idx, 1);
      cartStorage.save();
    };

    const postDialog = reactive({
      show: false,
      post: {} as PostDoc,
      confirmed: refresh,
    });

    const modifyPost = (doc: PostDoc) => {
      postDialog.post = doc;
      postDialog.show = true;
    };

    const deletePost = async (id: string) => {
      await store.state.cmd.deletePost(id);
      refresh();
    };

    const imageDialog = reactive({ show: false, src: "" });
    const showSongTitle = (id: string) => {
      imageDialog.src = `/assets/songs/${id}.jpg`;
      imageDialog.show = true;
    };

    const getYoutubeEmbedUrl = (url: string) => {
      return url.replace("https://youtu.be", "https://www.youtube.com/embed");
    };

    const getLevelImage = (mode: string, level: number) => {
      const basePath = "/assets/level_icon/";
      if (mode.startsWith("coop")) return `${basePath}${mode}.png`;

      return `${basePath}${mode}_${level}.png`;
    };

    const dateFormat = (date: Date) => {
      return DateTime.fromJSDate(date).toFormat("yyyy.LL");
    };

    const makerSortHandler = (a: PostDoc, b: PostDoc) => {
      return a.ucs.maker.localeCompare(b.ucs.maker);
    };

    const songSortHandler = (a: PostDoc, b: PostDoc) => {
      return a.song.title.localeCompare(b.song.title);
    };

    const levelSortHandler = (a: PostDoc, b: PostDoc) => {
      if (a.ucs.level == b.ucs.level) return 0;
      if (a.ucs.level < b.ucs.level) return 1;
      return -1;
    };

    const filterHandler = (value: any, row: any, column: any) => {
      // console.log(value, row, column);
      const property = column["property"];
      if ("ucs.maker" == property) {
        // console.log(row.ucs.maker, value)
        return row.ucs.maker === value;
      }

      return row[property] === value;
    };

    refresh();

    return {
      songMap,

      postList,
      userId,
      userLevel,
      loading,
      isShowModifyDelete,

      filterList,
      filterData,
      changeFilter,
      songFilterList,
      makerFilterList,
      tagFilterList,
      modeFilterList,
      levelFilterList,

      isAddableCart,
      addCart,
      deleteCart,

      postDialog,
      modifyPost,
      deletePost,

      imageDialog,
      showSongTitle,

      getYoutubeEmbedUrl,
      getLevelImage,
      dateFormat,
      makerSortHandler,
      songSortHandler,
      levelSortHandler,
      filterHandler,
    };
  },
});
</script>
<style scoped>
.el-select {
  margin-right: 10px;
}
</style>