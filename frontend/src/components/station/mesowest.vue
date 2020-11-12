<template>
  <div class="station-data" v-if="mesodata.length">
    <div class="container">
      <h3>Nearby Weather Stations:</h3>

      <div class="station" v-for="(station, index) in mesodata">
        <strong>{{ titleCase(station.NAME) }}</strong>
        <!-- <div v-for="(date, index) in station.OBSERVATIONS.date_time">
                    <div
                        v-if="
                            index == station.OBSERVATIONS.date_time.length - 1
                        "
                    >
                        {{ date.toLocaleString() }}
                    </div>
                </div> -->
        <div v-if="station.STID">
          {{ station.DISTANCE }}<small>{{ mi_km() }}</small>
          {{
            degToCompass(
              bearing(
                currentStation.latitude,
                currentStation.longitude,
                station.LATITUDE.replace(/\s/g, ""),
                station.LONGITUDE.replace(/\s/g, "")
              )
            )
          }}
          @ {{ ftCheck(station.ELEVATION) }}<small>{{ m_ft() }}</small>
        </div>
        <!-- <div v-if="station.OBSERVATIONS.air_temp_set_1">
                    <div
                        v-for="(air_temp, index) in tempCheck(
                            station.OBSERVATIONS.air_temp_set_1
                        )"
                    >
                        <div
                            v-if="
                                index ==
                                    station.OBSERVATIONS.air_temp_set_1.length -
                                        1
                            "
                        >
                            Air Temp: {{ air_temp }}{{ c_f() }}
                        </div>
                    </div>
                </div>
                <div v-if="station.OBSERVATIONS.snow_depth_set_1">
                    <div
                        v-for="(snow_depth, index) in mmCheck(
                            station.OBSERVATIONS.snow_depth_set_1
                        )"
                    >
                        <div
                            v-if="
                                index ==
                                    station.OBSERVATIONS.snow_depth_set_1
                                        .length -
                                        1
                            "
                        >
                            depth: {{ snow_depth }}
                        </div>
                    </div>
                </div> -->
        <!-- <div
                    class="trend"
                    :title="'7-day temperature for ' + titleCase(station.NAME)"
                    v-if="station.OBSERVATIONS.air_temp_set_1"
                >
                    <trend
                        :data="tempCheck(station.OBSERVATIONS.air_temp_set_1)"
                        :gradient="['#6fa8dc', '#42b983', '#2c3e50']"
                        auto-draw
                        smooth
                    >
                    </trend>
                </div> -->
        <div>
          <span v-if="isMetric == false">
            <a
              v-bind:href="`https://forecast.weather.gov/MapClick.php?w0=t&w1=td&w2=wc&w3=sfcwind&w3u=1&w4=sky&w5=pop&w6=rh&w7=rain&w8=thunder&w9=snow&w10=fzg&w11=sleet&w13u=0&w16u=1&w17u=1&AheadHour=0&Submit=Submit&FcstType=graphical&textField1=${station.LATITUDE.replace(
                /\s/g,
                ''
              )}&textField2=${station.LONGITUDE.replace(
                /\s/g,
                ''
              )}&site=all&unit=0&dd=&bw=`"
              target="_blank"
              >NWS Point Forecast</a
            >
          </span>
          <span v-if="isMetric == true">
            <a
              v-bind:href="`https://forecast.weather.gov/MapClick.php?w0=t&w1=td&w2=wc&w3=sfcwind&w3u=3&w4=sky&w5=pop&w6=rh&w7=rain&w8=thunder&w9=snow&w10=fzg&w11=sleet&w13u=0&w16u=1&w17u=1&AheadHour=0&Submit=Submit&FcstType=graphical&textField1=${station.LATITUDE.replace(
                /\s/g,
                ''
              )}&textField2=${station.LONGITUDE.replace(
                /\s/g,
                ''
              )}&site=all&unit=1&dd=&bw=`"
              target="_blank"
              >NWS Point Forecast</a
            >
          </span>
          <br />
          <span v-if="isMetric == false">
            <a
              v-bind:href="`https://www.wrh.noaa.gov/mesowest/getobext.php?sid=${station.STID}&num=48&raw=0`"
              target="_blank"
              >Recent Obs</a
            >
          </span>
          <span v-if="isMetric == true">
            <a
              v-bind:href="`https://www.wrh.noaa.gov/mesowest/getobext.php?sid=${station.STID}&num=48&raw=0&units=METRIC`"
              target="_blank"
              >Recent Obs</a
            >
          </span>
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
  name: "mesowest",
  mixins: [functions],
  props: ["current"],
  data() {
    return {
      isMetric: "",
      currentStation: this.current,
      mesodata: [],
      mesometa: {},
    };
  },
  created() {
    this.getData(this.currentStation.latitude, this.currentStation.longitude);
    this.getCurrentUnits();
    this.$root.$on("changeUnits", (input) => {
      this.isMetric = input;
    });
  },
  watch: {
    "$route.params.id"() {
      this.mesodata = [];
      this.mesometa = [];
      this.currentStation = this.current;
      this.getData(this.currentStation.latitude, this.currentStation.longitude);
    },
  },
  methods: {
    getData(lat, lon) {
      var vm = this;
      axios
        .get("https://api.mesowest.net/v2/stations/timeseries", {
          params: {
            token: "b66df2a69170468d96e105380cf25b68",
            recent: "10080",
            limit: "11",
            radius: `${lat},${lon},50`,
            obtimezone: "local",
          },
        })
        .then((response) => {
          // console.log(response.data);
          vm.mesodata = response.data.STATION;
          vm.mesometa = response.data.SUMMARY;
        });
    },
    getCurrentUnits() {
      var localUnits = localStorage.getItem("bcd-metric");
      this.isMetric = JSON.parse(localUnits);
    },
  },
};
</script>
