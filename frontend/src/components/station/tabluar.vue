<template>
  <div class="expandableBox tabular-data">
    <div class="discussion-wrap">
      <div class="discussion limit" v-bind:class="{ expanded: expanded }">
        <table class="table" v-if="data.date_time">
          <thead>
            <th class="column date">Date</th>
            <th class="column">Air Temp ({{ c_f() }})</th>
            <th class="column">Snow Depth ({{ cm_in() }})</th>
            <th class="column">Snow Water Equivalent ({{ mm_in() }})</th>
            <th class="column">Precipitation Accumulation ({{ mm_in() }})</th>
            <th class="column">Wind Direction</th>
            <th class="column">Wind Speed ({{ ms_mph() }})</th>
            <th class="column">Wind Gust ({{ ms_mph() }})</th>
          </thead>

          <template v-for="(date, index) of data.date_time.slice().reverse()">
            <tr class="favorite">
              <td class="column date">
                <!-- Reverse array to get latest position -->
                {{ data.date_time.slice().reverse()[index] }}
              </td>
              <td class="column">
                {{ c_to_f(data.air_temp.slice().reverse()[index]) }}
              </td>
              <td class="column">
                {{ cm_to_in(data.snow_depth.slice().reverse()[index]) }}
              </td>
              <td class="column">
                {{ mm_to_in(data.snow_water_equiv.slice().reverse()[index]) }}
              </td>
              <td class="column">
                {{ mm_to_in(data.percip_accum.slice().reverse()[index]) }}
              </td>
              <td class="column">
                {{ degToCompass(data.wind_direction.slice().reverse()[index]) }}
              </td>
              <td class="column">
                {{ ms_to_mph(data.wind_speed.slice().reverse()[index]) }}
              </td>
              <td class="column">
                {{ ms_to_mph(data.wind_gust.slice().reverse()[index]) }}
              </td>
            </tr>
          </template>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { functions } from "@/mixins/functions";
import axios from "axios";
import stations from "@/assets/stations.json";

export default {
  name: "tabluar",
  mixins: [functions],
  props: ["current"],
  components: {
    // trend,
  },
  data() {
    return {
      isMetric: "",
      station: {},
      currentStation: this.current,
      data: {},
      expanded: false,
    };
  },
  created() {
    this.routeInfo();
    this.getData();
    this.getCurrentUnits();
    this.$root.$on("changeUnits", (input) => {
      this.isMetric = input;
    });
  },
  watch: {
    "$route.params.id"() {
      this.routeInfo();
      this.currentStation = this.current;
      this.getData();
    },
  },
  methods: {
    routeInfo() {
      var vm = this;
      vm.station = stations[vm.$route.params.id];
    },
    getData() {
      var vm = this;
      axios
        .get(
          "/api/hour/" +
            vm.$route.params.id +
            "?total=72"
        )
        .then((response) => {
          vm.data = response.data.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getCurrentUnits() {
      var localUnits = localStorage.getItem("bcd-metric");
      this.isMetric = JSON.parse(localUnits);
    },
    reverseArr(input) {
      var ret = new Array();
      for (var i = input.length - 1; i >= 0; i--) {
        ret.push(input[i]);
      }
      return ret;
    },
    expand() {
      this.expanded = !this.expanded;
    },
  },
};
</script>

<style lang="scss">
.expandableBox .discussion.limit {
  overflow-y: scroll;
  white-space: normal;
  &:before {
    display: none;
  }
}
.date {
  min-width: 200px;
}
.expandableBox {
  padding-top: 0 !important;
}
</style>
