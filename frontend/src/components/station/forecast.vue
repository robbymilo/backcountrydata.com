<template>
  <div>
    <div class="expandableBox">
      <div
        class="current"
        v-if="forecast.forecast && forecast.forecast.data.text[0]"
      >
        {{ forecast.forecast.data.text[0] }}
      </div>
      <div
        class="hazard"
        v-if="forecast.forecast && forecast.forecast.data.hazard[0]"
      >
        <div v-for="(hazard, index) in forecast.forecast.data.hazard">
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
      <div class="discussion-wrap">
        <h3>Forecast Discussion</h3>
        <a :href="forecast.discussion.rss.channel.item.link">{{
          forecast.discussion.rss.channel.item.title
        }}</a>
        <div class="discussion-wrap">
          <div class="discussion" v-bind:class="{ expanded: expanded }">
            {{ forecast.discussion.rss.channel.item.description }}
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
        discussion: {
          rss: {
            channel: {
              item: {
                link: "",
                title: "",
                description: "",
              },
            },
          },
        },
      },
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
