const cookieName = '飞客茶馆'
const cookieKey = 'chavy_cookie_flyertea'
const tokenKey = 'chavy_token_flyertea'
const chavy = init()
let cookieVal = chavy.getdata(cookieKey)
let tokenVal = chavy.getdata(tokenKey)

sign()

function sign() {
  const token = JSON.parse(tokenVal)
  let url = { url: `https://www.flyertea.com/plugin.php?id=k_misign:sign&operation=qiandao&from=insign&version=${token.version}&appcan=appcan&appkey=${token.appkey}&appversion=${token.appversion}&formhash=${token.formhash}&token=${token.token}`, headers: { Cookie: cookieVal } }
  url.headers['Accept'] = `*/*`
  url.headers['Accept-Language'] = `zh-Hans-CN;q=1, en-US;q=0.9`
  url.headers['Host'] = `www.flyertea.com`
  url.headers['User-Agent'] = `FKForum/7.14.0 (iPhone10,1; iOS 13.3; Scale/2.00)`
  url.headers['Referer'] = `https://www.flyertea.com/home.php`
  url.headers['Accept-Encoding'] = `gzip, deflate, br`
  url.headers['Connection'] = `keep-alive`
  chavy.get(url, (error, response, data) => {
    chavy.log(`${cookieName}, data: ${data}`)
    const result = JSON.parse(data)
    const title = `${cookieName}`
    let subTitle = ``
    let detail = ``
    if (result.Variables && result.Variables.Message.messageval == 'success') {
      subTitle = `签到结果: 成功`
      detail = `说明: ${result.Variables.Message.messagestr}`
      chavy.msg(title, subTitle, detail)
    } else {
      if (result.Message.messageval == 'error' && result.Message.messagestr.indexOf('只能签到一次') >= 0) {
        subTitle = `签到结果: 成功 (重复签到)`
      } else {
        subTitle = `签到结果: 失败`
      }
      detail = `说明: ${result.Message.messagestr}`
      chavy.msg(title, subTitle, detail)
    }
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
