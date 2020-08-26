const cookieName = '加油广东'
const signurlKey = 'chavy_signurl_gdoil'
const signheaderKey = 'chavy_signheader_gdoil'
const chavy = init()
const signurlVal = chavy.getdata(signurlKey)
const signheaderVal = chavy.getdata(signheaderKey)

sign()

function sign() {
  const url = { url: signurlVal, headers: JSON.parse(signheaderVal) }
  url.body = '{}'
  chavy.post(url, (error, response, data) => {
    chavy.log(`${cookieName}, data: ${data}`)
    const result = JSON.parse(data)
    const title = `${cookieName}`
    let subTitle = ''
    let detail = ''
    if (result.result == true) {
      subTitle = `签到结果: 成功`
    } else {
      if (result.msg.indexOf('已经签到') >= 0) subTitle = `签到结果: 成功 (重复签到)`
      else subTitle = `签到结果: 失败`
      detail = `说明: ${result.msg}`
    }
    chavy.msg(title, subTitle, detail)
    chavy.done()
  })
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
