const $ = new Env('网易云音乐')
$.VAL_session = $.getdata('chavy_cookie_neteasemusic')
$.CFG_retryCnt = ($.getdata('CFG_neteasemusic_retryCnt') || '10') * 1
$.CFG_retryInterval = ($.getdata('CFG_neteasemusic_retryInterval') || '500') * 1

!(async () => {
  $.log('', `🔔 ${$.name}, 开始!`, '')
  init()
  await signweb()
  await signapp()
  await getInfo()
  await showmsg()
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.msg($.name, $.subt, $.desc), $.log('', `🔔 ${$.name}, 结束!`, ''), $.done()
  })

function init() {
  $.isNewCookie = /https:\/\/music.163.com\/weapi\/user\/level/.test($.VAL_session)
  $.Cookie = $.isNewCookie ? JSON.parse($.VAL_session).headers.Cookie : $.VAL_session
}

async function signweb() {
  for (let signIdx = 0; signIdx < $.CFG_retryCnt; signIdx++) {
    await new Promise((resove) => {
      const url = { url: `http://music.163.com/api/point/dailyTask?type=1`, headers: {} }
      url.headers['Cookie'] = $.Cookie
      url.headers['Host'] = 'music.163.com'
      url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15'
      $.get(url, (error, response, data) => {
        try {
          $.isWebSuc = JSON.parse(data).code === -2
          $.log(`[Web] 第 ${signIdx + 1} 次: ${data}`)
        } catch (e) {
          $.isWebSuc = false
          $.log(`❗️ ${$.name}, 执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, '')
        } finally {
          resove()
        }
      })
    })
    await new Promise($.wait($.CFG_retryInterval))
    if ($.isWebSuc) break
  }
}

async function signapp() {
  for (let signIdx = 0; signIdx < $.CFG_retryCnt; signIdx++) {
    await new Promise((resove) => {
      const url = { url: `http://music.163.com/api/point/dailyTask?type=0`, headers: {} }
      url.headers['Cookie'] = $.Cookie
      url.headers['Host'] = 'music.163.com'
      url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1'
      $.get(url, (error, response, data) => {
        try {
          $.isAppSuc = JSON.parse(data).code === -2
          $.log(`[App] 第 ${signIdx + 1} 次: ${data}`)
        } catch (e) {
          $.isAppSuc = false
          $.log(`❗️ ${$.name}, 执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, '')
        } finally {
          resove()
        }
      })
    })
    await new Promise($.wait($.CFG_retryInterval))
    if ($.isAppSuc) break
  }
}

function getInfo() {
  if (!$.isNewCookie) return
  return new Promise((resove) => {
    $.post(JSON.parse($.VAL_session), (error, response, data) => {
      try {
        $.userInfo = JSON.parse(data)
      } catch (e) {
        $.log(`❗️ ${$.name}, 执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, '')
      } finally {
        resove()
      }
    })
  })
}

function showmsg() {
  return new Promise((resove) => {
    $.subt = $.isWebSuc ? 'PC: 成功' : 'PC: 失败'
    $.subt += $.isAppSuc ? ', APP: 成功' : ', APP: 失败'
    if ($.isNewCookie && $.userInfo) {
      $.desc = `等级: ${$.userInfo.data.level}, 听歌: ${$.userInfo.data.nowPlayCount} => ${$.userInfo.data.nextPlayCount} 升级 (首)`
      $.desc = $.userInfo.data.level === 10 ? `等级: ${$.userInfo.data.level}, 你的等级已爆表!` : $.desc
    }
    resove()
  })
}

// prettier-ignore
function Env(t){this.name=t,this.logs=[],this.isSurge=(()=>"undefined"!=typeof $httpClient),this.isQuanX=(()=>"undefined"!=typeof $task),this.log=((...t)=>{this.logs=[...this.logs,...t],t?console.log(t.join("\n")):console.log(this.logs.join("\n"))}),this.msg=((t=this.name,s="",i="")=>{this.isSurge()&&$notification.post(t,s,i),this.isQuanX()&&$notify(t,s,i);const e=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t&&e.push(t),s&&e.push(s),i&&e.push(i),console.log(e.join("\n"))}),this.getdata=(t=>this.isSurge()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):void 0),this.setdata=((t,s)=>this.isSurge()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):void 0),this.get=((t,s)=>this.send(t,"GET",s)),this.wait=((t,s=t)=>i=>setTimeout(()=>i(),Math.floor(Math.random()*(s-t+1)+t))),this.post=((t,s)=>this.send(t,"POST",s)),this.send=((t,s,i)=>{if(this.isSurge()){const e="POST"==s?$httpClient.post:$httpClient.get;e(t,(t,s,e)=>{s&&(s.body=e,s.statusCode=s.status),i(t,s,e)})}this.isQuanX()&&(t.method=s,$task.fetch(t).then(t=>{t.status=t.statusCode,i(null,t,t.body)},t=>i(t.error,t,t)))}),this.done=((t={})=>$done(t))}
