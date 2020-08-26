const cookieName = '豆瓣时间'
const signurlKey = 'senku_signurl_dbsj'
const signheaderKey = 'senku_signheader_dbsj'
const signbodyKey = 'senku_signbody_dbsj'
const senku = init()
const signurlVal = senku.getdata(signurlKey)
const signheaderVal = senku.getdata(signheaderKey)

sign()

function sign() {

  const url = { url: signurlVal, headers: JSON.parse(signheaderVal)}
  senku.get(url, (error, response, data) => {
    const result = JSON.parse(data)
    let subTitle = ``
    let detail = ``
    const has_checked = result.today_status.has_checked
    const continuous_check_in_count = result.continuous_check_in_count
    const status = result.auto_check.status
    if (status == "success") {
      subTitle = `签到结果: 成功`
      detail = `连续签到天数${continuous_check_in_count}天`
    } else if (has_checked == 1) {
      const date = result.today_check.created_at
      subTitle = `签到结果: 重复 签到时间${date}`
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
