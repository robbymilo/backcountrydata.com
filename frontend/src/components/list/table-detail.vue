<template>
  <div class="table-wrap">
    <div v-if="stationList">
      <table class="table" v-if="stationList.length > 0">
        <thead>
          <th></th>
          <th class="column text-left"><div>SNOTEL station</div></th>
          <th class="column "><div>Depth of snow: <div><small>7-day <span class="arrow">&rarr;</span> 24-hour <span class="arrow">&rarr;</span> current</small></div></div></th>
          <th class="column text-center"><div>Temp <div><small>current</small></div></div></th>
          <th class="column data"><div>Forecast <div><small>NWS</small></div></div></th>
          <th class="column data"><div>Forecast snow <div><small>12 / 24-hr</small></div></div></th>
          <th class="column data"><div>Avalanche</div></th>
        </thead>
      </table>
      <table
        class="table draggable"
        v-if="stationList.length > 0"
      >
        <tbody
          v-for="(station, index) of stationList"
          :key="station.id"
        >
          <tr
            class="station"
            :class="{ 'expanded': expanded[station] === true }"
          >
            <td class="column order">
              <div class="btn-row">
                <button class="btn up" :disabled="index === 0" @click="moveUp(station)" title="Move station up in list">
                  <font-awesome-icon icon="arrow-alt-circle-up"></font-awesome-icon>
                </button>
                <button class="btn remove" @click="removeStation(station)" title="Remove station from list">
                  <font-awesome-icon icon="times-circle"></font-awesome-icon>
                </button>
                <button class="btn down" :disabled="index === (stationList.length - 1)" @click="moveDown(station)" title="Move station down in list">
                  <font-awesome-icon icon="arrow-alt-circle-down"></font-awesome-icon>
                </button>
              </div>
            </td>
            <td class="column expand name" @click="expandStation(station)">
              <router-link class="content" :to="{ path: '/station/' + station }">{{ getMeta(station).site_name.trim() }}</router-link> <small class="unit">({{ station }})</small>
            </td>
            <td class="column expand depth" @click="expandStation(station)">
              <span class="mobile">
                <div class="text-center">Depth of snow:
                  <div>
                    <small>7-day <span class="arrow">&rarr;</span> 24-hour <span class="arrow">&rarr;</span> current</small>
                  </div>
                </div>
              </span>
              <div class="content">
                <span
                  v-if="weeklyData[station] && weeklyData[station].data.snow_depth"
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
                  {{ weekArray(cmCheck(weeklyData[station].data.snow_depth)) }}<small class="unit">{{ cm_in() }}</small>
                </span>
                <span class="arrow">&rarr;</span>
                <span
                  v-if="hourlyData[station] && hourlyData[station].data.snow_depth"
                  :title="
                    'Reported: ' +
                    dayArray(hourlyData[station].data.date_time) +
                    ', SWE: ' +
                    dayArray(mmCheck(hourlyData[station].data.snow_water_equiv)) +
                    cm_in()
                  "
                >
                  {{ dayArray(cmCheck(hourlyData[station].data.snow_depth)) }}<small class="unit">{{ cm_in() }}</small>
                </span>
                <span class="arrow">&rarr;</span>
                <span
                  v-if="hourlyData[station] && hourlyData[station].data.snow_depth"
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
                    {{ lastArray(cmCheck(hourlyData[station].data.snow_depth)) }}<small class="unit">{{ cm_in() }}</small>
                  </span>
                </span>
              </div>
            </td>
            <td class="column expand temp" @click="expandStation(station)">
              <div class="content">
                <span class="mobile">
                  <div class="text-center">
                    Temp current:
                  </div>
                </span>
                <span
                  v-if="hourlyData[station] && hourlyData[station].data.air_temp"
                  :title="'Reported: ' + lastArray(hourlyData[station].data.date_time)"
                >
                  {{ lastArray(tempCheck(hourlyData[station].data.air_temp)) }}
                  <span class="unit">°</span><small class="unit">{{ c_f() }}</small>
                </span>
              </div>
            </td>
            <td class="column expand forecast" @click="expandStation(station)">
                <div v-if="forecastData[station] && forecastData[station].forecast" class="content">
                  <div v-if="forecastData[station] && forecastData[station].forecast.data.hazard.length >= 1" class="hazard-wrap">
                    <span class="mobile">
                      NWS forecast:
                    </span>
                    <span v-for="(hazard, index) in forecastData[station].forecast.data.hazard" :key="index">
                      <div class="mobile" v-if="index == 0">
                        {{ forecastData[station].forecast.data.weather[0] }}
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
                        <font-awesome-icon icon="exclamation-triangle"></font-awesome-icon> <span class="mobile">{{ hazard }}</span>
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
                <div v-if="forecastData[station] && forecastData[station].forecast === null" class="content">
                  <div>&nbsp;</div>
                  <div>NWS API error</div>
                </div>
            </td>
            <td class="column expand forecast-small" @click="expandStation(station)">
              <div class="content">
                <span class="mobile">
                  <div class="text-left">12 / 24-hr snow forecast:</div>
                </span>
                <div>
                  <span v-if="forecastData[station] && forecastData[station].forecastSnow.length >= 1">
                    <span :class="{ increase: inCheck(forecastData[station].forecastSnow[0]) > 0 }" :title="inCheck(forecastData[station].forecastSnow[0]) + cm_in()">
                      {{ Math.round(inCheck(forecastData[station].forecastSnow[0])) }}<small class="unit">{{ cm_in() }}</small>
                    </span>
                    <span> / </span>
                    <span :class="{ increase: inCheck(forecastData[station].forecastSnow[1]) > 0 }" :title="inCheck(forecastData[station].forecastSnow[1]) + cm_in()">
                      {{ Math.round(inCheck(forecastData[station].forecastSnow[1])) }}<small class="unit">{{ cm_in() }}</small>
                    </span>
                  </span>
                </div>
              </div>
            </td>
            <td class="column expand forecast" @click="expandStation(station)">
              <div v-if="avyData[station] && avyData[station][0] && avyData[station][0].forecast" class="content avy">
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
                    <div>{{ avyData[station][0].center }}</div>
                    <div>
                      <small>{{ avyData[station][0].name }}</small>
                    </div>
                    <div>{{ avyData[station][0].forecast.travel_advice }}</div>
                  </div>
                </div>
              </div>
              <div v-if="avyData[station] && avyData[station][0] && !avyData[station][0].forecast" class="content avy">
                <div
                  class="avy-box"
                  style="background: rgb(136, 136, 136) none repeat scroll 0% 0%;"
                ></div>
                <div class="avy-rating">
                  No rating
                </div>
              </div>
            </td>
          </tr>
          <tr class="content-expand expand" :class="{ 'expanded': expanded[station] === true }" v-show="expanded[station]" @click="expandStation(station)">
            <td class="desktop">&nbsp;</td>
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
                    <div><strong>NWS forecast:</strong></div>
                    <div
                      v-if="forecastData[station] && forecastData[station].forecast.data.hazard.length >= 1"
                    >
                      <div
                        v-for="(hazard, index) in forecastData[station].forecast.data.hazard"
                        :key="index"
                        class="desktop"
                      >
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
                          <font-awesome-icon icon="exclamation-triangle"></font-awesome-icon>
                          <span class="hazard-text">{{ hazard }} </span>
                        </a>
                      </div>
                    </div>
                    <div :title="forecastData[station].forecast.data.text[0]">
                      <div>Created: {{ forecastData[station].forecast.creationDateLocal }}</div>
                      <div>Area: {{ forecastData[station].forecast.location.areaDescription }}</div>
                      <p>{{ forecastData[station].forecast.data.text[0] }}</p>
                    </div>
                  </div>
                </span>
                </div>

              </div>
            </td>
            <td colspan="4" class="desktop">
              <span v-if="avyData[station] && avyData[station][0]">
                <div><strong>{{ avyData[station][0].center }}</strong> - {{ avyData[station][0].name }}</div>
                <p v-if="avyData[station][0].forecast">{{ capitalize(avyData[station][0].forecast.danger) }} danger</p>
                <p v-if="avyData[station][0].forecast">{{ avyData[station][0].forecast.travel_advice }}</p>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
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
    moveUp(station) {
      const index = this.stationList.indexOf(station);
      if (index !== 0) {
        // console.log(this.stationList, index, index - 1)
        // console.log(this.array_move(this.stationList, index, index - 1))
        this.$root.$emit("reorderStations", this.array_move(this.stationList, index, index - 1));
      }
    },
    moveDown(station) {
      const index = this.stationList.indexOf(station);
      if (index !== this.stationList.length - 1) {
        // console.log(this.stationList, index, index + 1)
        // console.log(this.array_move(this.stationList, index, index + 1))
        this.$root.$emit("reorderStations", this.array_move(this.stationList, index, index + 1));
      }
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
    },
    // https://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
    array_move(arr, old_index, new_index) {
        while (old_index < 0) {
            old_index += arr.length;
        }
        while (new_index < 0) {
            new_index += arr.length;
        }
        if (new_index >= arr.length) {
            var k = new_index - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr; // for testing purposes
    },
  },
};
</script>

