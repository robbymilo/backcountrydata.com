import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import VueAnalytics from "vue-analytics";
// import Sparkline from 'vue-sparklines'

// begin font awesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { faGripLines } from "@fortawesome/free-solid-svg-icons";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { faExpand } from "@fortawesome/free-solid-svg-icons";
import { faCompress } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faHome);
library.add(faTimesCircle);
library.add(faGripLines);
library.add(faExclamationTriangle);
library.add(faHeart);
library.add(faExpand);
library.add(faCompress);
library.add(faExternalLinkAlt);

Vue.component("font-awesome-icon", FontAwesomeIcon);
// end font awesome

// google analytics
Vue.use(VueAnalytics, {
  id: "UA-110511455-1",
  router,
});

// Vue.use(Sparkline)

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
