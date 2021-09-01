<template>
  <v-layout child-flex style="padding: 16px">
    <v-card>
      <v-card-title>
        List
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="data"
        :search="search"
        item-key="name"
        items-per-page="5"
        show-expand
      >
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length" style="padding: 0px">
            <v-tabs center-active v-model="tab">
              <v-tab v-for="step in item.steps" :key="step.level">
                <v-img
                  :src="`/assets/level_icon/${step.level}.png`"
                  max-width="35"
                ></v-img>
              </v-tab>
            </v-tabs>
            <div v-if="item.steps[tab]" style="padding: 10px">
              <iframe
                width="640"
                height="360"
                :src="item.steps[tab].youtube"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </td>
        </template>
      </v-data-table>
    </v-card>
  </v-layout>
</template>

<script>
export default {
  props: [],
  data() {
    return {
      tab: 0,
      search: '',
      data: [
        {
          name: "Wedding Crashers",
          artist: "SHK",
          channel: "Original",
          version: "XX",
          steps: [
            { level: "single_4", youtube: "" },
            { level: "single_6", youtube: "" },
            {
              level: "single_10",
              youtube: "https://www.youtube.com/embed/vIviuHApIWo",
            },
            { level: "single_16", youtube: "" },
            { level: "single_18", youtube: "" },
            { level: "single_21", youtube: "" },
            { level: "double_7", youtube: "" },
            { level: "double_13", youtube: "" },
            { level: "double_19", youtube: "" },
          ],
        },
        {
          name: "조깅",
          artist: "루시",
          channel: "K-POP",
          version: "XX",
          steps: [],
        },
      ],
      headers: [
        { text: "Name", value: "name" },
        { text: "Artist", value: "artist" },
        { text: "Channel", value: "channel" },
        { text: "Version", value: "version" },
        { text: "", value: "data-table-expand" },
      ],
    };
  },
  computed: {},
  methods: {},
};
</script>