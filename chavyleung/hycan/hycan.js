const cookieName = 'HYCAN合创'
const signurlKey = 'signurl_hycan'
const signheaderKey = 'signheader_hycan'
const hycan = init()
const signurlVal = hycan.getdata(signurlKey)
const signheaderVal = hycan.getdata(signheaderKey)

sign()

function sign() {
  const url = { url: signurlVal, headers: JSON.parse(signheaderVal) }
  hycan.post(url, (error, response, data) => {
    hycan.log(`${cookieName}, data: ${data}`)
    const title = `${cookieName}`
    let subTitle = ''
    let detail = ''
    const result = JSON.parse(data)
    if (result.data.addScore == true) {
      subTitle = `签到结果: 成功`
      detail = `签到积分: ${result.data.score}, 签到详情: ${result.data.msg}`
    } else if (result.data.addScore == false) {
      subTitle = `签到结果: 成功 (重复签到)`
    } else {
      subTitle = `签到结果: 失败`
      detail = `说明: token失效, ${result.msg}`
    }
    hycan.msg(title, subTitle, detail)
    hycan.done()
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
  put = (url, cb) => {
    if (isSurge()) {
      $httpClient.put(url, cb)
    }
    if (isQuanX()) {
      url.method = 'PUT'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, put, done }
}
