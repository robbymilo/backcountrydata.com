<template>
  <div class="avy">
    <div class="">
      <h3>Nearest avalanche forecast regions</h3>
      <div class="item" v-if="avyForecast">
        <div v-for="(region, index) in avyForecast">
          <div>
            <strong>{{ region.name }}</strong>
            <span v-if="region.forecast && region.forecast.link">
                <a target="_blank" :href="region.forecast.link">
                &nbsp;
                <font-awesome-icon
                  icon="external-link-alt"
                ></font-awesome-icon>
              </a>
            </span>
          </div>
          {{ kmCheck(region.distance) }}<small>{{ mi_km() }}</small> away by
          {{ region.center }}
          <span v-if="region.forecast && region.forecast.center_link">
            <a target="_blank" :href="region.forecast.center_link">
              <font-awesome-icon icon="external-link-alt"></font-awesome-icon>
            </a>
          </span>
          <div class="content-narrow" v-if="region.forecast">
            <span :style="{ color: region.forecast.stroke }">
              {{ titleCase(region.forecast.danger) }}
            </span>
            - {{ region.forecast.travel_advice }}
          </div>
          <div v-else>No data reported</div>
          <hr>
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
  name: "avy",
  mixins: [functions],
  components: {
    // trend,
  },
  data() {
    return {
      avyForecast: [],
      isMetric: "",
      expanded: false,
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
      this.expanded = false;
    },
  },
  methods: {
    getData() {
      var vm = this;
      axios
        .get(
          "/api/avy/" + vm.$route.params.id
        )
        .then((response) => {
          vm.avyForecast = response.data;
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
