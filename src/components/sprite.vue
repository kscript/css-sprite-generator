<template>
  <div class="css-sprite">
    <div class="bd">
      <el-collapse v-model="activeNames">
        <el-collapse-item :title="i18n('language')" name="language">
          <div>
            <el-button
              size="mini"
              :type="lang.active === 'zh' ? 'success' : 'info'"
              @click="selectLanguage('zh')"
            >{{i18n('zh')}}</el-button>
            <el-button
              size="mini"
              :type="lang.active === 'en' ? 'success' : 'info'"
              @click="selectLanguage('en')"
            >{{i18n('English')}}</el-button>
          </div>
        </el-collapse-item>
        <el-collapse-item :title="i18n('setting')" name="setting">
          <el-form :inline="true">
            <el-form-item :label="i18n('width')">
              <el-input v-model.number="width" size="mini" style="width: 60px;"></el-input>
            </el-form-item>
            <el-form-item :label="i18n('height')">
              <el-input v-model.number="height" size="mini" style="width: 60px;"></el-input>
            </el-form-item>
            <el-form-item :label="i18n('padding')">
              <el-input v-model.number="padding" size="mini" style="width: 60px;"></el-input>
            </el-form-item>
            <el-form-item :label="i18n('num')">
              <el-input v-model.number="num" size="mini" style="width: 60px;"></el-input>
            </el-form-item>
            <el-form-item :label="i18n('className')">
              <el-input v-model="className" size="mini" style="width: 100px;"></el-input>
            </el-form-item>
          </el-form>
          <el-form :inline="true">
            <el-form-item>
              <el-button @click="selectFile" type="primary" size="mini">{{i18n('selectFile')}}</el-button>
              <input
                class="hidden"
                type="file"
                accept="image/*"
                multiple="multiple"
                ref="file"
                @change="fileChange"
              >
              <a class="hidden" :href="blobUrl" download="sprite.png" ref="download"></a>
            </el-form-item>
            <el-form-item>
              <el-button @click="clear" type="danger" size="mini">{{i18n('clear')}}</el-button>
            </el-form-item>
            <el-form-item>
              <el-button @click="save" type="success" size="mini">{{i18n('save')}}</el-button>
            </el-form-item>
            <el-form-item>
              <el-button @click="build" type="success" size="mini">{{i18n('build')}}</el-button>
            </el-form-item>
            <el-form-item>
              <el-button @click="preview" type="warning" size="mini">{{i18n('preview')}}</el-button>
            </el-form-item>
          </el-form>
        </el-collapse-item>
        <el-collapse-item :title="i18n('operatingSpace')" name="handler">
          <el-row type="flex">
            <!-- <el-col :span="8">
              <div class="table-box scoll">
                <el-table
                  border
                  :data="files"
                  :empty-text="i18n('empty')"
                  size="mini"
                  style="width: 100%;"
                  :height="cxtHeight < 300 ? 300 : cxtHeight"
                >
                  <el-table-column prop="path" :label="i18n('picture')">
                    <template slot-scope="scope">
                      <img :src="scope.row.data" alt="scope.name">
                    </template>
                  </el-table-column>
                  <el-table-column :label="i18n('handler')">
                    <template slot-scope="scope">
                      <span class="handler-icon">
                        <i class="el-icon-arrow-up" @click="fileHandler('up', scope)"></i>
                        <i class="el-icon-arrow-down" @click="fileHandler('down',scope)"></i>
                        <i class="el-icon-close" @click="fileHandler('close',scope)"></i>
                      </span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-col> -->
            <el-col :span="24">
              <div class="canvas-box"
                :class="{'draging': drag}"
                :style="'padding: ' + boxPadding + 'px'"
                @mousedown="onmousedown"
                @mousemove="onmousemove"
                @mouseup="onmouseup"
                @mouseleave="mouseleave"
                v-show="files.length"
              >
                <canvas
                ref="canvas"
                :width="cxtWidth +'px'"
                :height="cxtHeight + 'px'"
                >
                </canvas>
              </div>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item :title="i18n('cssGenerator')" name="style">
          <div class="style-box">
            <textarea v-model="style"></textarea>
          </div>
        </el-collapse-item>
        <el-collapse-item :title="i18n('preview')" name="preview">
          <div
            class="preview"
            ref="preview"
            v-if="isPreview"
            :style="'width: ' + (cxtWidth + 2) + 'px; height: ' + (cxtHeight + height) + 'px'"
          >
            <div class="bg">
              <div
                v-for="(vo, index) in files"
                :class="className + 's ' + className + '-' + index"
                :style="'width: ' + width + 'px; height: ' + height + 'px;'"
                :key="index"
              ></div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