<style lang="scss">
.table-wrap {
  width: 100%;
}

.table {
  font-size: 14px;
  border-collapse: separate;
  border-spacing: 0px;
  border: 0;
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
        min-width: 75px;
        width: 75px;
        max-width: 75px;
      }


      &:nth-of-type(3) {
        min-width: 100px;
        width: 100px;
        max-width: 100px;
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
    div {
      padding: 0 .5rem;
    }
  }

  td, th {
    border: 1px solid #424242;
    border-width: 0 1px 1px 0;
    vertical-align: middle;
  }

  .td-flex {
    width: 100%;
    display: flex;
    justify-content: space-around;
    text-align: center

  }

  tr {
    overflow: hidden;
    height: 40px;
    white-space: nowrap;

    &.forecast {
      display: flex;
    }

    &.expand {
      &:hover {
        background: #263139;
      }
    }
    &.expanded, &.content-expand {
      background: #263139;
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
      margin: 0;
      border: 1px solid rgba(3, 3, 3, 0.2);
      white-space: normal;
      height: 100%;
    }
    td {
      flex: 1 1 500px;
      border: 0.5px solid rgba(3, 3, 3, 0.2);
      padding: .5rem;
    }
    th {
      flex: 1 1 500px;
      border: 0.5px solid rgba(3, 3, 3, 0.2);
    }
    .station {
      border-top: 4px solid grey;
    }
    .name {
      font-size: 1.414rem;
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
  @media screen and(max-width: 800px) {
    justify-content: space-around;
  }
}

.btn {
  border: none;
  background: transparent;
  padding: 3px;
  svg {
    color: white;
  }
}

button[disabled].btn {
  svg {
    color: grey;
  }
}

.content-expand td {
  padding: 1rem;
  p {
    white-space: break-spaces;
  }
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

.expanded.expand, .expanded .expand {
  cursor: zoom-out;
}

.hazard-wrap {
  margin-right: .5rem;
}

.content {
  padding: 0 .5rem;
}

.depth .content {
  display: flex;
  justify-content: space-around;
  max-width: 200px;
  margin: auto;

}

.temp {
  text-align: center;
}

.forecast {
  .content {
    display: flex;
    justify-content: space-between;
    &.avy {
      @media (max-width: 800px) {
        display: block;
      }
    }
  }
}

.forecast-small {
  .content {
    text-align: right;
    @media (max-width: 800px) {
      text-align: left;
    }
  }
}

</style>
