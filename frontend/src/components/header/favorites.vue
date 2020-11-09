<template>
  <div class="favorites">
    <button
      class="favsBox"
      @click="hidden = !hidden"
    >
      <font-awesome-icon icon="heart"></font-awesome-icon>
    </button>
    <div class="hidden favorites-box" v-if="!hidden">
      <div class="container" v-if="favorites">
        <div>
          <h3>Your Favorites:</h3>
          <draggable class="item" v-model="favorites" @end="dragged">
            <div v-for="site of favorites" :key="site.id">
              <div class="favorite">
                <router-link :to="{ path: '/station/' + site }">{{
                  getMeta(site).site_name.trim()
                }}</router-link>
                <button @click="removeFav(site)">x</button>
              </div>
            </div>
          </draggable>
        </div>
      </div>
      <div class="container" v-else>
        No favorites :(
      </div>
      <button
        v-if="!isFavorite && this.$route.name == 'station'"
        @click="addFav"
      >
        Add as Favorite
      </button>
      <div v-else>
        Favorites can be added from a station detail page.
      </div>
      <!-- <div v-if="favorites">
                <div v-if="favorites.length > 0">
                    <a target="_blank" :href="'/multi/' + favorites">Share</a>
                </div>
            </div> -->
    </div>
  </div>
</template>

<script>
import stations from "@/assets/stations.json";
import draggable from "vuedraggable";

export default {
  name: "favorites",
  components: {
    draggable,
  },
  data() {
    return {
      favorites: null,
      favoritesRendered: null,
      isFavorite: false,
      hidden: true,
    };
  },
  created() {
    this.showFavs();
    this.isFav();
  },
  watch: {
    "$route.params.id"(id) {
      this.isFav();
    },
  },
  methods: {
    showFavs() {
      var vm = this;
      var currentFavs = JSON.parse(localStorage.getItem("bcd-favorites"));
      if (!currentFavs) {
        vm.favorites = null;
      } else {
        vm.favorites = currentFavs;
      }
    },
    addFav() {
      // get current favorites
      var currentFavs = JSON.parse(localStorage.getItem("bcd-favorites"));
      if (!currentFavs) {
        currentFavs = [];
        currentFavs[0] = this.$route.params.id;
        localStorage.setItem("bcd-favorites", JSON.stringify(currentFavs));
        this.showFavs();
      } else {
        if (currentFavs.includes(this.$route.params.id)) {
          alert("favorite already exists");
        } else {
          currentFavs.push(this.$route.params.id);
          localStorage.setItem("bcd-favorites", JSON.stringify(currentFavs));
          this.showFavs();
        }
      }
      this.isFav();
    },
    removeFav(site) {
      var currentFavs = JSON.parse(localStorage.getItem("bcd-favorites"));

      if (currentFavs.includes(site)) {
        var index = currentFavs.indexOf(site);
        if (index > -1) {
          currentFavs.splice(index, 1);
        }
        localStorage.setItem("bcd-favorites", JSON.stringify(currentFavs));
        this.showFavs();
      }
      console.log(currentFavs);
      this.isFav();
    },
    dragged() {
      localStorage.setItem("bcd-favorites", JSON.stringify(this.favorites));
      this.showFavs();
    },
    getMeta(id) {
      var key = id;
      if (key in stations) {
        return stations[key];
      }
    },
    isFav() {
      var vm = this;
      var currentFavs = JSON.parse(localStorage.getItem("bcd-favorites"));
      if (currentFavs && currentFavs.includes(this.$route.params.id)) {
        vm.isFavorite = true;
      } else {
        vm.isFavorite = false;
      }
    },
    hideFavBox() {
      this.hidden = false;
    },
  },
};
</script>

<style lang="scss">
.favorites {
  div {
    color: black;
  }
}

.favorite a {
  color: black;
}

.sortable-chosen {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}
.remove.small {
  padding: 0px 4px 2px 4px;
  margin-left: 4px;
}
.favsBox {
  background: none;
  border: none;
  svg {
    color: white;
  }
}
.favorites-box {
  position: absolute;
  background: white;
  z-index: 10;
  border: 1px solid gray;
  padding: 1rem;
}
</style>
