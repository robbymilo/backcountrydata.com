module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: 'https://backcountrydata.olimr.com',
        ws: true,
        changeOrigin: true
      },
    }
  }
}