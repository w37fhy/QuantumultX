const cookieName = '美团'
const tokenurlKey = 'chavy_tokenurl_meituan'
const tokenheaderKey = 'chavy_tokenheader_meituan'
const signurlKey = 'chavy_signurl_meituan'
const signheaderKey = 'chavy_signheader_meituan'
const signbodyKey = 'chavy_signbody_meituan'
const chavy = init()
const tokenurlVal = chavy.getdata(tokenurlKey)
const tokenheaderVal = chavy.getdata(tokenheaderKey)
const signurlVal = chavy.getdata(signurlKey)
const signheaderVal = chavy.getdata(signheaderKey)
const signBodyVal = chavy.getdata(signbodyKey)

sign()

function sign() {
  const url = { url: signurlVal, headers: JSON.parse(signheaderVal), body: signBodyVal }
  chavy.post(url, (error, response, data) => {
    chavy.log(`${cookieName}, data: ${data}`)
    const result = JSON.parse(data)
    let subTitle = ``
    let detail = ``
    if (result.code == 0) {
      subTitle = `签到结果: 成功`
      detail = `本周连签: ${result.data[0].circleSignTimes}天`
      for (r of result.data[0].signInAwardRecords) {
        const rinfo = JSON.parse(r.info)
        if (rinfo.type == `cash`) detail += `, 奖励金: ${rinfo.amount / 100}元`
        else if (rinfo.type == `coupon`) detail += `\n优惠券: ${rinfo.name}: ${rinfo.amount}元 (${rinfo.condition})`
        else detail += `\n未知奖励!`
      }
    } else if (result.code == 2002) {
      subTitle = `签到结果: 成功 (重复签到)`
      detail = `说明: ${result.msg}`
    } else {
      subTitle = `签到结果: 失败`
      detail = `编码: ${result.code}, 说明: ${result.msg}`
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
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
