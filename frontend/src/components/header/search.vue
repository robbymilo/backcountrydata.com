<template>
  <div class="search">
    <vue-autosuggest
      ref="autosuggest"
      :suggestions="results"
      @input="onInputChange"
      :on-selected="selectHandler"
      :input-props="{
        id: 'autosuggest__input',
        placeholder: 'Search for SNOTEL site',
      }"
      @click="clickHandler"
      @keydown.esc="clearInput"
    >
      <template slot-scope="{ suggestion }">
        <span class="my-suggestion-item">{{ suggestion.item }}</span>
      </template>
    </vue-autosuggest>

    <div
      class="results-list"
      v-if="searchTerm.length >= 2 && results.length == 0 && isAjax == false"
    >
      No stations found.
    </div>
    <div
      class="results-list"
      v-else-if="
        searchTerm.length >= 2 && results.length == 0 && isAjax == true
      "
    >
      Searching...
    </div>
    <div
      class="results-list"
      v-else-if="searchTerm.length >= 2 && results.length >= 1"
    >
      <div v-for="result in results">
        <a :href="/station/ + result.id">{{ result.site_name }}</a>
      </div>
    </div>
  </div>
</template>

<script>
import stations from "@/assets/stations.json";
import { VueAutosuggest } from "vue-autosuggest";
import axios from "axios";

export default {
  name: "search",
  components: {
    VueAutosuggest,
  },
  data: function () {
    return {
      searchTerm: "",
      isAjax: false,
      results: [],
    };
  },
  methods: {
    selectHandler(item) {
      console.log(`Selected "${item.item}"`);
    },
    clickHandler() {
      console.log("click");
    },
    onInputChange(input) {
      console.log('input')
      this.searchTerm = input;
      if (input.length >= 2) {
        this.doSearch(input);
      } else if (input.length >= 1) {
        this.results = [];
      }
    },
    doSearch(input) {
      console.log('search')
      this.isAjax = true;
      axios
        .get(
          "/api/nearest/?search=" + input
        )
        .then((response) => {
          this.isAjax = false;
          if (response.data) {
            this.results = response.data;
          } else {
            this.results = [];
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    clearInput() {
      this.$refs.autosuggest.searchInput = "";
      this.results = [];
    },
  },
};
</script>