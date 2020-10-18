<template>
  <div class="daily-data">
    <highcharts :options="chartOptions"></highcharts>
  </div>
</template>

<script>
import { functions } from "@/mixins/functions";
import axios from "axios";
import stations from "@/assets/stations.json";
import { Chart } from "highcharts-vue";

export default {
  name: "daily",
  mixins: [functions],
  components: {
    highcharts: Chart,
  },
  data() {
    return {
      isMetric: "",
      data: {
        date_time: [],
        air_temp: [],
        snow_depth: [],
        snow_water_equiv: [],
        percip_accum: [],
        wind_direction: [],
        wind_speed: [],
        wind_gust: [],
      },
      chartOptions: {
        title: {
          text: "Water Year Daily Points",
        },
        series: [
          {
            name: "Snow Depth",
            data: [],
            type: "area",
            yAxis: 1,
            marker: {
              enabled: false,
            },
          },
          {
            name: "Snow Water Equivalent",
            data: [],
            type: "spline",
            yAxis: 1,
            marker: {
              enabled: false,
            },
          },
          {
            name: "Air Temperature",
            data: [],
            type: "spline",
            yAxis: 0,
            marker: {
              enabled: false,
            },
          },
        ],
        plotOptions: {
          series: {
            turboThreshold: 5000, //larger threshold or set to 0 to disable
          },
        },
        xAxis: {
          type: "datetime",
          catgories: [],
          crosshair: true,
          tickInterval: 4,
          tickLength: 5,
        },
        yAxis: [{}, {}],
        tooltip: {
          shared: true,
        },
      },
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
    },
  },
  methods: {
    getData() {
      var vm = this;
      axios
        .get(
          "https://backcountrydata.herokuapp.com/api/day/" +
            vm.$route.params.id +
            "?empty=true"
        )
        .then((response) => {
          vm.data.date_time = response.data.data.date_time;
          vm.data.air_temp = response.data.data.air_temp;
          vm.data.snow_depth = response.data.data.snow_depth;
          vm.data.snow_water_equiv = response.data.data.snow_water_equiv;
          vm.data.percip_accum = response.data.data.percip_accum;
          vm.data.wind_direction = response.data.data.wind_direction;
          vm.data.wind_speed = response.data.data.wind_speed;
          vm.data.wind_gust = response.data.data.wind_gust;

          vm.chartOptions.xAxis.categories = response.data.data.date_time;
          vm.chartOptions.series[2].data = vm.tempCheck(
            response.data.data.air_temp
          );
          vm.chartOptions.series[0].data = vm.cmCheck(
            response.data.data.snow_depth
          );
          vm.chartOptions.series[1].data = vm.mmCheck(
            response.data.data.snow_water_equiv
          );
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getCurrentUnits() {
      var localUnits = localStorage.getItem("bcd-metric");
      this.isMetric = JSON.parse(localUnits);
    },
  },
};
</script>

<style>
.trend {
  width: 200px;
}
</style>
