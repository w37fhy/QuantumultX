const cookieName = '去哪儿'
const cookieKey = 'chavy_cookie_qunar'
const chavy = init()
const cookieVal = JSON.parse(chavy.getdata(cookieKey))

sign()

function sign() {
  let url = { url: `https://user.qunar.com/webapi/member/signNewIndex.htm`, headers: cookieVal }
  url.body = `channel=app&platform=ios`
  chavy.post(url, (error, response, data) => {
    chavy.log(`${cookieName}, data: ${data}`)
    let result = JSON.parse(data)
    const title = `${cookieName}`
    let subTitle = ``
    let detail = ``
    if (result.errcode == 200) {
      if (result.data.modalInfo.title) {
        subTitle = '签到结果: 成功'
        detail = `${result.data.unit}: ${result.data.preferential.counts}个, 共签: ${result.data.total}天, 连签: ${result.data.continuous}天, 说明: ${result.data.modalInfo.title}`
      } else {
        subTitle = '签到结果: 成功 (重复签到)'
        detail = `${result.data.unit}: ${result.data.preferential.counts}个, 共签: ${result.data.total}天, 连签: ${result.data.continuous}天`
      }
    } else {
      subTitle = '签到结果: 失败'
      detail = `编码: ${result.errcode}, 说明: ${result.errmsg}`
    }
    chavy.msg(title, subTitle, detail)
  })

  chavy.done()
}

function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle, body) => {
    if (isSurge()) $notification.post(title, subtitle, body)
    if (isQuanX()) $notify(title, subtitle, body)
  }
  log = (message) => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
