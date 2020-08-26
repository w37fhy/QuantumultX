const cookieName = '网易严选'
const cookieKey = 'chavy_cookie_yanxuan'
const tokenKey = 'chavy_token_yanxuan'
const chavy = init()
let cookieVal = chavy.getdata(cookieKey)
let tokenVal = chavy.getdata(tokenKey)

sign()

function sign() {
  const title = `${cookieName}`
  const subTitle = `签到脚本可能会导致账号异常, 请暂停使用`
  const detail = ``
  chavy.msg(title, subTitle, detail)
}

function _sign() {
  const token = JSON.parse(tokenVal)
  let url = { url: `https://m.you.163.com/xhr/points/sign.json?csrf_token=${token.csrf_token}`, headers: { Cookie: cookieVal } }
  url.headers['Accept'] = `application/json, text/javascript, */*; q=0.01`
  url.headers['Accept-Encoding'] = `gzip, deflate, br`
  url.headers['Origin'] = `https://m.you.163.com`
  url.headers['Connection'] = `keep-alive`
  url.headers['Host'] = `m.you.163.com`
  url.headers['Content-Length'] = `0`
  url.headers['User-Agent'] = `Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 yanxuan/5.1.2 device-id/d7af0a77d9d88bd33a8ae5b35e6219ad app-chan-id/AppStore trustId/ios_trustid_3353a5577f9c4677bddec1ca7ac490fb`
  url.headers['Referer'] = `https://m.you.163.com/points/index`
  url.headers['Accept-Language'] = `zh-cn`
  url.headers['X-Requested-With'] = `XMLHttpRequest`

  chavy.post(url, (error, response, data) => {
    chavy.log(`${cookieName}, data: ${data}`)
    const result = JSON.parse(data)
    const title = `${cookieName}`
    let subTitle = ``
    let detail = ``
    if (result.code == '200') {
      subTitle = `签到结果: 成功`
      detail = `积分: ${result.data.point}`
    } else if (result.code == '400') {
      subTitle = `签到结果: 成功 (重复签到)`
      detail = `说明: ${result.errorCode}`
    } else {
      subTitle = `签到失败: 未知`
      detail = `编码: ${result.code}, 说明: ${result.errorCode}`
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
