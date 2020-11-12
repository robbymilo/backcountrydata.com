<template>
  <div class="station">
    <vue-headful :title="station.site_name + '| SNOTEL and Winter Weather Data'" />

    <div class="container">
      <div class="current-station">
        <h1>{{ station.site_name }} <small class="units">{{ station.station }}</small></h1>
        <div class="item" v-if="station.info">
          {{ station.info.trim() }}, {{ station.county.trim() }},
          {{ station.state.trim() }}
          <span class="item">| {{ elevCheck(station.elev) }}{{ m_ft() }}</span>
        </div>
      </div>
    </div>

    <div class="container item">
      <div>
        <a
          v-bind:href="`https://caltopo.com/map.html#ll=${station.latitude},${station.longitude}&z=16&b=mbt&a=sf`"
          target="_blank"
          >CalTopo <small><font-awesome-icon
            icon="external-link-alt"
          ></font-awesome-icon></small>
        </a>
      </div>
      <div>
        <a
          v-bind:href="`https://forecast.weather.gov/MapClick.php?w0=t&w1=td&w2=wc&w3=sfcwind&w3u=1&w4=sky&w5=pop&w6=rh&w7=rain&w8=thunder&w9=snow&w10=fzg&w11=sleet&w13u=0&w16u=1&w17u=1&AheadHour=0&Submit=Submit&FcstType=graphical&textField1=${station.latitude}&textField2=${station.longitude}&site=all&unit=0&dd=&bw=`"
          target="_blank"
          >NWS Point Forecast <small><font-awesome-icon
            icon="external-link-alt"
          ></font-awesome-icon></small>
        </a>
      </div>
    </div>

    <div class="container">
      <div>
        <h3>
          Current conditions
        </h3>
        <div class="d-flex justify-content-space-between" v-if="data.date_time">
          <div>
            <div>Air temperature</div>
            <h2>{{ c_to_f(air_temp[0]) }}<small class="unit">{{ c_f() }}</small></h2>
          </div>
          <div>
            <div>Snow depth</div>
            <h2>{{ cm_to_in(snow_depth[0]) }}<small class="unit">{{ cm_in() }}</small></h2>
          </div>
          <div>
            <div>Snow water equivalent</div>
            <h2>{{ mm_to_in(snow_water_equiv[0]) }}<small class="units">{{ mm_in() }}</small></h2>
          </div>
          <div>
            <div>Percipitation accumulation</div>
            <h2>{{ mm_to_in(percip_accum[0]) }}<small class="units">{{ mm_in() }}</small></h2>
          </div>
          <div v-if="wind_speed[1] !== 0">
            <div>Wind</div>
            <h3>{{ degToCompass(wind_direction[1]) }} <small class="units">direction</small></h3>
            <h3>{{ ms_to_mph(wind_speed[1]) }}<small class="units">{{ ms_mph() }}</small> <small class="units">speed</small></h3>
            <h3>{{ ms_to_mph(wind_gust[1]) }}<small class="units">{{ ms_mph() }}</small> <small class="units">gust</small></h3>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <hourly></hourly>
    </div>

    <div class="container">
      <forecast></forecast>
    </div>

    <div class="container">
      <avy></avy>
    </div>

  </div>
</template>

<script>
import { functions } from "@/mixins/functions";

import axios from "axios";
import stations from "@/assets/stations.json";
import favorites from "@/components/header/favorites.vue";
import nearuser from "@/components/header/nearuser.vue";
import hourly from "@/components/station/hourly.vue";
import daily from "@/components/station/daily.vue";
import near from "@/components/station/near.vue";
import forecast from "@/components/station/forecast.vue";
import mesowest from "@/components/station/mesowest.vue";
import avy from "@/components/station/avy.vue";
import tabluar from "@/components/station/tabluar.vue";
import forecastChart from "@/components/station/forecast-chart.vue";

export default {

  name: "Station",
  mixins: [functions],
  components: {
    hourly,
    daily,
    near,
    forecast,
    favorites,
    nearuser,
    mesowest,
    avy,
    tabluar,
    forecastChart,
  },
  data() {
    return {
      isMetric: this.units,
      station: {},
      data: {},
    };
  },
  computed: {
    date() {
      return this.data.date_time.reverse()
    },
    air_temp() {
      return this.data.air_temp.reverse()
    },
    snow_depth() {
      return this.data.snow_depth.reverse()
    },
    snow_water_equiv() {
      return this.data.snow_water_equiv.reverse()
    },
    percip_accum() {
      return this.data.percip_accum.reverse()
    },
    wind_direction() {
      return this.data.wind_direction.reverse()
    },
    wind_speed() {
      return this.data.wind_speed.reverse()
    },
    wind_gust() {
      return this.data.wind_gust.reverse()
    },
  },
  created() {
    this.routeInfo();
    this.getCurrentUnits();
    this.getData();
    this.$root.$on("changeUnits", (input) => {
      this.isMetric = input;
    });
  },
  watch: {
    "$route.params.id"() {
      this.routeInfo();
      this.getData();
    },
  },
  methods: {
    routeInfo() {
      var vm = this;
      vm.station = stations[vm.$route.params.id];
    },
    getCurrentUnits() {
      var localUnits = localStorage.getItem("bcd-metric");
      this.isMetric = JSON.parse(localUnits);
    },
    elevCheck(meters) {
      if (this.isMetric) {
        return Math.floor(meters);
      } else {
        return Math.floor(meters * 3.2);
      }
    },
    m_ft() {
      if (this.isMetric) {
        return "m";
      } else {
        return "ft";
      }
    },
    getData() {
      var vm = this;
      axios
        .get(
          "/api/hour/" +
            vm.$route.params.id
        )
        .then((response) => {
          vm.data = response.data.data;
        })
        .catch((error) => {
          console.log(error);
        });

    },
  },
};
</script>

