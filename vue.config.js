module.exports = {
  css: {
    sourceMap: false,
    loaderOptions: {
        sass: {
            // @/ 是 src/ 的别名
            // data:`@import "@/assets/scss/variables.scss";@import "@/assets/scss/global.scss";`
        }
    }
  }
}
