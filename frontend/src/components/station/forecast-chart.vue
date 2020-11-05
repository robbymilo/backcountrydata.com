<template>
  <div class="forecast-chart">
    <div class="loading">
      <span v-if="loading">Loading...</span>
    </div>
    <highcharts :options="chartOptions" :updateArgs="updateArgs"></highcharts>
  </div>
</template>

<script>
import { functions } from "@/mixins/functions";
import axios from "axios";
import stations from "@/assets/stations.json";
import { Chart } from "highcharts-vue";

export default {
  name: "forecastChart",
  mixins: [functions],
  components: {
    highcharts: Chart,
  },
  data() {
    return {
      isMetric: "",
      station: {},
      air_temp: [],
      pop: [],
      qpf: [],
      sky: [],
      updateArgs: [true, true, { duration: 100 }],
      loading: false,
      chartOptions: {
        chart: {
          zoomType: "x",
        },
        title: {
          text: "",
        },
        series: [
          {
            name: "Air Temp",
            data: [],
            type: "spline",
            yAxis: 0,
            marker: {
              enabled: false,
            },
            tooltip: {
              valueSuffix: "",
            },
          },
          {
            name: "Possibility of Precip",
            data: [],
            type: "area",
            yAxis: 1,
            marker: {
              enabled: false,
            },
            tooltip: {
              valueSuffix: "",
            },
          },
          {
            name: "Hourly Precip Total",
            data: [],
            type: "area",
            yAxis: 2,
            marker: {
              enabled: false,
            },
            tooltip: {
              valueSuffix: "",
            },
          },
          {
            name: "Sky Cover %",
            data: [],
            type: "area",
            yAxis: 3,
            marker: {
              enabled: false,
            },
            tooltip: {
              valueSuffix: "",
            },
            zIndex: "-1",
          },
        ],
        plotOptions: {
          series: {
            turboThreshold: 5000, //larger threshold or set to 0 to disable
          },
        },
        xAxis: {
          type: "datetime",
          crosshair: true,
          tickInterval: 4,
          tickLength: 5,
        },
        yAxis: [
          {
            // Primary yAxis
            title: {
              text: "Air Temperature (c)",
            },
            labels: {
              format: "{value}°",
            },
          },
          {
            title: {
              text: "Possibility of Precip %",
            },
          },
          {
            title: {
              text: "Hourly Precip Total (in)",
            },
          },
          {
            title: {
              text: "Sky Cover %",
            },
          },
        ],
        tooltip: {
          shared: true,
        },
      },
    };
  },
  mounted() {
    this.routeInfo();
    this.getData();
    this.getCurrentUnits();
    this.$root.$on("changeUnits", (input) => {
      this.isMetric = input;
      this.set_chart();
    });
  },
  watch: {
    "$route.params.id"() {
      this.getData();
    },
    air_temp() {
      this.routeInfo();
      this.set_chart();
    },
  },
  methods: {
    routeInfo() {
      var vm = this;
      vm.station = stations[vm.$route.params.id];
    },
    getData() {
      var vm = this;
      vm.loading = true;
      axios
        .get(
          "/api/forecast/" +
            vm.$route.params.id
        )
        .then((response) => {
          vm.air_temp = response.data.forecastGraphical.temperature[0].value;
          vm.pop =
            response.data.forecastGraphical[
              "probability-of-precipitation"
            ].value;
          vm.qpf = response.data.forecastGraphical["hourly-qpf"].value;
          vm.sky = response.data.forecastGraphical["cloud-amount"].value;
          vm.loading = false;
        })
        .catch((error) => {
          vm.loading = false;
          console.log(error);
        });
    },
    getCurrentUnits() {
      var localUnits = localStorage.getItem("bcd-metric");
      this.isMetric = JSON.parse(localUnits);
    },
    set_chart() {
      var vm = this;
      vm.chartOptions.title.text = `${vm.station.site_name} NWS Point Forecast`;
      vm.chartOptions.series[0].data = vm.tempCheck(vm.air_temp);
      vm.chartOptions.series[1].data = vm.percentCheck(vm.pop);
      vm.chartOptions.series[2].data = vm.qpfCheck(vm.qpf);
      vm.chartOptions.series[3].data = vm.percentCheck(vm.sky);
    },
  },
};
</script>