export default {
  name: 'sprite',
  data () {
    return {
      activeNames: ['language', 'setting', 'handler'],
      style: '',
      styleEl: null,
      blobUrl: '',
      className: 'cs-icon',
      isPreview: false,
      width: 32,
      height: 32,
      padding: 1,
      num: 15,
      cxt: null,
      files: [],
      drag: false,
      isSave: false,
      offsetX: 0,
      offsetY: 0,
      selecteIndex: 0,
      imgBuffer: null,
      notice: {
        state: 0,
        build: {
          type: 'success',
          title: '环境创建成功!',
          message: '请在 操作区 对图片进行调整',
          duration: 3000
        },
        guide: {
          title: '操作指南',
          dangerouslyUseHTMLString: true,
          message: '<ol style="list-style: disc;"><li>交换图片位置: <br />  选择图片并拖动到其它图片位置上</li><li>删除图片: <br />  选择图片并拖动到浅蓝色边框区域</li></ol>',
          duration: 0
        }
      },
      lang: {
        active: 'zh',
        en: {
          language: '语言 Language',
          zh: '中文'
        },
        zh: {
          language: '语言 Language',
          zh: '中文',
          height: '高度',
          width: '宽度',
          fileName: '文件名',
          selectFile: '选择文件',
          setting: '设置区',
          operatingSpace: '操作区',
          handler: '操作',
          padding: '间距',
          num: '每排个数',
          build: '生成',
          clear: '清空',
          save: '保存',
          preview: '预览',
          picture: '图片',
          empty: '暂无数据',
          cssGenerator: '生成CSS'
        }
      }
    }
  },
  computed: {
    local () {
      return this.lang[this.lang.active] || {}
    },
    boxPadding () {
      return this.width + 3
    },
    cxtWidth () {
      return (this.width + this.padding * 2) * this.num
    },
    cxtHeight () {
      return (this.height + this.padding * 2) * Math.ceil(this.files.length / this.num)
    }
  },
  methods: {
    selectLanguage (type) {
      this.lang.active = type
    },
    i18n (key) {
      return this.local[key] || key
    },
    getIndex ($event) {
      let padding = 0
      let x = ~~(($event.offsetX - padding) / (this.width + this.padding * 2))
      let y = ~~(($event.offsetY - padding) / (this.height + this.padding * 2))
      return x + this.num * y
    },
    onmousedown ($event) {
      if (/canvas/i.test($event.target.tagName)) {
        this.drag = true
        this.offsetX = ($event.offsetX) % (this.width + this.padding * 2)
        this.offsetY = ($event.offsetY) % (this.height + this.padding * 2)
        this.selecteIndex = this.getIndex($event)
      }
    },
    mouseleave ($event) {
      if (this.drag) {
        this.onmouseup($event)
      }
    },
    onmousemove ($event) {
      if (this.drag) {
        let inner = /canvas/i.test($event.target.tagName)
        let padding = inner ? 0 : this.boxPadding
        this.build({
          index: this.selecteIndex,
          x: $event.offsetX - this.offsetX - padding,
          y: $event.offsetY - this.offsetY - padding
        })
      }
    },
    onmouseup ($event) {
      if (this.drag) {
        let inner = /canvas/i.test($event.target.tagName)
        let index = this.getIndex($event)
        this.drag = false
        this.isSave = false
        if (inner) {
          if (this.selecteIndex !== index) {
            this.exchange(this.files, this.selecteIndex, index)
          }
        } else {
          this.files.splice(this.selecteIndex, 1)
        }
        this.refresh()
      }
    },
    readfile (file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.onload = function () {
          resolve(reader.result)
        }
        reader.onerror = function (e) {
          reject(e)
        }
        reader.readAsDataURL(file)
      })
    },
    fileChange () {
      let fileEl = this.$refs.file
      let files = []
      let count = fileEl.files.length
      if (this.notice.state === 0 && count) {
        this.notice.state = 5
        this.$notify.closeAll()
        this.$notify(this.notice.build)
        this.$nextTick(() => {
          this.$notify(this.notice.guide)
        })
      }
      for (let item of fileEl.files) {
        this.readfile(item).then(data => {
          files.push({
            file: item,
            img: null,
            data: data,
            name: item.name
          })
          count--
          if (!count) {
            this.files = files
            this.refresh()
          }
        })
      }
    },
    selectFile () {
      this.$refs.file.click()
    },
    fileHandler (type, scope) {
      if (type === 'close') {
        this.removeItem(scope.$index)
      } else {
        this.exchange(this.files, scope.$index, scope.$index + (type === 'up' ? -1 : 1))
      }
      this.refresh()
    },
    exchange (ary, indexA, indexB) {
      if (Array.isArray(ary)) {
        if (
          indexA >= 0 &&
          indexA < ary.length &&
          indexB >= 0 &&
          indexB < ary.length
        ) {
          ary.splice(indexA, 1, ary.splice(indexB, 1, ary[indexA])[0])
        }
      }
    },
    removeItem (index) {
      this.files.splice(index, 1)
    },
    loadImg (item) {
      return new Promise(resolve => {
        if (item.img) {
          resolve(item)
        } else {
          let img = new Image()
          img.onload = () => {
            item.img = img
            resolve(item)
          }
          img.src = item.data
        }
      })
    },
    refresh () {
      this.$nextTick(() => {
        this.build()
        this.createStyle()
      })
    },
    build (selected) {
      let current
      let count = 0
      let cxt = this.cxt
      cxt.clearRect(0, 0, this.cxtWidth, this.cxtHeight)
      this.files.forEach((item, index) => {
        this.loadImg(item).then(item => {
          if (selected && index === selected.index) {
            current = item
          } else {
            this.drawImage(
              cxt,
              item,
              (index % this.num) * (this.width + this.padding * 2) + this.padding,
              ~~(index / this.num) * (this.height + this.padding * 2) + this.padding
            )
          }
          count++
          if (count === this.files.length) {
            current && this.drawImage(cxt, current, selected.x, selected.y)
          }
        })
      })
    },
    drawImage (cxt, item, x, y) {
      cxt.drawImage(item.img, x, y, this.width, this.height)
    },
    createStyle () {
      /* eslint-disable */
      let styles = this.files.map((item, index) => {
      let x = (index % this.num) * (this.width + this.padding * 2)
      let y = ~~(index / this.num) * (this.height + this.padding * 2)
      return (
        `.${this.className || 'cs-icons'}s.${this.className || 'cs-icon'}-${index}{
          background-position: ${x ? -x : x}px ${y ? -y : y}px;
        }
        `)
      })
      this.style = [
        `.${this.className || 'cs-icons'}s{
          background-image: url(${this.blobUrl || ''});
          background-repeat: no-repeat;
          padding: ${this.padding | 0}px;
          display: inline-block;
          float: left;
          border-right: 1px solid #eee;
          border-bottom: 1px solid #eee;
          margin-right: -1px;
          margin-bottom: -1px;
        }
        `
      ].concat(styles).join('').replace(/\s{9}/g, '\n')
    /* esint-enable */
    },
    clear () {
      this.style = ''
      this.files.splice(0)
    },
    preview () {
      if (this.files.length) {
        this.isPreview = true
        this.$refs.canvas.toBlob(blob => {
          this.blobUrl = URL.createObjectURL(blob)
          this.createStyle()
          if (!this.styleEl) {
            this.styleEl = document.createElement('style')
            this.styleEl.innerHTML = this.style
            this.$refs.preview.appendChild(this.styleEl)
          } else {
            this.styleEl.innerHTML = this.style
          }
          if (this.activeNames.indexOf('preview') < 0) {
            this.activeNames.push('preview')
          }
        })
      }
    },
    save () {
      if (!this.files.length) return
      this.blobUrl = this.$refs.canvas.toDataURL('image/png')
      setTimeout(() => {
        this.$refs.download.click()
      })
    }
  },
  mounted () {
    this.cxt = this.$refs.canvas.getContext('2d')
  }
}
</script>
<style lang="scss" scoped>
.css-sprite {
  .hidden {
    display: none;
  }
  .text-center {
    text-align: center;
  }
  .bd {
    /deep/ .el-collapse-item__header {
      padding: 0px 10px;
      color: #535c73;
      font-size: 14px;
      font-weight: bold;
      background-color: #ecf5ff;
    }
    /deep/ .el-collapse-item__wrap {
      padding: 10px 10px;
      .el-collapse-item__content {
        padding-bottom: 0;
        line-height: 1.4;
      }
    }
    .el-form-item {
      margin-bottom: 10px;
    }
    .handler-icon {
      cursor: pointer;
      i {
        font-size: 14px;
        padding: 1px;
        &:hover {
          color: red;
        }
      }
    }
    .table-box {
      img {
        max-width: 32px;
      }
    }
    .canvas-box{
      padding: 10px;
      background: #ecf5ff;
      display: inline-block;
      border: 1px solid #dbe5f1;
      &.draging{
        cursor: move;
      }
      canvas{
        background: #333;
      }
    }
    .style-box {
      padding: 0 10px;
      textarea {
        padding: 5px;
        width: 100%!important;
        min-height: 160px;
        border: 1px solid #ddd;
        outline: none;
      }
    }
    .preview {
      .bg {
        background-color: #fff;
        border: 1px solid #eee;
        overflow: hidden;
        div{
          box-sizing: content-box;
        }
      }
    }
  }
}
</style>
