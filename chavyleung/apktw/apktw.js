const $ = new Env('ApkTw')
$.VAL_login = $.getdata('chavy_cookie_apktw')

!(async () => {
  $.log('', `🔔 ${$.name}, 开始!`, '')
  await login()
  await getHash()
  await sign()
  await showmsg()
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.msg($.name, $.subt, ''), $.log('', `🔔 ${$.name}, 结束!`, ''), $.done()
  })

// 登录
function login() {
  const url = JSON.parse($.VAL_login)
  return new Promise((resove) => $.post(url, (error, response, data) => resove()))
}

function getHash() {
  return new Promise((resove) => {
    const url = { url: 'https://apk.tw/', headers: {} }
    url.headers['Host'] = 'apk.tw'
    url.headers['Referer'] = 'https://apk.tw/forum.php'
    url.headers['Accept'] = '*/*'
    url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'
    $.get(url, (error, response, data) => {
      try {
        if (error) throw new Error(error)
        if (/\/source\/plugin\/dsu_amupper\/images\/wb\.gif/.test(data)) {
          $.isSigned = true
          $.isSignSuc = true
        } else {
          $.isSigned = false
          const [hash] = /plugin.php\?id=dsu_amupper:pper([^('|")]*)/.exec(data)
          if (hash) {
            $.hash = hash
          } else {
            $.isSignSuc = false
          }
        }
      } catch (e) {
        $.log(`❗️ ${$.name}, 执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, '')
      } finally {
        resove()
      }
    })
  })
}

function sign() {
  if ($.isSigned && !$.hash) return
  return new Promise((resove) => {
    const url = { url: `https://apk.tw/${$.hash}&inajax=1&ajaxtarget=my_amupper`, headers: {} }
    $.log(`❕ ${url.url}!`)
    url.headers['Host'] = 'apk.tw'
    url.headers['Referer'] = 'https://apk.tw/forum.php'
    url.headers['Accept'] = '*/*'
    url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'
    $.get(url, (error, response, data) => {
      try {
        if (error) throw new Error(error)
        if (/\/source\/plugin\/dsu_amupper\/images\/wb\.gif/.test(data)) {
          $.isSignSuc = true
        } else {
          $.isSignSuc = false
        }
      } catch (e) {
        $.isSignSuc = false
        $.log(`❗️ ${$.name}, 执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, '')
      } finally {
        resove()
      }
    })
  })
}

function showmsg() {
  return new Promise((resove) => {
    if ($.isSigned) {
      $.subt = '签到: 重复'
    } else if (!$.isSigned && $.isSignSuc) {
      $.subt = '签到: 成功'
    } else {
      $.subt = '签到: 失败'
    }
    resove()
  })
}

// prettier-ignore
function Env(t){this.name=t,this.logs=[],this.isSurge=(()=>"undefined"!=typeof $httpClient),this.isQuanX=(()=>"undefined"!=typeof $task),this.log=((...t)=>{this.logs=[...this.logs,...t],t?console.log(t.join("\n")):console.log(this.logs.join("\n"))}),this.msg=((t=this.name,s="",i="")=>{this.isSurge()&&$notification.post(t,s,i),this.isQuanX()&&$notify(t,s,i);const e=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t&&e.push(t),s&&e.push(s),i&&e.push(i),console.log(e.join("\n"))}),this.getdata=(t=>this.isSurge()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):void 0),this.setdata=((t,s)=>this.isSurge()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):void 0),this.get=((t,s)=>this.send(t,"GET",s)),this.wait=((t,s=t)=>i=>setTimeout(()=>i(),Math.floor(Math.random()*(s-t+1)+t))),this.post=((t,s)=>this.send(t,"POST",s)),this.send=((t,s,i)=>{if(this.isSurge()){const e="POST"==s?$httpClient.post:$httpClient.get;e(t,(t,s,e)=>{s&&(s.body=e,s.statusCode=s.status),i(t,s,e)})}this.isQuanX()&&(t.method=s,$task.fetch(t).then(t=>{t.status=t.statusCode,i(null,t,t.body)},t=>i(t.error,t,t)))}),this.done=((t={})=>$done(t))}
