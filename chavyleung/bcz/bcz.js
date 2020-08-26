const cookieName = '百词斩'
const cookieKey = 'senku_cookie_bcz'
const shareKey = 'senku_key_bcz'
const senku = init()
const cookieVal = senku.getdata(cookieKey)
const shareVal = senku.getdata(shareKey)

let signinfo = {}
senku.log()
check()
function check(cb) {
  const url = { url: `https://group.baicizhan.com/group/apply_reward`, headers: { Cookie: cookieVal } }
  url.headers['Content-Type'] = `text/plain;charset=utf-8`
  url.headers['User-Agent'] = `Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.10(0x17000a21) NetType/4G Language/zh_CN`
  const key = { share_key: shareVal }
  url.body = JSON.stringify(key)
  senku.log(url.body)
  senku.post(url, (error, response, data) => {
    signinfo = JSON.parse(data)
    senku.log(JSON.stringify(signinfo))
    const title = `${cookieName}`
    let subTitle = ``
    let detail = ''
    if (signinfo.code == 1) {
      if (signinfo.data.is_new) {
        subTitle += `成功`
        detail = `获取铜板数${signinfo.data.reward[2]}`
      } else {
        subTitle += `今天的铜板已经领取,但是单词还是可以继续背的`
      }
    } else {
      detail = `状态: 还玩手机？快去背单词`
      subTitle += '失败'
    }
    senku.msg(title, subTitle, detail)
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
