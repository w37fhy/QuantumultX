const cookieName = '懂球帝'
const cookieKey = 'chavy_cookie_dongqiudi'
const chavy = init()
const cookieVal = JSON.parse(chavy.getdata(cookieKey))

sign()

function sign() {
  let url = { url: `https://api.dongqiudi.com/v3/useract/sign/tasknew/index`, headers: {} }
  url.headers['UUID'] = `${cookieVal.UUID}`
  url.headers['Authorization'] = `${cookieVal.Authorization}`
  url.headers['Accept-Encoding'] = `gzip, deflate, br`
  url.headers['Origin'] = `https://n.dongqiudi.com`
  url.headers['Connection'] = `keep-alive`
  url.headers['Accept'] = `application/json, text/plain, */*`
  url.headers['Referer'] = `https://n.dongqiudi.com/webapp/signIn.html`
  url.headers['Host'] = `api.dongqiudi.com`
  url.headers['User-Agent'] = `Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 NewsApp/7.3.3 NetType/NA Technology/Wifi (iPhone; iOS 13.3; Scale/2.00) dongqiudiClientApp (modelIdentifier/iPhone10,1 )`
  url.headers['Accept-Language'] = `zh-cn`

  chavy.get(url, (error, response, data) => {
    chavy.log(`${cookieName}, data: ${data}`)
    let result = JSON.parse(data)
    const title = `${cookieName}`
    let subTitle = ``
    let detail = ``
    if (result.code == 0) {
      if (result.data.sign_gold != 0) subTitle = '签到结果: 成功'
      else subTitle = '签到结果: 成功 (重复签到)'
      detail = `连签: ${result.data.continue_sign_days}天, 金币: ${result.data.gold_num} (+${result.data.sign_gold}), 价值: ${result.data.convertible_money}元`
    } else {
      subTitle = '签到结果: 失败'
      detail = `编码: ${result.code}, 说明: ${result.message}`
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
