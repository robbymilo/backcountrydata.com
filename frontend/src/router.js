import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

import stations from "@/assets/stations.json";
import VueMeta from 'vue-meta'

Vue.use(VueMeta, {
  // optional pluginOptions
  refreshOnceOnNavigation: true
})

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/:id?",
      name: "home",
      component: Home,
    },
    {
      path: "/station/:id",
      name: "station",
      component: () =>
        import(/* webpackChunkName: "station" */ "./views/Station.vue"),

      // prevents nav to non-station
      beforeEnter: (to, from, next) => {
        var key = to.params.id;
        if (key in stations) {
          next();
        } else {
          alert("Not a station!!");
          next(false);
        }
      },
    },
    {
      path: "/list/:id?",
      name: "list",
      component: () =>
        import(/* webpackChunkName: "station" */ "./views/List.vue"),
    },
  ],
});
