<template>
  <div>
    <div v-if="stationList">
      <table class="table" v-if="stationList.length > 0">
        <thead>
          <th></th>
          <th class="column name">Station</th>
          <th class="column elevation">Location</th>
          <th class="column elevation">Elevation</th>
          <th class="column data" title="Start of Day Value">7-Day Depth</th>
          <th class="column data">24-Hour Depth</th>
          <th class="column data">Current Depth</th>
          <th class="column data">Current Temp</th>
          <th class="column nws">NWS Forecast</th>
          <th class="column nws">12/24-hr Forecast</th>
          <th class="column avy">Avalanche</th>
        </thead>
        <draggable
          @end="dragged"
          :list="stationList"
          :element="'tbody'"
          :options="{ handle: '.move' }"
        >
          <tr
            class="station"
            v-for="station of stationList"
            :key="station.id"
            v-bind:class="{ expanded: expanded[station] }"
          >
            <td class="column order">
              <button class="remove" @click="removeStation(station)">
                <font-awesome-icon icon="times-circle"></font-awesome-icon>
              </button>
              <button class="move">
                <font-awesome-icon icon="grip-lines"></font-awesome-icon>
              </button>
              <button class="expand" @click="expandStation(station)">
                <font-awesome-icon
                  v-if="expanded[station] !== true"
                  icon="expand"
                ></font-awesome-icon>
                <font-awesome-icon
                  v-if="expanded[station] === true"
                  icon="compress"
                ></font-awesome-icon>
              </button>
            </td>
            <td class="column name">
              <router-link :to="{ path: '/station/' + station }">{{
                getMeta(station).site_name.trim()
              }}</router-link>
              <small class="float-right">({{ station }})</small>
            </td>
            <td class="column elevation">
              <span class="mobile">Location: </span>
              <span class="elev"
                >{{ getMeta(station).county }},
                {{ getMeta(station).state }}</span
              >
            </td>
            <td class="column elevation">
              <span class="mobile">Elevation: </span>
              <span class="elev"
                >{{ metersCheck(getMeta(station).elev)
                }}<small>{{ m_ft() }}</small></span
              >
            </td>
            <td class="column data">
              <span class="mobile">7-Day Depth: </span>
              <div class="descriptor" v-if="expanded[station] === true">
                Depth
              </div>
              <span
                v-if="
                  weeklyData[station] && weeklyData[station].data.snow_depth
                "
                :title="
                  'Reported: ' +
                  weekArray(weeklyData[station].data.date_time) +
                  ', SWE: ' +
                  weekArray(
                    mmCheck(weeklyData[station].data.snow_water_equiv)
                  ) +
                  cm_in()
                "
              >
                {{ weekArray(cmCheck(weeklyData[station].data.snow_depth))
                }}<small>{{ cm_in() }}</small>

                <div v-if="expanded[station] === true">
                  <div class="descriptor" v-if="expanded[station] === true">
                    SWE
                  </div>
                  {{
                    weekArray(
                      mmCheck(weeklyData[station].data.snow_water_equiv)
                    )
                  }}<small>{{ cm_in() }}</small>
                </div>
              </span>
            </td>
            <td class="column data">
              <span class="mobile">24-Hour Depth: </span>
              <div class="descriptor" v-if="expanded[station] === true">
                Depth
              </div>
              <span
                v-if="
                  hourlyData[station] && hourlyData[station].data.snow_depth
                "
                :title="
                  'Reported: ' +
                  dayArray(hourlyData[station].data.date_time) +
                  ', SWE: ' +
                  dayArray(mmCheck(hourlyData[station].data.snow_water_equiv)) +
                  cm_in()
                "
              >
                {{ dayArray(cmCheck(hourlyData[station].data.snow_depth))
                }}<small>{{ cm_in() }}</small>
                <div v-if="expanded[station] === true">
                  <div class="descriptor" v-if="expanded[station] === true">
                    SWE
                  </div>
                  {{
                    weekArray(
                      mmCheck(hourlyData[station].data.snow_water_equiv)
                    )
                  }}<small>{{ cm_in() }}</small>
                </div>
              </span>
            </td>
            <td class="column data">
              <span class="mobile">Current Depth: </span>
              <div class="descriptor" v-if="expanded[station] === true">
                Depth
              </div>
              <span
                v-if="
                  hourlyData[station] && hourlyData[station].data.snow_depth
                "
                :title="`Reported: ${lastArray(
                  hourlyData[station].data.date_time
                )}, SWE: ${lastArray(
                  mmCheck(hourlyData[station].data.snow_water_equiv)
                )}${mm_in()}`"
              >
                <span
                  v-bind:class="[
                    lastArray(cmCheck(hourlyData[station].data.snow_depth)) >
                      dayArray(cmCheck(hourlyData[station].data.snow_depth)) ||
                    lastArray(cmCheck(hourlyData[station].data.snow_depth)) <
                      dayArray(cmCheck(hourlyData[station].data.snow_depth))
                      ? lastArray(
                          cmCheck(hourlyData[station].data.snow_depth)
                        ) >
                        dayArray(cmCheck(hourlyData[station].data.snow_depth))
                        ? 'increase'
                        : 'decrease'
                      : 'nochange',
                  ]"
                >
                  {{ lastArray(cmCheck(hourlyData[station].data.snow_depth))
                  }}<small style="color: black">{{ cm_in() }}</small>
                  <div v-if="expanded[station] === true" style="color: black">
                    <div class="descriptor" v-if="expanded[station] === true">
                      SWE
                    </div>
                    <span>{{
                      lastArray(
                        mmCheck(hourlyData[station].data.snow_water_equiv)
                      )
                    }}</span
                    ><small>{{ cm_in() }}</small>
                  </div>
                </span>
              </span>
            </td>
            <td class="column data">
              <span class="mobile">Current Temperature: </span>
              <span
                v-if="hourlyData[station] && hourlyData[station].data.air_temp"
                :title="
                  'Reported: ' + lastArray(hourlyData[station].data.date_time)
                "
              >
                {{
                  lastArray(tempCheck(hourlyData[station].data.air_temp))
                }}°<small>{{ c_f() }}</small>
              </span>
            </td>
            <td class="column nws">
              <span
                v-if="forecastData[station] && forecastData[station].forecast"
              >
                <span class="mobile"
                  >NWS Forecast:
                  <div>{{ forecastData[station].forecast.data.text[0] }}</div>
                </span>
                <span
                  class="desktop"
                  v-if="expanded[station] !== true"
                  :title="forecastData[station].forecast.data.text[0]"
                >
                  {{ forecastData[station].forecast.data.weather[0] }}
                </span>
                <span class="desktop" v-if="expanded[station] === true">
                  {{ forecastData[station].forecast.data.text[0] }}
                </span>
              </span>
              <span
                v-if="
                  forecastData[station] &&
                  forecastData[station].forecast.data.hazard.length >= 1
                "
              >
                <span
                  v-for="(hazard, index) in forecastData[station].forecast.data
                    .hazard"
                >
                  <div class="mobile" v-if="index == 0">
                    {{ forecastData[station].forecast.data.text[0] }}
                  </div>
                  <a
                    target="_blank"
                    class="hazard"
                    :title="hazard"
                    :href="
                      ampReplace(
                        forecastData[station].forecast.data.hazardUrl[index]
                      )
                    "
                  >
                    <span class="mobile">{{ hazard }} </span>
                    <font-awesome-icon
                      icon="exclamation-triangle"
                    ></font-awesome-icon>
                  </a>
                </span>
              </span>
              <span class="external">
                <a
                  target="_blank"
                  v-bind:href="`https://forecast.weather.gov/MapClick.php?w0=t&w1=td&w2=wc&w3=sfcwind&w3u=1&w4=sky&w5=pop&w6=rh&w7=rain&w8=thunder&w9=snow&w10=fzg&w11=sleet&w13u=0&w16u=1&w17u=1&AheadHour=0&Submit=Submit&FcstType=graphical&textField1=${
                    getMeta(station).latitude
                  }&textField2=${
                    getMeta(station).longitude
                  }&station=all&unit=0&dd=&bw=`"
                >
                  <font-awesome-icon
                    icon="external-link-alt"
                  ></font-awesome-icon>
                </a>
              </span>
            </td>
            <td class="column nws">
              <span class="mobile">12/24-hr Forecast: </span>
              <span
                v-if="
                  forecastData[station] &&
                  forecastData[station].forecastSnow.length >= 1
                "
              >
                {{ inCheck(forecastData[station].forecastSnow[0])
                }}<small>{{ cm_in() }}</small
                >/{{ inCheck(forecastData[station].forecastSnow[1])
                }}<small>{{ cm_in() }}</small>
              </span>
            </td>
            <td class="column avy">
              <span v-if="avyData[station] && avyData[station][0]">
                <div
                  class="avy-box"
                  :style="{ background: avyData[station][0].forecast.color }"
                ></div>
                <span
                  :title="
                    avyData[station][0].forecast.name +
                    ' - ' +
                    avyData[station][0].forecast.travel_advice
                  "
                  class="desktop"
                >
                  <span v-if="expanded[station] !== true">
                    {{ capitalize(avyData[station][0].forecast.danger) }}
                  </span>
                  <span v-if="expanded[station] === true">
                    <h5>{{ avyData[station][0].center }}</h5>
                    <div>
                      <small>{{ avyData[station][0].name }}</small>
                    </div>
                    <div>{{ avyData[station][0].forecast.travel_advice }}</div>
                  </span>
                </span>
                <span
                  class="mobile"
                  :style="{ color: avyData[station][0].forecast.stroke }"
                >
                  <div>
                    <h5>{{ avyData[station][0].center }}</h5>
                    <div>
                      <small>{{ avyData[station][0].name }}</small>
                    </div>
                    <div>{{ avyData[station][0].forecast.travel_advice }}</div>
                  </div>
                </span>
                <span class="external">
                  <a target="_blank" :href="avyData[station][0].forecast.link">
                    <font-awesome-icon
                      icon="external-link-alt"
                    ></font-awesome-icon>
                  </a>
                </span>
              </span>
            </td>
          </tr>
        </draggable>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import stations from "@/assets/stations.json";
import draggable from "vuedraggable";
import { functions } from "@/mixins/functions";

import nearuser from "@/components/header/nearuser.vue";

export default {
  name: "table-detail",
  mixins: [functions],
  props: {
    stationList: Array,
  },
  components: {
    draggable,
    nearuser,
  },
  data() {
    return {
      isMetric: "",
      hourlyData: {},
      weeklyData: {},
      forecastData: {},
      avyData: {},
      expanded: {},
    };
  },
  created() {
    this.isMetric = this.getCurrentUnits();
    this.getStationData();
    this.$root.$on("changeUnits", (input) => {
      this.isMetric = input;
    });
  },
  methods: {
    getMeta(key) {
      if (key in stations) {
        return stations[key];
      }
    },
    getStationData() {
      var vm = this;
      if (vm.stationList) {
        vm.stationList.forEach(function (station, index) {
          // hourly
          vm.fetchData(station, "hour", "?total=169&empty=true").then(function (
            response
          ) {
            vm.$set(vm.hourlyData, station, response);
          });

          // daily
          vm.fetchData(station, "day", "").then(function (response) {
            vm.$set(vm.weeklyData, station, response);
          });

          // forecast
          vm.fetchData(station, "forecast", "").then(function (response) {
            vm.$set(vm.forecastData, station, response);
          });

          // avy
          vm.fetchData(station, "avy", "").then(function (response) {
            vm.$set(vm.avyData, station, response);
          });
        });
      }
    },
    removeStation(station) {
      this.$root.$emit("removeStation", station);
    },
    dragged() {
      this.$root.$emit("reorderStations", this.stationList);
    },
    expandStation(station) {
      var vm = this;
      var status = true;
      if (vm.expanded[station] === true) {
        status = false;
      }
      vm.$set(vm.expanded, station, status);
    },
  },
};
</script>

<style lang="scss">
.station {
  height: 100%;
  transition: all 0.2s;
  @media screen and(min-width: 800px) {
    &.expanded {
      transition: all 0.2s;
      td {
        vertical-align: top;
      }
      .external {
        display: block;
      }
    }
  }
}
.sortable-chosen {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  background: #cacaca !important;
}
.remove,
.move,
.expand {
  cursor: pointer;
  padding-right: 4px;
  border: none;
  margin: 0;
  width: auto;
  overflow: visible;

  background: transparent;

  /* inherit font & color from ancestor */
  color: inherit;
  font: inherit;

  /* Normalize `line-height`. Cannot be changed from `normal` in Firefox 4+. */
  line-height: normal;

  /* Corrects font smoothing for webkit */
  -webkit-font-smoothing: inherit;
  -moz-osx-font-smoothing: inherit;

  /* Corrects inability to style clickable `input` types in iOS */
  -webkit-appearance: none;
}
@media screen and(max-width: 800px) {
  .expand {
    display: none;
  }
}
.column {
  &.nws,
  &.avy,
  &.data,
  &.elevation {
    text-align: right;
  }
  .name {
    width: 30%;
  }
  &.avy {
    min-width: 140px;
  }
  &.order {
    display: flex;
    justify-content: space-evenly;
  }
}
.table {
  th {
    text-align: left;
    padding: 0.25em;
  }
  td {
    text-align: left;
    @media screen and(min-width: 800px) {
      padding: 0.25em;
      max-width: 237px;
    }
  }
  tr {
    border-bottom: 1px solid #ddd;
  }
}
.mobile {
  display: none;
  font-size: 12px;
}
@media screen and(max-width: 800px) {
  table.table {
    border: 0;
  }
  thead {
    display: none;
  }
  .mobile {
    display: inline-block;
    float: left;
    text-align: left;
  }
  .desktop {
    display: none;
  }
  tr {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 0.5em 0;
    border: 1px solid rgba(3, 3, 3, 0.2);
  }
  td {
    flex: 1 1 500px;
    border: 0.5px solid rgba(3, 3, 3, 0.2);
  }
  th {
    flex: 1 1 500px;
    border: 0.5px solid rgba(3, 3, 3, 0.2);
  }
  a.hazard {
    display: block;
    svg {
      max-width: 15px;
    }
  }
  .current-text {
    display: block;
  }
}
table.table {
  width: 100%;
}

table,
th,
td {
  border: 1px solid rgba(0, 0, 0, 0.1);
}

table {
  border-collapse: separate;
  border-spacing: 0px;
  border-width: 1px 0 0 1px;
  margin-bottom: 24px;
  width: 100%;
}

caption,
th,
td {
  font-weight: normal;
  text-align: left;
}

th {
  border-width: 0 1px 1px 0;
  font-weight: bold;
  line-height: 24px;
  display: table-cell;
  vertical-align: middle;
  text-align: left;
  padding: 10px;
}

td {
  border-width: 0 1px 1px 0;
  padding: 10px;
}
.move {
  padding-right: 4px;
}
.move:hover {
  cursor: grab;
}

.move:active {
  cursor: grabbing;
}

tr:nth-child(even),
thead {
  background: #eee;
}
a.hazard {
  color: red;
  padding: 0 2px;
}
.external svg {
  padding-left: 2px;
  width: 14px !important;
}
.avy-box {
  @media screen and(min-width: 800px) {
    position: absolute;
  }
  @media screen and(max-width: 799px) {
    // float: right;
  }
  height: 20px;
  width: 20px;
}
.float-right {
  float: right;
}

h5 {
  margin: 0;
}

.increase {
  color: green;
}

.decrease {
  color: red;
}

.descriptor {
  float: left;
}
</style>
