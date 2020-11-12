<template>
  <div class="table-wrap">
    <div v-if="stationList">
      <table class="table" v-if="stationList.length > 0">
        <thead>
          <th></th>
          <th class="column text-left">SNOTEL station</th>
          <th class="column ">Depth of snow:<br><small>7-day <span class="arrow">&rarr;</span> 24-hour <span class="arrow">&rarr;</span> current</small></th>
          <th class="column text-center">Temp<br><small>current</small></th>
          <th class="column data">Forecast<br><small>NWS</small></th>
          <th class="column data">Forecast<br><small>12 / 24-hr</small></th>
          <th class="column data">Avalanche</th>
        </thead>
      </table>
      <draggable
        class="table draggable"
        v-if="stationList.length > 0"
        @start="drag=true"
        @end="endDrag"
        :list="stationList"
        tag="table"
        :class="{ dragging: drag }"
      >
        <tbody
          v-for="station of stationList"
          :key="station.id"
        >
          <tr
            class="station expand"
            @click="expandStation(station)"
          >
            <td class="column order">
              <div class="btn-row">
                <button class="btn remove" @click="removeStation(station)" title="Remove station">
                  <font-awesome-icon icon="times-circle"></font-awesome-icon>
                </button>
                <button class="btn move" title="Drag to reorder station">
                  <font-awesome-icon icon="grip-lines"></font-awesome-icon>
                </button>
              </div>
              <!-- <button class="expand">
                <font-awesome-icon
                  v-if="expanded[station] !== true"
                  icon="expand"
                ></font-awesome-icon>
                <font-awesome-icon
                  v-if="expanded[station] === true"
                  icon="compress"
                ></font-awesome-icon>
              </button> -->
            </td>
            <td class="column name">
              <router-link :to="{ path: '/station/' + station }">{{
                getMeta(station).site_name.trim()
              }}</router-link> <small class="unit">({{ station }})</small>
            </td>
            <td class="column">
              <span class="mobile text-center">Depth of snow:<br><small>7-day <span class="arrow">&rarr;</span> 24-hour <span class="arrow">&rarr;</span> current</small> </span>
              <div class="td-flex">
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
                }}<small class="unit">{{ cm_in() }}</small>

                </span>
                <span class="arrow">&rarr;</span>
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
                  }}<small class="unit">{{ cm_in() }}</small>
                </span>
                <span class="arrow">&rarr;</span>
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
                    }}<small class="unit">{{ cm_in() }}</small>
                  </span>
                </span>
              </div>
            </td>
            <td class="column text-center">
              <span class="mobile">Temp current: </span>
              <span
                v-if="hourlyData[station] && hourlyData[station].data.air_temp"
                :title="
                  'Reported: ' + lastArray(hourlyData[station].data.date_time)
                "
              >
                {{
                  lastArray(tempCheck(hourlyData[station].data.air_temp))
                }}<span class="unit">°</span><small class="unit">{{ c_f() }}</small>
              </span>
            </td>
            <td class="column data">
              <div
                v-if="forecastData[station] && forecastData[station].forecast"
                class="d-flex justify-content-space-between overflow"
              >
                <div class="mobile"
                  >NWS Forecast:
                  <div>{{ forecastData[station].forecast.data.text[0] }}</div>
                </div>
                <div
                  v-if="
                    forecastData[station] &&
                    forecastData[station].forecast.data.hazard.length >= 1
                  "
                >
                  <span
                    v-for="(hazard, index) in forecastData[station].forecast.data.hazard" :key="index"
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
                </div>
                <div v-else>&nbsp;</div>
                <div
                  class="desktop"
                  :title="forecastData[station].forecast.data.text[0]"
                >
                  {{ forecastData[station].forecast.data.weather[0] }}
                </div>
              </div>
              <!-- <span class="external">
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
              </span> -->
            </td>
            <td class="column data">
              <span class="mobile">12 / 24-hr Forecast: </span>
              <div class="text-right">
                <span
                  v-if="
                    forecastData[station] &&
                    forecastData[station].forecastSnow.length >= 1
                  "
                >
                  <span :class="{ increase: inCheck(forecastData[station].forecastSnow[0]) > 0 }" :title="inCheck(forecastData[station].forecastSnow[0]) + cm_in()">
                    {{ Math.round(inCheck(forecastData[station].forecastSnow[0])) }}<small class="unit">{{ cm_in() }}</small>
                  </span>
                  <span> / </span>
                  <span :class="{ increase: inCheck(forecastData[station].forecastSnow[1]) > 0 }" :title="inCheck(forecastData[station].forecastSnow[1]) + cm_in()">
                    {{ Math.round(inCheck(forecastData[station].forecastSnow[1])) }}<small class="unit">{{ cm_in() }}</small>
                  </span>
                </span>
              </div>
            </td>
            <td class="column data">
              <div v-if="avyData[station] && avyData[station][0]" class="d-flex align-items-center justify-content-space-between">
                <div
                  class="avy-box"
                  :style="{ background: avyData[station][0].forecast.color }"
                ></div>
                <div
                  :title="
                    avyData[station][0].forecast.name +
                    ' - ' +
                    avyData[station][0].forecast.travel_advice
                  "
                  class="desktop avy-rating"
                >
                  <span>
                    {{ capitalize(avyData[station][0].forecast.danger) }}
                  </span>
                </div>
                <div
                  class="mobile"
                >
                  <div>
                    <h5>{{ avyData[station][0].center }}</h5>
                    <div>
                      <small>{{ avyData[station][0].name }}</small>
                    </div>
                    <div>{{ avyData[station][0].forecast.travel_advice }}</div>
                  </div>
                </div>
                <!-- <span class="external">
                  <a target="_blank" :href="avyData[station][0].forecast.link">
                    <font-awesome-icon
                      icon="external-link-alt"
                    ></font-awesome-icon>
                  </a>
                </span> -->
              </div>
            </td>
          </tr>
          <tr class="content-expand" v-show="expanded[station]" >
            <td>&nbsp;</td>
            <td colspan="2">
              <div class="content-extra">
                {{ getMeta(station).county }}, {{ getMeta(station).state }} - {{ metersCheck(getMeta(station).elev) }}<small class="unit">{{ m_ft() }}</small>
                <hr>
                <div v-if="hourlyData[station] && hourlyData[station].data.snow_depth">
                  <!-- <la-cartesian :data="remapData(hourlyData[station].data.snow_depth)">
                    <la-line dot curve :label="`Snow depth`" prop="sd"></la-line>
                    <la-tooltip>
                      <div class="tooltip" slot-scope="props">
                        <div class="title">{{ props.label }}</div>
                        <ul class="list">
                          <li
                            :key="item.label"
                            v-for="item in props.actived"
                            :style="{ borderTop: '3px solid ' + item.color }">
                            <div class="label">{{ item.label }} - {{ cm_to_in(item.value) }}<small class="unit">{{ cm_in() }}</small></div>
                          </li>
                        </ul>
                      </div>
                    </la-tooltip>
                  </la-cartesian> -->
                <span
                  v-if="forecastData[station] && forecastData[station].forecast"
                >
                  <div class="content-extra">
                    <div><strong>NWS Forecast</strong></div>
                    <div
                      v-if="
                        forecastData[station] &&
                        forecastData[station].forecast.data.hazard.length >= 1
                      "
                    >
                      <div
                        v-for="(hazard, index) in forecastData[station].forecast.data.hazard" :key="index"
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
                          <font-awesome-icon
                            icon="exclamation-triangle"
                          ></font-awesome-icon>
                          <span class="hazard-text">{{ hazard }} </span>
                        </a>
                      </div>
                    </div>
                    <p
                      :title="forecastData[station].forecast.data.text[0]"
                    >
                      <div>Created: {{ forecastData[station].forecast.creationDateLocal }}</div>
                      <div>Area: {{ forecastData[station].forecast.location.areaDescription }}</div>
                      <p>{{ forecastData[station].forecast.data.text[0] }}</p>
                    </p>
                  </div>
                </span>
                </div>

              </div>
            </td>
            <td colspan="4">
              <span v-if="avyData[station] && avyData[station][0]">
                <div><strong>{{ avyData[station][0].center }}</strong> - {{ avyData[station][0].name }}</div>
                <p>{{ capitalize(avyData[station][0].forecast.danger) }} danger</p>
                <p>{{ avyData[station][0].forecast.travel_advice }}</p>
              </span>
            </td>
          </tr>
        </tbody>
      </draggable>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import stations from "@/assets/stations.json";
