<template>
  <div>
    <div class="expandableBox">
      <div
        class="current"
        v-if="forecast.forecast && forecast.forecast.data.text[0]"
      >
        {{ forecast.forecast.data.text[0] }}
      </div>
      <div
        class="hazard"
        v-if="forecast.forecast && forecast.forecast.data.hazard[0]"
      >
        <div v-for="(hazard, index) in forecast.forecast.data.hazard">
          <a
            class="hazard"
            :href="ampReplace(forecast.forecast.data.hazardUrl[index])"
            target="_blank"
          >
            <font-awesome-icon icon="exclamation-triangle"></font-awesome-icon
            >{{ hazard }}
          </a>
        </div>
      </div>
      <hr />
      <div class="discussion-wrap">
        <h3>Forecast Discussion</h3>
        <a :href="forecast.discussion.rss.channel.item.link">{{
          forecast.discussion.rss.channel.item.title
        }}</a>
        <div class="discussion-wrap">
          <div class="discussion" v-bind:class="{expanded: expanded}">
            {{ forecast.discussion.rss.channel.item.description }}
          </div>
          <div class="expand-wrap">
            <button @click="expand" class="expand">
              <div v-if="!expanded">Read more...</div>
              <div v-else>Close</div>
            </button>
          </div>
        </div>
      </div>
    </div>
    &nbsp;
    <div class="expandableBox">
      <div class="discussion-wrap">
        <div class="discussion limit">
          <h3>Local Reports</h3>
          <div v-if="local.length > 0">
            <div v-for="(report, index) in local.slice().reverse()">
              <div>
                <small
                  >{{ report.properties.valid }} -
                  {{ report.properties.city }} ({{
                    report.properties.source
                  }})</small
                >
              </div>
              <div>
                <small
                  >{{ report.properties.typetext }},
                  {{ report.properties.magnitude }}
                  <span v-if="report.properties.remark"
                    >- {{ report.properties.remark }}</span
                  ></small
                >
              </div>
              <hr />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {functions} from '@/mixins/functions';
import axios from 'axios';
import stations from '@/assets/stations.json';

export default {
  name: 'forecast',
  mixins: [functions],
  data() {
    return {
      forecast: {
        forecastGraphical: {},
        discussion: {
          rss: {
            channel: {
              item: {
                link: '',
                title: '',
                description: '',
              },
            },
          },
        },
      },
      isMetric: '',
      expanded: false,
      local: [],
    };
  },
  created() {
    this.getData();
    this.getCurrentUnits();
    this.$root.$on('changeUnits', (input) => {
      this.isMetric = input;
    });
  },
  watch: {
    '$route.params.id'() {
      this.getData();
      this.expanded = false;
    },
  },
  methods: {
    getData() {
      var vm = this;
      axios
        .get(
          `https://backcountrydata.herokuapp.com/api/forecast/${vm.$route.params.id}`
        )
        .then((response) => {
          vm.forecast = response.data;
          vm.getLocalReports();
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getCurrentUnits() {
      var localUnits = localStorage.getItem('bcd-metric');
      this.isMetric = JSON.parse(localUnits);
    },
    removeLineBreaks(input) {
      return input;
    },
    expand() {
      this.expanded = !this.expanded;
    },
    getLocalReports() {
      var vm = this;

      var today = new Date();
      var todayString;
      today.setDate(today.getDate());
      todayString =
        today.getFullYear() +
        ('0' + (today.getMonth() + 1)).slice(-2) +
        '' +
        ('0' + today.getDate()).slice(-2);

      var yesterday = new Date();
      var yesterdayString;
      yesterday.setDate(yesterday.getDate() - 7);
      yesterdayString =
        yesterday.getFullYear() +
        ('0' + (yesterday.getMonth() + 1)).slice(-2) +
        '' +
        ('0' + yesterday.getDate()).slice(-2);

      axios
        .get(
          `https://mesonet.agron.iastate.edu/geojson/lsr.php?sts=${yesterdayString}&ets=${todayString}&wfos=${vm.forecast.forecast.location.wfo}`
        )
        .then((response) => {
          vm.local = response.data.features;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>

<style lang="scss">
.expandableBox {
  padding: 8px;
  border: 1px solid gray;
  .discussion {
    white-space: pre-wrap;
    max-height: 200px;
    overflow: hidden;
    position: relative;
    // font-family: monospace;
    &:before {
      content: '';
      position: absolute;
      z-index: 1;
      bottom: 0;
      left: 0;
      pointer-events: none;
      background-image: linear-gradient(
        to top,
        rgba(255, 255, 255, 1),
        rgba(255, 255, 255, 0) 90%
      );
      width: 100%;
      height: 4em;
    }
  }
  .expand-wrap {
    margin: 8px 0 0 0;
  }
  .expanded {
    max-height: 100%;
    &:before {
      background: none;
    }
  }
}

.fa-exclamation-triangle {
  padding-right: 4px;
}

.discussion-wrap {
  margin-top: 8px;
  h3 {
    padding-left: 0;
  }
}
.current {
  padding: 4px 0;
}
</style>
