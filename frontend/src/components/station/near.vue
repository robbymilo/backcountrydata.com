<template>
  <div class="station-data">
    <div class="container">
      <h3>Nearby SNOTEL Stations:</h3>
      <span class="" v-for="(station, index) in near">
        <div class="station" v-if="index >= 1">
          <router-link :to="{ path: '/station/' + station.id }">
            {{ station.station.site_name.trim() }}
          </router-link>
          <div>
            {{ distanceCheck(station.distance) }}<small>{{ mi_km() }}</small>
            {{
              degToCompass(
                bearing(
                  currentStation.latitude,
                  currentStation.longitude,
                  station.station.latitude,
                  station.station.longitude
                )
              )
            }}
            @ {{ mCheck(station.station.elev) }}<small>{{ m_ft() }}</small>
          </div>
        </div>
      </span>
    </div>
  </div>
</template>

<script>
import { functions } from "@/mixins/functions";
import axios from "axios";
import stations from "@/assets/stations.json";

export default {
  name: "near",
  mixins: [functions],
  props: ["current"],
  data() {
    return {
      near: [],
      currentStation: this.current,
      isMetric: "",
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
      this.currentStation = this.current;
    },
  },
  methods: {
    getData() {
      var vm = this;
      axios
        .get(
          "/api/nearest/" +
            vm.$route.params.id
        )
        .then((response) => {
          vm.near = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getCurrentUnits() {
      var localUnits = localStorage.getItem("bcd-metric");
      this.isMetric = JSON.parse(localUnits);
    },
    distanceCheck(miles) {
      if (this.isMetric) {
        return Math.floor(miles * 1.6);
      } else {
        return Math.floor(miles);
      }
    },
    mi_km() {
      if (this.isMetric) {
        return "km";
      } else {
        return "mi";
      }
    },
  },
};
</script>
