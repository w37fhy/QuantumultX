const cookieName = '猫咪音乐网'
const signurlKey = 'chavy_signurl_maomicd'
const signheaderKey = 'chavy_signheader_maomicd'
const chavy = init()
const signurlVal = chavy.getdata(signurlKey)
const signheaderVal = chavy.getdata(signheaderKey)

sign()

function sign() {
  const url = { url: signurlVal, headers: JSON.parse(signheaderVal) }
  chavy.get(url, (error, response, data) => {
    chavy.log(`${cookieName}, data: ${data}`)
    let subTitle = ``
    let detail = ``
    let result = data.match(/<root>(<!\[CDATA\[(.*?)\]\]>)<\/root>/)
    if (result) {
      result = result[2]
      if (result == '') subTitle = `签到结果: 成功`
      else if (result.indexOf('今日已签') >= 0) subTitle = `签到结果: 成功 (重复签到)`
      else (subTitle = `签到结果: 未知`), (detail = `说明: ${result}`)
    } else {
      subTitle = `签到结果: 失败`
    }
    chavy.msg(cookieName, subTitle, detail)
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
