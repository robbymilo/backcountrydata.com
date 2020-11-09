<template>
  <div class="station">
    <vue-headful
      :title="station.site_name + '| SNOTEL and Winter Weather Data'"
    />

    <div class="current">
      <div class="container current-station">
        <h2>{{ station.site_name }} ({{ station.station }})</h2>
        <div class="item" v-if="station.info">
          {{ station.info.trim() }}, {{ station.county.trim() }},
          {{ station.state.trim() }}
          <span class="item">| {{ elevCheck(station.elev) }}{{ m_ft() }}</span>
        </div>

        <div class="item">
          <a
            v-bind:href="`https://caltopo.com/map.html#ll=${station.latitude},${station.longitude}&z=16&b=mbt&a=sf`"
            target="_blank"
            >CalTopo<font-awesome-icon
              icon="external-link-alt"
            ></font-awesome-icon
          ></a>
          <br />
          <span>
            <a
              v-bind:href="`https://forecast.weather.gov/MapClick.php?w0=t&w1=td&w2=wc&w3=sfcwind&w3u=1&w4=sky&w5=pop&w6=rh&w7=rain&w8=thunder&w9=snow&w10=fzg&w11=sleet&w13u=0&w16u=1&w17u=1&AheadHour=0&Submit=Submit&FcstType=graphical&textField1=${station.latitude}&textField2=${station.longitude}&site=all&unit=0&dd=&bw=`"
              target="_blank"
              >NWS Point Forecast<font-awesome-icon
                icon="external-link-alt"
              ></font-awesome-icon
            ></a>
          </span>
        </div>
      </div>
    </div>
    <near :current="station"></near>
    &nbsp;
    <mesowest :current="station"></mesowest>
    <hourly></hourly>
    <br />
    <tabluar></tabluar>
    <br />
    <!-- <forecastChart></forecastChart> -->
    <forecast></forecast>
    <avy></avy>
  </div>
</template>

<script>
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
    };
  },
  created() {
    this.routeInfo();
    this.getCurrentUnits();
    this.$root.$on("changeUnits", (input) => {
      this.isMetric = input;
    });
  },
  watch: {
    "$route.params.id"() {
      this.routeInfo();
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
  },
};
</script>

<style lang="scss" scoped>


</style>
