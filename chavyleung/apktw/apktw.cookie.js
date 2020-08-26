const $ = new Env('ApkTw')

!(async () => {
  $.log('', `🔔 ${$.name}, 获取会话: 开始!`, '')
  const session = {}
  session.url = $request.url
  session.body = $request.body
  session.headers = $request.headers
  delete session.headers['Content-Length']
  delete session.headers['Cookie']
  $.log('', `url: ${session.url}`, `body: ${session.body}`, `headers: ${JSON.stringify(session.headers)}`)
  if ($.setdata(JSON.stringify(session), 'chavy_cookie_apktw')) {
    $.subt = '获取会话: 成功!'
  } else {
    $.subt = '获取会话: 失败!'
  }
})()
  .catch((e) => {
    $.subt = '获取会话: 失败!'
    $.desc = `原因: ${e}`
    $.log(`❌ ${$.name}, 获取会话: 失败! 原因: ${e}!`)
  })
  .finally(() => {
    $.msg($.name, $.subt, $.desc), $.log('', `🔔 ${$.name}, 获取会话: 结束!`, ''), $.done()
  })

// prettier-ignore
function Env(t){this.name=t,this.logs=[],this.isSurge=(()=>"undefined"!=typeof $httpClient),this.isQuanX=(()=>"undefined"!=typeof $task),this.log=((...t)=>{this.logs=[...this.logs,...t],t?console.log(t.join("\n")):console.log(this.logs.join("\n"))}),this.msg=((t=this.name,s="",i="")=>{this.isSurge()&&$notification.post(t,s,i),this.isQuanX()&&$notify(t,s,i);const e=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t&&e.push(t),s&&e.push(s),i&&e.push(i),console.log(e.join("\n"))}),this.getdata=(t=>this.isSurge()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):void 0),this.setdata=((t,s)=>this.isSurge()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):void 0),this.get=((t,s)=>this.send(t,"GET",s)),this.wait=((t,s=t)=>i=>setTimeout(()=>i(),Math.floor(Math.random()*(s-t+1)+t))),this.post=((t,s)=>this.send(t,"POST",s)),this.send=((t,s,i)=>{if(this.isSurge()){const e="POST"==s?$httpClient.post:$httpClient.get;e(t,(t,s,e)=>{s&&(s.body=e,s.statusCode=s.status),i(t,s,e)})}this.isQuanX()&&(t.method=s,$task.fetch(t).then(t=>{t.status=t.statusCode,i(null,t,t.body)},t=>i(t.error,t,t)))}),this.done=((t={})=>$done(t))}