import draggable from "vuedraggable";
import { functions } from "@/mixins/functions";

export default {
  name: "table-detail",
  mixins: [functions],
  props: {
    stationList: Array,
  },
  components: {
    draggable,
  },
  data() {
    return {
      drag: false,
      isMetric: "",
      hourlyData: {},
      weeklyData: {},
      forecastData: {},
      avyData: {},
      expanded: {},
      options: {},
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
    endDrag() {
      this.$root.$emit("reorderStations", this.stationList);
      this.drag = false;
    },
    expandStation(station) {
      var vm = this;
      var status = true;
      if (vm.expanded[station] === true) {
        status = false;
      }
      vm.expanded = {};
      vm.$set(vm.expanded, station, status);
    },
    remapData(sd, sw, at) {
      let finalValues = [];
      sd.forEach(value => {
        finalValues.push({ sd: value })
      })
      return finalValues;
    }
  },
};
</script>

<style lang="scss">
// .table-wrap {
//   @media (min-width: 1300px) {
//     width: 50vw;
//     max-width: 50vw;
//   }
// }
.table-wrap {
  width: 100%;
}

.table {
  font-size: 14px;
  border-collapse: separate;
  border-spacing: 0px;
  border: .5px solid #424242;
  background: #1e262c;
  width: 100%;

  // @media (min-width: 1300px) {
  //   width: 50vw;
  //   max-width: 50vw;
  // }

  th,
  td {
    font-weight: normal;

    @media (min-width: 801px) {

      &:nth-of-type(1) {
        min-width: 30px;
        width: 30px;
        max-width: 30px;
        text-align: center;
        padding: 0;
      }

      &:nth-of-type(2) {
        min-width: 100px;
        width: 100px;
        max-width: 100px;
      }


      &:nth-of-type(3) {
        min-width: 50px;
        width: 50px;
        max-width: 50px;
      }

      &:nth-of-type(4) {
        min-width: 30px;
        width: 30px;
        max-width: 30px;
      }

      &:nth-of-type(5)
      {
        min-width: 100px;
        width: 100px;
        max-width: 100px;
        white-space: nowrap;
        padding-left: 1rem;
      }

      &:nth-of-type(6)
      {
        min-width: 60px;
        width: 60px;
        max-width: 60px;
      }

      &:nth-of-type(7)
      {
        min-width: 100px;
        width: 100px;
        max-width: 100px;
      }
    }
  }

  th {
    border-width: 0 1px 1px 0;
    font-weight: bold;
    display: table-cell;
    vertical-align: middle;
    background: #31404c;
  }

  td, th {
    border: 1px solid #424242;
    border-width: 0 1px 1px 0;
    vertical-align: middle;
    padding: 4px 3px;
  }

  .td-flex {
    width: 100%;
    display: flex;
    justify-content: space-around;
    text-align: center;
    span {
      // width: 15%;
      // display: inline-block;
      // text-align: right;
    }
  }

  tr {
    &.expand {
      &:hover {
        background: #263139;
      }
    }
  }

  .mobile {
    @media (min-width: 800px) {
      display: none;
    }
  }

  .data {
    text-align: right;
  }

  @media screen and(max-width: 800px) {
    thead {
      display: none;
    }
    .mobile {
      // float: left;
      // text-align: left;
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
      &-text {
        padding-left: .5rem;
      }
    }
    .current-text {
      display: block;
    }
  }

}
.hazard {
  color: red;
  padding: 0 2px;
  &-text {
    padding-left: .5rem;
  }
}
.external svg {
  padding-left: 2px;
  width: 14px !important;
}
.avy-box {
  height: 20px;
  width: 20px;
}
.float-right {
  float: right;
}

.arrow {
  color: gray;
}

.unit {
  color: lightgray;
}

.increase {
  color:#00d500;
}

.decrease {
  color: #f33;
}

.descriptor {
  float: left;
}

.external {
  font-size: 10px;
  svg {
    color: gray;
  }
}

.btn-row {
  display: flex;
  justify-content: center;
}

.btn {
  border: none;
  background: transparent;
  padding: 3px;
  svg {
    color: white;
  }
}

.content-expand td {
  padding: 1rem;
}

.content-extra {
  padding-bottom: 1rem;
}

.overflow {
  overflow-x: scroll;
  width: 100%;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
  &::-webkit-scrollbar {
    display: none;
  }

}

.avy-rating {
  @media (max-width: 800px) {
    display: none;
  }
}

.expand {
  cursor: zoom-in;
}

// .draggable {
//   cursor: grab;
// }

// .dragging {
//   cursor: grabbing;
// }
</style>
