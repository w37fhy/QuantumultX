/**
 *
 * hostname = api.infzm.com
 *  
 * # Surge
 * Rewrite: nfzm = type=http-request,pattern=^http:\/\/api\.infzm\.com\/mobile\/pumpkin_task\/complete?,script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/nfzm/nfzm.cookie.js,debug=true
 * Tasks: nfzm-签到 = type=cron,cronexp=10 0 * * *,script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/nfzm/nfzm.js,wake-system=true
 *
 * # QuanX
 * ^http:\/\/api\.infzm\.com\/mobile\/pumpkin_task\/complete? url script-request-header https://raw.githubusercontent.com/chavyleung/scripts/master/nfzm/nfzm.cookie.js
 * 10 0 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/nfzm/nfzm.js, tag=nfzm-签到
 *
 * # Loon
 * http-response ^http:\/\/api\.infzm\.com\/mobile\/pumpkin_task\/complete? script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/nfzm/nfzm.cookie.js
 * cron "10 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/nfzm/nfzm.js
 * 
 * # 获取方式:点击签到获取
 */

const $ = new Env('南方周末')
$.url = 'senku_nfzm_url'

!(async () => {

  url = $request.url
  if (url&&$.setdata(url, $.url)) {
    $.subt = `获取会话: 成功! (${$.url})`
  } else {
    $.subt = `获取会话: 失败! (${$.url})`
  }
  $.msg($.name, $.subt, $.desc)
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())

// prettier-ignore
function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient}isLoon(){return"undefined"!=typeof $loon}loaddata(){if(!this.isNode)return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch{return{}}}}}writedata(){if(this.isNode){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),h=JSON.stringify(this.data);e?this.fs.writeFileSync(t,h):i?this.fs.writeFileSync(s,h):this.fs.writeFileSync(t,h)}}getdata(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setdata(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status,s(t,e,i))}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:h,body:o}=t;s(null,{status:e,statusCode:i,headers:h,body:o},o)},t=>s(t)):this.isNode()&&(this.got=this.got?this.got:require("got"),this.got(t).then(t=>{const{statusCode:e,statusCode:i,headers:h,body:o}=t;s(null,{status:e,statusCode:i,headers:h,body:o},o)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status,s(t,e,i))});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:h,body:o}=t;s(null,{status:e,statusCode:i,headers:h,body:o},o)},t=>s(t));else if(this.isNode()){this.got=this.got?this.got:require("got");const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:h,body:o}=t;s(null,{status:e,statusCode:i,headers:h,body:o},o)},t=>s(t))}}msg(s=t,e="",i="",h){this.isSurge()||this.isLoon()?$notification.post(s,e,i):this.isQuanX()&&$notify(s,e,i),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.message)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t=null){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}
