const chavy = init()
const cookieName = 'CSDN'
const KEY_loginurl = 'chavy_tokenurl_csdn'
const KEY_loginheader = 'chavy_tokenheader_csdn'
const KEY_signurl = 'chavy_signurl_csdn'
const KEY_signheader = 'chavy_signheader_csdn'

const signinfo = {}
let VAL_loginurl = chavy.getdata(KEY_loginurl)
let VAL_loginheader = chavy.getdata(KEY_loginheader)
let VAL_signurl = chavy.getdata(KEY_signurl)
let VAL_signheader = chavy.getdata(KEY_signheader)

;(sign = async () => {
  chavy.log(`🔔 ${cookieName}`)
  await loginapp()
  await signapp()
  await getlucky()
  for (let i = 0; i < signinfo.lucky.data.drawTimes; i++) {
    await luckyapp()
  }
  showmsg()
  chavy.done()
})().catch((e) => chavy.log(`❌ ${cookieName} 签到失败: ${e}`), chavy.done())

function loginapp() {
  return new Promise((resolve, reject) => {
    const url = { url: VAL_loginurl, headers: JSON.parse(VAL_loginheader) }
    chavy.get(url, (error, response, data) => {
      try {
        signinfo.loginapp = JSON.parse(data)
        updateSignAppCookies()
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `登录结果: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} loginapp - 登录失败: ${e}`)
        chavy.log(`❌ ${cookieName} loginapp - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function updateSignAppCookies() {
  if (signinfo.loginapp) {
    const signheaderObj = JSON.parse(VAL_signheader)
    signheaderObj['JWT-TOKEN'] = signinfo.loginapp.data.token
    signheaderObj['Cookie'] = signheaderObj['Cookie'].replace(/JWT-TOKEN=[^;]*/, `JWT-TOKEN=${signinfo.loginapp.data.token}`)
    VAL_signheader = JSON.stringify(signheaderObj)
  } else {
    chavy.log(`⚠ ${cookieName} updateSignAppCookies: 请先获取 Cookies`)
  }
}

function signapp() {
  return new Promise((resolve, reject) => {
    const url = { url: VAL_signurl, body: '{}', headers: JSON.parse(VAL_signheader) }
    chavy.post(url, (error, response, data) => {
      try {
        signinfo.signapp = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `签到结果: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} signapp - 签到失败: ${e}`)
        chavy.log(`❌ ${cookieName} signapp - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function getlucky() {
  return new Promise((resolve, reject) => {
    const VAL_getluckyurl = `https://gw.csdn.net/mini-app/v2/lucky_draw/login/sign_info?projectVersion=1.0.0`
    const url = { url: VAL_getluckyurl, headers: JSON.parse(VAL_signheader) }
    delete url.headers['Content-Length']
    url.headers['Connection'] = 'keep-alive'
    url.headers['Accept-Encoding'] = 'gzip, deflate, br'
    url.headers['X-OS'] = 'iOS'
    url.headers['Content-Type'] = 'application/json'
    url.headers['X-App-ID'] = 'CSDN-APP'
    url.headers['Origin'] = 'https://webapp.csdn.net'
    url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 CSDNApp/4.1.5(iOS) AnalysysAgent/Hybrid'
    url.headers['Referer'] = 'https://webapp.csdn.net/'
    url.headers['Host'] = 'gw.csdn.net'
    url.headers['Accept-Language'] = 'zh-cn'
    url.headers['Accept'] = '*/*'

    chavy.get(url, (error, response, data) => {
      try {
        signinfo.lucky = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `获取抽奖次数: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} getlucky - 获取抽奖次数失败: ${e}`)
        chavy.log(`❌ ${cookieName} getlucky - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function luckyapp() {
  return new Promise((resolve, reject) => {
    const VAL_luckyappurl = `https://gw.csdn.net/mini-app/v2/lucky_draw/login/good_luck?projectVersion=1.0.0`
    const url = { url: VAL_luckyappurl, body: '{}', headers: JSON.parse(VAL_signheader) }
    url.headers['Connection'] = 'keep-alive'
    url.headers['Accept-Encoding'] = 'gzip, deflate, br'
    url.headers['X-OS'] = 'iOS'
    url.headers['Content-Type'] = 'application/json'
    url.headers['X-App-ID'] = 'CSDN-APP'
    url.headers['Origin'] = 'https://webapp.csdn.net'
    url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 CSDNApp/4.1.5(iOS) AnalysysAgent/Hybrid'
    url.headers['Referer'] = 'https://webapp.csdn.net/'
    url.headers['Host'] = 'gw.csdn.net'
    url.headers['Accept-Language'] = 'zh-cn'
    url.headers['Accept'] = '*/*'
    chavy.post(url, (error, response, data) => {
      try {
        chavy.log(`❕ ${cookieName} luckyapp - response: ${JSON.stringify(response)}`)
        signinfo.luckylist = signinfo.luckylist ? signinfo.luckylist : []
        signinfo.luckylist.push(JSON.parse(data))
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `抽奖结果: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} luckyapp - 抽奖失败: ${e}`)
        chavy.log(`❌ ${cookieName} luckyapp - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function showmsg() {
  let subTitle = ''
  let detail = ''
  if (signinfo.signapp.code == 200) {
    if (signinfo.signapp.data.isSigned === false) {
      subTitle = `签到结果: 成功`
      detail = `共签: ${signinfo.signapp.data.totalCount}天, 连签: ${signinfo.signapp.data.keepCount}天`
    } else if (signinfo.signapp.data.isSigned === true) {
      subTitle = `签到结果: 重复`
    } else {
      subTitle = `签到结果: 失败`
      detail = `编码: ${signinfo.signapp.code}, 说明: ${signinfo.signapp.msg}`
    }
  } else {
    subTitle = `签到结果: 失败`
    detail = `说明: 详见日志`
  }

  if (signinfo.lucky && signinfo.lucky.data && signinfo.lucky.data.drawTimes && signinfo.lucky.data.drawTimes > 0) {
    subTitle += `; 抽奖次数: ${signinfo.lucky.data.drawTimes}`
    detail += `\n查看抽奖详情\n`
    for (let i = 0; i < signinfo.luckylist.length; i++) {
      const can_draw = signinfo.luckylist[i].data.can_draw
      if (can_draw) detail += `\n抽奖 ${i + 1}: ${signinfo.luckylist[i].data.title}`
      else detail += `\n抽奖 ${i + 1}: ${signinfo.luckylist[i].data.msg}`
    }
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
