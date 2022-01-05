<template>
  <div>
    <div class="expandableBox">
      <div
        class="current content-narrow"
        v-if="forecast.forecast && forecast.forecast.data.text[0]"
      >
        {{ forecast.forecast.data.text[0] }}
      </div>
      <div
        class="hazard"
        v-if="forecast.forecast && forecast.forecast.data.hazard[0]"
      >
        <div class="py-1" v-for="(hazard, index) in forecast.forecast.data.hazard">
          <a
            class="hazard"
            :href="ampReplace(forecast.forecast.data.hazardUrl[index])"
            target="_blank"
          >
            <font-awesome-icon icon="exclamation-triangle"></font-awesome-icon
            >{{ hazard }}
          </a>
        </div>
      </div>
      <div class="">
        <h3>Forecast Discussion</h3>

        <div class="discussion-wrap">
          <div class="discussion content-narrow" v-if="discussion.elements">
            {{ discussion.elements[0].elements[0].elements[8].elements[2].elements[0].text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { functions } from "@/mixins/functions";
import axios from "axios";
import stations from "@/assets/stations.json";

export default {
  name: "forecast",
  mixins: [functions],
  data() {
    return {
      forecast: {
        forecastGraphical: {},
      },
      discussion: "",
      isMetric: "",
      expanded: false,
      local: [],
    };
  },
  created() {
    this.getData();
    this.getCurrentUnits();
    this.$root.$on("changeUnits", (input) => {
      this.isMetric = input;
    });
  },
  watch: {
    "$route.params.id"() {
      this.getData();
      this.expanded = false;
    },
  },
  methods: {
    getData() {
      var vm = this;
      axios
        .get(
          `/api/forecast/${vm.$route.params.id}`
        )
        .then((response) => {
          vm.forecast = response.data;
          vm.discussion = JSON.parse(response.data.discussion);
          vm.getLocalReports();
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getCurrentUnits() {
      var localUnits = localStorage.getItem("bcd-metric");
      this.isMetric = JSON.parse(localUnits);
    },
    removeLineBreaks(input) {
      return input;
    },
    expand() {
      this.expanded = !this.expanded;
    },
    getLocalReports() {
      var vm = this;

      var today = new Date();
      var todayString;
      today.setDate(today.getDate());
      todayString =
        today.getFullYear() +
        ("0" + (today.getMonth() + 1)).slice(-2) +
        "" +
        ("0" + today.getDate()).slice(-2);

      var yesterday = new Date();
      var yesterdayString;
      yesterday.setDate(yesterday.getDate() - 7);
      yesterdayString =
        yesterday.getFullYear() +
        ("0" + (yesterday.getMonth() + 1)).slice(-2) +
        "" +
        ("0" + yesterday.getDate()).slice(-2);

      axios
        .get(
          `https://mesonet.agron.iastate.edu/geojson/lsr.php?sts=${yesterdayString}&ets=${todayString}&wfos=${vm.forecast.forecast.location.wfo}`
        )
        .then((response) => {
          vm.local = response.data.features;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>