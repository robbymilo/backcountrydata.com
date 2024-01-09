import axios from "axios";

Number.prototype.toFixedNumber = function (x, base) {
  var pow = Math.pow(base || 10, x);
  return Math.round(this * pow) / pow;
};

// Converts from degrees to radians.
function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

// Converts from radians to degrees.
function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

export const functions = {
  methods: {
    tempCheck: function (array) {
      if (!this.isMetric) {
        return array.map((x) => {
          if (x !== "") {
            Math.round(x * 1.8 + 32);
          }
        });
      } else {
        return array.map((x) => {
          if (x !== "") {
            Math.round(x);
          }
        });
      }
    },
    timezone(date_time) {
      return date_time.map((x) => new Date(x + " GMT-8"));
    },
    zeroCheck(integer) {
      return integer <= 0 ? 0 : integer;
    },
    ftCheck(integer) {
      if (!this.isMetric) {
        return integer;
      } else {
        return Math.floor(integer * 0.3);
      }
    },
    mCheck(integer) {
      if (!this.isMetric) {
        return Math.floor(integer * 3.28084);
      } else {
        return Math.floor(integer);
      }
    },
    mmCheck(array) {
      var depth = array;
      if (!this.isMetric) {
        return depth.map((x) => (x * 0.0393701).toFixedNumber(2));
      } else {
        return depth.map((x) => (x * 0.1).toFixedNumber(2));
      }
    },
    cmCheck(array) {
      var depth = array.map((x) => this.zeroCheck(x));
      if (!this.isMetric) {
        return depth.map((x) => Math.round(x * 0.393701).toFixedNumber(2));
      } else {
        return depth;
      }
    },
    inCheck(integer) {
      if (this.isMetric) {
        const metric = integer * 2.54;
        return metric;
      } else {
        return integer;
      }
    },
    percentCheck(array) {
      return array.map((x) => parseInt(x));
    },
    qpfCheck(array) {
      return array.map(function (x) {
        if (typeof x === "string") {
          x = Number(x);
        } else {
          x = 0;
        }
        return x;
      });
    },
    directionCheck(array) {
      return array.map((x) => this.zeroCheck(x));
    },
    speedCheck(array) {
      return array.map((x) => this.zeroCheck(x));
    },
    titleCase(str) {
      return str.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase());
    },
    kmCheck(int) {
      if (!this.isMetric) {
        return Math.floor(int * 0.6);
      } else {
        return Math.floor(int);
      }
    },
    metersCheck(int) {
      if (!this.isMetric) {
        return Math.floor(int * 3.28084);
      } else {
        return Math.floor(int);
      }
    },
    mm_to_in(int) {
      if (!this.isMetric) {
        return (int * 0.0393701).toFixed(1);
      } else {
        return int;
      }
    },
    cm_to_in(int) {
      if (!this.isMetric) {
        return (int * 0.393701).toFixed(1);
      } else {
        return int;
      }
    },
    ms_to_mph(int) {
      if (!this.isMetric) {
        return (int * 0.621371689334).toFixed(1); // km/hr to mph
      } else {
        return (int * 0.277778).toFixed(1); // km/hr to m/s
      }
    },
    c_to_f(int) {
      if (!this.isMetric) {
        return Math.floor(int * 1.8 + 32); // km/hr to mph
      } else {
        return int; // km/hr to m/s
      }
    },
    mi_km() {
      if (this.isMetric) {
        return "km";
      } else {
        return "mi";
      }
    },
    cm_in() {
      if (this.isMetric) {
        return "cm";
      } else {
        return "in";
      }
    },
    mm_in() {
      if (this.isMetric) {
        return "mm";
      } else {
        return "in";
      }
    },
    c_f() {
      if (this.isMetric) {
        return "C";
      } else {
        return "F";
      }
    },
    m_ft() {
      if (this.isMetric) {
        return "m";
      } else {
        return "ft";
      }
    },
    ms_mph() {
      if (this.isMetric) {
        return "m/s";
      } else {
        return "mph";
      }
    },
    degToCompass(num) {
      var val = Math.floor(num / 22.5 + 0.5);
      var arr = [
        "N",
        "NNE",
        "NE",
        "ENE",
        "E",
        "ESE",
        "SE",
        "SSE",
        "S",
        "SSW",
        "SW",
        "WSW",
        "W",
        "WNW",
        "NW",
        "NNW",
      ];
      return arr[val % 16];
    },
    ampReplace(string) {
      return string.replace(/&amp;/g, "&");
    },
    bearing(startLat, startLng, destLat, destLng) {
      startLat = toRadians(startLat);
      startLng = toRadians(startLng);
      destLat = toRadians(destLat);
      destLng = toRadians(destLng);

      let y = Math.sin(destLng - startLng) * Math.cos(destLat);
      let x =
        Math.cos(startLat) * Math.sin(destLat) -
        Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
      let brng = Math.atan2(y, x);
      brng = toDegrees(brng);
      return (brng + 360) % 360;
    },
    getCurrentUnits: function () {
      const localUnits = localStorage.getItem("bcd-metric");
      return JSON.parse(localUnits);
    },
    lastArray(array) {
      // returns latest data point of array
      return array[array.length - 1];
    },
    dayArray(array) {
      // returns the 24th hour-ago data point
      return array[array.length - 25];
    },
    weekArray(array) {
      // returns the 7th day-ago data point
      return array[array.length - 8];
    },
    fetchData(station, type, options) {
      return axios({
        method: "get",
        url: `/api/${type}/${station}${options}`,
      }).then(function (response) {
        return response.data;
      });
    },
    capitalize(s) {
      if (typeof s !== "string") return "";
      return s.charAt(0).toUpperCase() + s.slice(1);
    },
  },
};
