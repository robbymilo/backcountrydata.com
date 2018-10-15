# Backcountry Data API

An API for accessing SNOTEL data in JSON format from the current water year. Data is cached and fetched every 15 minutes.

To start, clone the repo and use command `npm start`.

## To-Do

* Include NWS forecast hazards
* Include nearst AVY centers and reports
* Update https://backcountrydata.com with this API

## Endpoints

### Hourly Data

Returns hourly data for a SNOTEL station. Points include air temp, snow depth, snow water equivalent, precipitation accumulation, wind direction, wind speed, and wind gust.

**URL** : `/api/hour/:id/?total=:hours`

**Parameters** : 

`id=[integer]` where `id` is the SNOTEL station ID (required).

`hours=[integer]` where `hours` is the most recent hours to return (optional).

Example: https://backcountrydata.herokuapp.com/api/hour/978?total=2

### Daily Data

Returns start of day (GMT-8) data for a SNOTEL station. Points include air temp, snow depth, snow water equivalent, precipitation accumulation, wind direction, wind speed, and wind gust.

**URL** : `/api/day/:id/?total=:days`

**Parameters** : 

`id=[integer]` where `id` is the SNOTEL station ID (required).

`days=[integer]` where `days` is the most recent days to return (optional).

Example: https://backcountrydata.herokuapp.com/api/day/978?total=2

### Station Meta

Returns meta data about a SNOTEL station.

**URL** : `/api/station/:id`

**Parameters** : 

`id=[integer]` where `id` is the SNOTEL station ID (required).

Example: https://backcountrydata.herokuapp.com/api/station/978

### Nearest from Station

Returns an array of the 10 closest stations to a SNOTEL station.

**URL** : `/api/nearest/:id`

**Parameters** : 

`id=[integer]` where `id` is the SNOTEL station ID (required).

Example: https://backcountrydata.herokuapp.com/api/nearest/978

### Nearest from Coordinates

Returns an array of the 10 closest stations to a lat/lon coordinates.

**URL** : `/api/nearest/?lat=latitude&lon=longitude`

**Parameters** : 

`latitude=[integer]` (required).

`longitude=[integer]` (required).

Example: https://backcountrydata.herokuapp.com/api/nearest/?lat=43.7018976&lon=-116.3025711

### Search

Returns an array of stations that are similar to query.

**URL** : `/api/nearest/?search=query`

**Parameters** : 

`query=[string]` (required).

Example: https://backcountrydata.herokuapp.com/api/nearest/?search=boise

### Forecast

Returns NWS forecast time series and scientific discussion for a SNOTEL station.

**URL** : `/api/station/:id`

**Parameters** : 

`id=[integer]` where `id` is the SNOTEL station ID (required).

Example: https://backcountrydata.herokuapp.com/api/station/978