const cookieName = 'QQ音乐'
const signurlKey = 'chavy_signurl_qqmusic'
const signheaderKey = 'chavy_header_qqmusic'
const signbodyKey = 'chavy_body_qqmusic'
const chavy = init()
const signurlVal = chavy.getdata(signurlKey)
const signheaderVal = chavy.getdata(signheaderKey)
const signbodyVal = chavy.getdata(signbodyKey)

sign()

function sign() {
  if (signurlVal && signheaderVal && signbodyVal) {
    const url = { url: signurlVal, headers: JSON.parse(signheaderVal), body: signbodyVal }
    chavy.post(url, (error, response, data) => {
      chavy.log(`${cookieName}, data: ${data}`)
      const title = `${cookieName}`
      let subTitle = ''
      let detail = ''
      let result = JSON.parse(data)
      if (result.code == 0 && result.req_0 && result.req_0.code == 0) {
        if (result.req_0.data.retCode == 0) {
          subTitle = `签到结果: 成功`
          detail = `共签: ${result.req_0.data.totalDays}天, 今天积分: +${result.req_0.data.todayScore}, 明天积分: +${result.req_0.data.tomrrowScore}`
        } else if (result.req_0.data.retCode == 40001) {
          subTitle = `签到结果: 成功 (重复签到)`
          detail = `说明: ${result.req_0.data.errMsg}`
        } else {
          subTitle = `签到结果: 失败`
          detail = `编码: ${result.req_0.data.retCode}, 说明: ${result.req_0.data.errMsg}`
        }
      } else {
        subTitle = `签到结果: 失败`
        detail = `说明: 详见日志`
      }
      chavy.msg(title, subTitle, detail)
      chavy.done()
    })
  } else {
    const title = `${cookieName}`
    const subTitle = '签到结果: 失败'
    const detail = `原因: 请先获取Cookie`
    chavy.msg(title, subTitle, detail)
    chavy.log(`${cookieName}, ${subTitle}, ${detail}`)
    chavy.done()
  }
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
