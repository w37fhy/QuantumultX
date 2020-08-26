const cookieName = 'bilibili'
const cookieKey = 'chavy_cookie_bilibili'
const chavy = init()
const cookieVal = chavy.getdata(cookieKey)

sign()

function sign() {
  let url = {
    url: `https://api.live.bilibili.com/pay/v1/Exchange/silver2coin`,
    headers: {
      Cookie: cookieVal
    }
  }
  url.headers['Origin'] = 'api.live.bilibili.com'
  url.headers['Referer'] = 'http://live.bilibili.com/'
  url.headers['Accept'] = 'application/json, text/javascript, */*; q=0.01'
  url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'

  chavy.get(url, (error, response, data) => {
    let result = JSON.parse(data)
    let title = `${cookieName} 银瓜子转硬币`
    // 兑换成功
    if (result && result.code == 0) {
      let subTitle = `${result.message}`
      let detail = `成功兑换: ${result.data.coin} 个硬币\n当前银瓜子: ${result.data.silver} , 当前金瓜子: ${result.data.gold}`
      chavy.msg(title, subTitle, detail)
    }
    // 兑换中止（重复兑换&银瓜子不足）
    else if (result && result.code == 403) {
      let subTitle = `未成功兑换`
      let detail = `${result.message}`
      chavy.msg(title, subTitle, detail)
    }
    // 兑换失败
    else {
      let subTitle = `兑换失败`
      let detail = `说明: ${result.message}`
      chavy.msg(title, subTitle, detail)
    }
    chavy.log(`${cookieName}, data: ${data}`)
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
