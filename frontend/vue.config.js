module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: 'https://backcountrydata.com/api',
        ws: true,
        changeOrigin: true
      },
    }
  }
}