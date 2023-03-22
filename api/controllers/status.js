var axios = require('axios');

module.exports = status;

async function status(req, res, next) {
  let result = await axios({
    method: 'get',
    url: 'https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport,metric/daily/start_of_period/637:ID:SNTL%7Cid=%22%22%7Cname/2022-10-01,2023-03-22/WTEQ::value,SNWD::value,PREC::value,TOBS::value,WDIRV::value,WSPDV::value,WSPDX::value',
  })
    .then((response) => {
      if (response.status === 200) {
        res.json({ api: 'ok'})
      } else {
        res.status(500)
        res.json({ api: 'usda error' })
      }
    })
    .catch((error) => {
      res.status(500)
      res.json({ api: 'usda error' })
    });
  return result
}
