const cookieName = '海底捞'
const signurlKey = 'signurl_hdl'
const signheaderKey = 'signheader_hdl'
const signbodyKey = 'signbody_hdl'
const hdl = init()

let isGetCookie = typeof $request !== 'undefined'

if (isGetCookie) {
   getcookie()
} else {
   sign()
}

function getcookie() {
  if ($request && $request.method == 'POST') {
      const signurlVal = $request.url
      const signheaderVal = JSON.stringify($request.headers)
      const signbodyVal = $request.body
  
      if (signurlVal) hdl.setdata(signurlVal, signurlKey)
      if (signheaderVal) hdl.setdata(signheaderVal, signheaderKey)
      if (signbodyVal) hdl.setdata(signbodyVal, signbodyKey)
       hdl.msg(cookieName, `获取Cookie: 成功, 请禁用该脚本`, ``)
   }
   hdl.done()
}
   
function sign() {
  const signurlVal = hdl.getdata(signurlKey)
  const signheaderVal = hdl.getdata(signheaderKey)
  const signbodyVal = hdl.getdata(signbodyKey)
  const url = { url: signurlVal, headers: JSON.parse(signheaderVal), body: signbodyVal }
  hdl.post(url, (error, response, data) => {
    hdl.log(`${cookieName}, data: ${data}`)
    const title = `${cookieName}`
    let subTitle = ''
    let detail = ''
    const result = JSON.parse(data)
    if (result.success == true && result.signInfoVO.todaySigned == true) {
      subTitle = `签到结果: 成功`
      detail = `签到奖励: ${result.customInfo.foodNum}火柴, 连签: ${result.signInfoVO.continueDay}天`
    } else if (result.success == false && result.signInfoVO.todaySigned == true) {
      subTitle = `签到结果: 成功 (重复签到)`
      detail = `连签: ${result.signInfoVO.continueDay}天`
    } else {
      subTitle = `签到结果: 失败`
      detail = `说明: ${result.message}, 请重新获取`
    }
    hdl.msg(title, subTitle, detail)
    hdl.done()
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