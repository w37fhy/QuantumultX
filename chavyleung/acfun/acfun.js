const cookieName = 'AcFun'
const cookieKey = 'chavy_cookie_acfun'
const tokenKey = 'chavy_token_acfun'
const chavy = init()
const cookieVal = chavy.getdata(cookieKey)
const tokenVal = chavy.getdata(tokenKey)

sign()

function sign() {
  let url = { url: `https://api-new.acfunchina.com/rest/app/user/signIn`, headers: { Cookie: cookieVal } }
  url.headers['access_token'] = `${tokenVal}`
  url.headers['acPlatform'] = 'IPHONE'
  url.headers['User-Agent'] = 'AcFun/6.14.2 (iPhone; iOS 13.3; Scale/2.00)'
  url.body = `access_token=${cookieVal}`
  chavy.post(url, (error, response, data) => {
    const result = JSON.parse(data)
    const title = `${cookieName}`
    let subTitle = ``
    let detail = ``
    if (result.result == 0 || result.result == 122) {
      getinfo(result)
    } else {
      subTitle = `签到结果: 失败`
      detail = `编码: ${result.result}, 说明: ${result.error_msg}`
      chavy.msg(title, subTitle, detail)
    }
    chavy.log(`${cookieName}, data: ${data}`)
  })
  chavy.done()
}

function getinfo(signresult) {
  let url = { url: `https://api-new.acfunchina.com/rest/app/user/hasSignedIn`, headers: { Cookie: cookieVal } }
  url.headers['access_token'] = `${tokenVal}`
  url.headers['acPlatform'] = 'IPHONE'
  url.headers['User-Agent'] = 'AcFun/6.14.2 (iPhone; iOS 13.3; Scale/2.00)'
  url.body = `access_token=${cookieVal}`
  chavy.post(url, (error, response, data) => {
    const result = JSON.parse(data)
    const title = `${cookieName}`
    let subTitle = ``
    let detail = ``
    if (signresult.result == 0) {
      subTitle = `签到结果: 成功`
    } else if (signresult.result == 122) {
      subTitle = `签到结果: 成功 (重复签到)`
    }
    detail = `共签: ${result.cumulativeDays}次, 连签: ${result.continuousDays}次, 说明: ${signresult.msg}`
    chavy.msg(title, subTitle, detail)
    chavy.log(`${cookieName}, data: ${data}`)
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
