const cookieName = '樊登读书'
const signurlKey = 'senku_signurl_pandeng'
const signheaderKey = 'senku_signheader_pandeng'
const signbodyKey = 'senku_signbody_pandeng'
const senku = init()
const signurlVal = senku.getdata(signurlKey)
const signheaderVal = senku.getdata(signheaderKey)
const signBodyVal = senku.getdata(signbodyKey)

sign()

function sign() {
  const url = { url: signurlVal, headers: JSON.parse(signheaderVal), body: signBodyVal }
  senku.post(url, (error, response, data) => {
    senku.log(`${cookieName}, data: ${data}`)
    const res = JSON.parse(data)
    let subTitle = ``
    let detail = ``
    if (res.status == 1) {
      subTitle = `签到结果: 成功`
    } else {
      subTitle = `签到结果: 失败`
      detail = `状态: ${res.message}`
    }
    senku.msg(cookieName, subTitle, detail)
    senku.done()
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
