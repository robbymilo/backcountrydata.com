<template>
  <div class="hourly-data">
    <div class="container-fluid">
      <div class="loading">
        <span v-if="loading">Loading...</span>
      </div>
      <div class="days-select">
        <div class="vs-component">Days:</div>
        <input
          type="radio"
          value="7"
          v-model="sliderValue"
          @input="changeSlider"
        />7
        <input
          type="radio"
          value="14"
          v-model="sliderValue"
          @input="changeSlider"
        />
        14
        <input
          type="radio"
          value="30"
          v-model="sliderValue"
          @input="changeSlider"
        />
        30
        <input
          type="radio"
          value="90"
          v-model="sliderValue"
          @input="changeSlider"
        />
        90
        <input
          type="radio"
          value="365"
          v-model="sliderValue"
          @input="changeSlider"
        />
        Water year
      </div>

      <highcharts :options="chartOptions" :updateArgs="updateArgs"></highcharts>
    </div>
  </div>
</template>

<script>
import { functions } from "@/mixins/functions";
import axios from "axios";
import stations from "@/assets/stations.json";
import { Chart } from "highcharts-vue";

export default {
  name: "hourly",
  mixins: [functions],
  components: {
    highcharts: Chart,
  },
  data() {
    return {
      isMetric: "",
      station: {},
      date_time: [],
      air_temp: [],
      snow_depth: [],
      snow_water_equiv: [],
      percip_accum: [],
      wind_direction: [],
      wind_speed: [],
      wind_gust: [],
      updateArgs: [true, true, { duration: 100 }],
      tempUnits: "",
      sliderValue: 30,
      loading: false,
      chartOptions: {
        legend: {
          itemHoverStyle: {
            color: "white",
          },
          itemStyle: {
            color: "white",
          }
        },
        chart: {
          zoomType: "x",
          backgroundColor: 'rgb(20, 29, 36)',
          style: {
            fontFamily: 'sans-serif',
            color: "white"
          }
        },
        title: {
          text: "",
          style: {
            color: 'white',
          }
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
            tooltip: {
              valueSuffix: "",
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
            dashStyle: "shortdot",
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
          crosshair: true,
          tickInterval: 4,
          tickLength: 5,
          labels: {
              style: {
              color: 'white',
            }
          }
        },
        yAxis: [
          {
            // Primary yAxis
            plotLines: [
              {
                value: null,
                color: "rgba(0,0,255, 0.1)",
                width: 2,
                label: {
                  // text: 'Freezing',
                  style: {
                    color: "white",
                    opacity: "0.3",
                  },
                },
              },
            ],
            title: {
              text: "Air Temperature",
            },
            labels: {
              format: "{value}°",
              style: {
                color: 'white',
              }
            },
          },
          {
            // Secondary yAxis
            title: {
              text: "Snnow Depth/SWE",
            },
            labels: {
              format: "{value}",
              style: {
                color: 'white',
              }
            },
            opposite: true,
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
    this.getData(720);
    this.getCurrentUnits();
    this.$root.$on("changeUnits", (input) => {
      this.isMetric = input;
      this.set_chart();
    });
  },
  watch: {
    "$route.params.id"() {
      this.getData(720);
      this.sliderValue = 30;
    },
    date_time() {
      this.routeInfo();
      this.set_chart();
    },
  },
  methods: {
    routeInfo() {
      var vm = this;
      vm.station = stations[vm.$route.params.id];
    },
    getData(total) {
      var vm = this;
      vm.loading = true;
      axios
        .get(
          `/api/hour/${vm.$route.params.id}?empty=true&total=${total}`
        )
        .then((response) => {
          vm.date_time = response.data.data.date_time;
          vm.air_temp = response.data.data.air_temp;
          vm.snow_depth = response.data.data.snow_depth;
          vm.snow_water_equiv = response.data.data.snow_water_equiv;
          vm.percip_accum = response.data.data.percip_accum;
          vm.wind_direction = response.data.data.wind_direction;
          vm.wind_speed = response.data.data.wind_speed;
          vm.wind_gust = response.data.data.wind_gust;
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
      vm.chartOptions.series[0].data = vm.cmCheck(vm.snow_depth);
      vm.chartOptions.series[1].data = vm.mmCheck(vm.snow_water_equiv);
      vm.chartOptions.series[2].data = vm.tempCheck(vm.air_temp);
      vm.chartOptions.xAxis.categories = vm.date_time;
      vm.chartOptions.title.text = `${vm.station.site_name} ${this.sliderValue}-Day Hourly SNOTEL Data`;

      if (!vm.isMetric) {
        vm.chartOptions.yAxis[0].plotLines[0].value = 32;
        vm.chartOptions.yAxis[0].title.text = "Air Temperature (f)";
        vm.chartOptions.yAxis[1].title.text = "Snow Depth/SWE (in)";
      } else {
        vm.chartOptions.yAxis[0].plotLines[0].value = 0;
        vm.chartOptions.yAxis[0].title.text = "Air Temperature (c)";
        vm.chartOptions.yAxis[1].title.text = "Snow Depth/SWE (cm)";
      }
    },
    changeSlider(value) {
      this.getData(parseInt(value.target.value) * 24);
    },
  },
};
</script>

