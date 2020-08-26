/**
 *
 * 进入 叠蛋糕 主页获取 Cookies
 *
 * Surge:
 * Rewrite: JD618 = type=http-request,pattern=^https:\/\/api.m.jd.com\/client.action\?functionId=cakebaker_getHomeData,script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.cookie.js,requires-body=true
 * Tasks: JD618 = type=cron,cronexp="10,30,50 0,1 * * *",script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.js,wake-system=true,timeout=1200
 * Tasks: JD618.Boom = type=cron,cronexp="0 10,12,18,20,21 * * *",script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.boom.js,wake-system=true
 * Tasks: JD618.Boom = type=cron,cronexp="30 21 * * *",script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.boom.js,wake-system=true
 *
 * QuanX:
 * ^https:\/\/api.m.jd.com\/client.action\?functionId=cakebaker_getHomeData url script-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.cookie.js
 *
 * [task_local]
 * # 远程
 * 10,30,50 0,1 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.adapt.js, tag=京东618
 * 0 10,12,18,20,21 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.boom.js, tag=京东618炸弹
 * 30 21 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.boom.js, tag=京东618炸弹
 *
 * Loon:
 * cron "10,30,50 0,1 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.adapt.js, timeout=600, tag=京东618
 * cron "0 10,12,18,20,21 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.boom.js, tag=京东618炸弹
 * cron "30 21 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.boom.js, tag=京东618炸弹
 * http-request ^https:\/\/api.m.jd.com\/client.action\?functionId=cakebaker_getHomeData script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.cookie.js,requires-body=true
 *
 * [MITM]
 * hostname = api.m.jd.com
 */

const $ = new Env('京东618')

!(async () => {
  $.log('', `🔔 ${$.name}, 获取会话: 开始!`, '')
  const VAL_url = $request.url
  const VAL_body = $request.body
  const VAL_headers = JSON.stringify($request.headers)
  if (VAL_url && VAL_body && VAL_headers) {
    $.setdata($request.url, 'chavy_url_jd816')
    $.setdata($request.body, 'chavy_body_jd816')
    $.setdata(JSON.stringify($request.headers), 'chavy_headers_jd816')
    $.subt = '获取会话: 成功!'
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
