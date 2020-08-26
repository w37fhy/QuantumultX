const $ = new Env('京东618炸弹')
$.VAL_url = $.getdata('chavy_url_jd816')
$.VAL_body = $.getdata('chavy_body_jd816')
$.VAL_headers = $.getdata('chavy_headers_jd816')
$.VAL_boomtimes = $.getdata('CFG_BOOM_times_JD618') || 1
$.VAL_boominterval = $.getdata('CFG_BOOM_interval_JD618') || 100

!(async () => {
  $.log('', `🔔 ${$.name}, 开始!`, '')
  await boom()
  await showmsg()
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.log('', `🔔 ${$.name}, 结束!`, ''), $.done()
  })

async function boom() {
  $.boomacts = []
  $.boomdesc = []
  for (let boomIdx = 0; boomIdx < $.VAL_boomtimes; boomIdx++) {
    const isLastBoom = boomIdx === $.VAL_boomtimes - 1
    $.boomdesc.push(`💣 [${moment('mm:ss')}] 发送第 ${boomIdx + 1} 个炸弹 ${isLastBoom ? '(最后一个)' : ''}`)
    const boomAct = new Promise((resove) => {
      $.post(taskurl('cakebaker_pk_getCakeBomb'), (error, response, data) => {
        try {
          if (error) throw new Error(error)
          const _data = JSON.parse(data)
          const _issuc = _data.code === 0 && _data.data && _data.data.bizCode === 0
          $.boom = { isSuc: _issuc, boomIdx, ..._data.data.result }
          if (isLastBoom) $.boomdesc.push(`❕ [${moment('mm:ss')}] 第 ${boomIdx + 1} 炸: ${$.boom.tip}`)
        } catch (e) {
          $.log(`❗️ ${$.name}, 执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
        } finally {
          resove()
        }
      })
    })
    $.boomacts.push(boomAct)
    if (isLastBoom) await boomAct
    await new Promise($.wait($.VAL_boominterval * 1))
    $.boomdesc.push(`❕ [${moment('mm:ss')}] 等待: ${$.VAL_boominterval} 毫秒!`)
  }
}

function moment(fmt) {
  const now = new Date()
  const o = {
    'M+': now.getMonth() + 1,
    'd+': now.getDate(),
    'h+': now.getHours(),
    'm+': now.getMinutes(),
    's+': now.getSeconds(),
    'q+': Math.floor((now.getMonth() + 3) / 3),
    S: now.getMilliseconds()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (now.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
    }
  }
  return fmt
}

function taskurl(fid, body = '{}') {
  const url = { url: `https://api.m.jd.com/client.action` }
  url.headers = JSON.parse($.VAL_headers)
  url.body = `functionId=${fid}&body=${body}&client=wh5&clientVersion=1.0.0`
  return url
}

async function showmsg() {
  await Promise.all($.boomacts)
  $.subt = `我方: ${$.boom.groupLevel || '❓'}层, 对方: ${$.boom.opponentLevel || 0}层, 炸掉: ${$.boom.destroyLevel || 0}层`
  $.desc = [$.boom.tip || '提示: 无!', '点击查看详情', ...$.boomdesc]
  $.msg(`${$.name} (第 ${$.boom.boomIdx + 1} 炸)`, $.subt, $.desc.join('\n'))
  // return new Promise((resove) => {
  //   resove()
  // })
}

// prettier-ignore
function Env(t){this.name=t,this.logs=[],this.isSurge=(()=>"undefined"!=typeof $httpClient),this.isQuanX=(()=>"undefined"!=typeof $task),this.log=((...t)=>{this.logs=[...this.logs,...t],t?console.log(t.join("\n")):console.log(this.logs.join("\n"))}),this.msg=((t=this.name,s="",i="")=>{this.isSurge()&&$notification.post(t,s,i),this.isQuanX()&&$notify(t,s,i);const e=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t&&e.push(t),s&&e.push(s),i&&e.push(i),console.log(e.join("\n"))}),this.getdata=(t=>this.isSurge()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):void 0),this.setdata=((t,s)=>this.isSurge()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):void 0),this.get=((t,s)=>this.send(t,"GET",s)),this.wait=((t,s=t)=>i=>setTimeout(()=>i(),Math.floor(Math.random()*(s-t+1)+t))),this.post=((t,s)=>this.send(t,"POST",s)),this.send=((t,s,i)=>{if(this.isSurge()){const e="POST"==s?$httpClient.post:$httpClient.get;e(t,(t,s,e)=>{s&&(s.body=e,s.statusCode=s.status),i(t,s,e)})}this.isQuanX()&&(t.method=s,$task.fetch(t).then(t=>{t.status=t.statusCode,i(null,t,t.body)},t=>i(t.error,t,t)))}),this.done=((t={})=>$done(t))}
