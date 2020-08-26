const chavy = init()
const cookieName = '时光相册'
const KEY_signurl = 'chavy_sign_url_everphoto'
const KEY_signheader = 'chavy_sign_header_everphoto'

const signinfo = {}
let VAL_signurl = chavy.getdata(KEY_signurl)
let VAL_signheader = chavy.getdata(KEY_signheader)

;(exec = async () => {
  chavy.log(`🔔 ${cookieName} 开始签到`)
  await signapp()
  showmsg()
  chavy.done()
})().catch((e) => chavy.log(`❌ ${cookieName} 签到失败: ${e}`), chavy.done())

function signapp() {
  return new Promise((resolve, reject) => {
    const url = { url: VAL_signurl, headers: JSON.parse(VAL_signheader) }
    chavy.post(url, (error, response, data) => {
      try {
        signinfo.signapp = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `签到结果: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} sign - 签到失败: ${e}`)
        chavy.log(`❌ ${cookieName} sign - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function showmsg() {
  let subTitle, detail
  if (signinfo.signapp.code == 0 && signinfo.signapp.data.checkin_result == true) {
    const reward = signinfo.signapp.data.reward / 1024 / 1024
    const total_reward = signinfo.signapp.data.total_reward / 1024 / 1024
    const tomorrow_reward = signinfo.signapp.data.tomorrow_reward / 1024 / 1024
    subTitle = '签到结果: 成功'
    detail = `总共获得: ${total_reward}MB (+${reward}MB), 明天获得: ${tomorrow_reward}MB`
  } else if (signinfo.signapp.code == 0 && signinfo.signapp.data.checkin_result == false) {
    const total_reward = signinfo.signapp.data.total_reward / 1024 / 1024
    const tomorrow_reward = signinfo.signapp.data.tomorrow_reward / 1024 / 1024
    subTitle = '签到结果: 成功 (重复签到)'
    detail = `总共获得: ${total_reward}MB, 明天获得: ${tomorrow_reward}MB`
  } else {
    subTitle = '签到结果: 失败'
    detail = `编码: ${signinfo.signapp.code}, 说明: 未知`
    chavy.log(`❌ ${cookieName} showmsg - 签到失败: ${JSON.stringify(signinfo.signapp)}`)
  }
  chavy.msg(cookieName, subTitle, detail)
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
