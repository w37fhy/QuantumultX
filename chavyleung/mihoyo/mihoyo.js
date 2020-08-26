const cookieName = '米游社'
const signurlKey = 'chavy_signurl_mihoyo'
const signheaderKey = 'chavy_signheader_mihoyo'
const chavy = init()
const signurlVal = chavy.getdata(signurlKey)
const signheaderVal = chavy.getdata(signheaderKey)
const signinfo = []
let bbslist = []

sign()

function sign() {
  const url = { url: `https://api-takumi.mihoyo.com/apihub/api/getGameList`, headers: JSON.parse(signheaderVal) }
  chavy.get(url, (error, response, data) => {
    const result = JSON.parse(data)
    bbslist = result.data.list
    for (bbs of bbslist) signbbs(bbs)
    check()
  })
}

function signbbs(bbs) {
  const url = { url: `https://api-takumi.mihoyo.com/apihub/sapi/signIn?gids=${bbs.id}`, headers: JSON.parse(signheaderVal) }
  chavy.post(url, (error, response, data) => signinfo.push(data))
}

function check(checkms = 0) {
  if (bbslist.length == signinfo.length) {
    showmsg()
  } else {
    if (checkms > 5000) {
      chavy.msg(`${cookieName}`, `签到失败: 超时退出`, ``)
      chavy.done()
    } else {
      setTimeout(() => check(checkms + 100), 100)
    }
  }
}

function showmsg() {
  const totalcnt = bbslist.length
  let signed = 0
  let skiped = 0
  let succnt = 0
  let failcnt = 0
  for (info of signinfo) {
    const i = JSON.parse(info)
    if (i.retcode == 0) (signed += 1), (succnt += 1)
    else if (i.retcode == 1008) (signed += 1), (skiped += 1)
    else failcnt += 1
  }
  let subtitle = totalcnt == signed ? '签到结果: 全部成功' : '签到结果: 部分成功'
  subtitle = 0 == signed ? '签到结果: 全部失败' : subtitle
  const detail = `共签: ${signed}/${totalcnt}, 本次成功: ${succnt}, 失败: ${failcnt}, 重签: ${skiped}`
  chavy.msg(cookieName, subtitle, detail)
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
