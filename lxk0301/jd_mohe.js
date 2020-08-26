/*
热8超级盲盒，可抽奖获得京豆，建议在凌晨0点时运行脚本，白天抽奖基本没有京东
活动地址: https://blindbox.jd.com
活动时间到18号
支持京东双账号
更新时间：2020-08-17
脚本兼容: QuantumultX, Surge,Loon, JSBox, Node.js
// quantumultx
[task_local]
#热8超级盲盒
1 0,1-23/3 * * * https://raw.githubusercontent.com/lxk0301/scripts/master/jd_mohe.js, tag=热8超级盲盒, enabled=true
// Loon
[Script]
cron "1 0,1-23/3 * * *" script-path=https://raw.githubusercontent.com/lxk0301/scripts/master/jd_mohe.js,tag=热8超级盲盒
// Surge
热8超级盲盒 = type=cron,cronexp=1 0,1-23/3 * * *,wake-system=1,timeout=20,script-path=https://raw.githubusercontent.com/lxk0301/scripts/master/jd_mohe.js
 */
const $ = new Env('热8超级盲盒');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';

//直接用NobyDa的jd cookie
let cookie = jdCookieNode.CookieJD ? jdCookieNode.CookieJD : $.getdata('CookieJD');
const cookie2 = jdCookieNode.CookieJD2 ? jdCookieNode.CookieJD2 : $.getdata('CookieJD2');
let UserName = '';
const JD_API_HOST = 'https://blindbox.jd.com';
let shareId = '';
!(async () => {
  if (!cookie) {
    $.msg('【京东账号一】热8超级盲盒', '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
  } else {
    UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1]);
    // await shareUrl();
    // await addShare();
    await getCoin();//领取每三小时自动生产的热力值
    await Promise.all([
      task0(),
      task1(),
    ])
    await taskList();
    await getAward();//抽奖
    if ($.time('yyyy-MM-dd') === '2020-08-19') {
      $.msg($.name, '活动已结束', `请禁用或删除脚本\n如果帮助到您可以点下🌟STAR鼓励我一下,谢谢\n咱江湖再见\nhttps://github.com/lxk0301/scripts\n`, {"open-url": "https://github.com/lxk0301/scripts"});
    } else {
      $.msg($.name, '', `【京东账号一】${UserName}\n任务已做完.\n 抽奖详情查看 https://blindbox.jd.com\n`, {"open-url": "https://blindbox.jd.com"});
    }
  }
  await $.wait(1000);
  if (cookie2) {
    cookie = cookie2;
    UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1]);
    console.log(`\n开始【京东账号二】${UserName}\n`)
    await getCoin();//领取每三小时自动生产的热力值
    await Promise.all([
      task0(),
      task1(),
    ])
    await taskList();
    await getAward();//抽奖
    $.msg($.name, '', `【京东账号二】${UserName}\n任务已做完.\n 抽奖详情查看 https://blindbox.jd.com\n`, {"open-url": "https://blindbox.jd.com"});
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })


async function task0() {
  const confRes = await conf();
  if (confRes.code === 200) {
    const { brandList, skuList } = confRes.data;
    if (skuList && skuList.length > 0) {
      for (let item of skuList) {
        if (item.state === 0) {
          let homeGoBrowseRes = await homeGoBrowse(0, item.id);
          console.log('商品', homeGoBrowseRes);
          await $.wait(1000);
          const taskHomeCoin0Res = await taskHomeCoin(0, item.id);
          console.log('商品领取金币', taskHomeCoin0Res);
          // if (homeGoBrowseRes.code === 200) {
          //   await $.wait(1000);
          //   await taskHomeCoin(0, item.id);
          // }
        } else {
          console.log('精选好物任务已完成')
        }
      }
    }
  }
}
async function task1() {
  const confRes = await conf();
  if (confRes.code === 200) {
    const { brandList, skuList } = confRes.data;
    if (brandList && brandList.length > 0) {
      for (let item of brandList) {
        if (item.state === 0) {
          let homeGoBrowseRes = await homeGoBrowse(1, item.id);
          // console.log('店铺', homeGoBrowseRes);
          await $.wait(1000);
          const taskHomeCoin1Res = await taskHomeCoin(1, item.id);
          console.log('店铺领取金币', taskHomeCoin1Res);
          // if (homeGoBrowseRes.code === 200) {
          //   await $.wait(1000);
          //   await taskHomeCoin(1, item.id);
          // }
        } else {
          console.log('精选店铺-任务已完成')
        }
      }
    }
  }
}
function addShare(id) {
  console.log(`shareId${shareId}`);
  return new Promise((resolve) => {
    const url = `addShare?shareId=${shareId}&t=${Date.now()}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('ddd----ddd', data)
        data = JSON.parse(data);
        // console.log('ddd----ddd', data)

      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function conf() {
  return new Promise((resolve) => {
    const url = `conf`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('ddd----ddd', data)
        data = JSON.parse(data);
        // console.log('ddd----ddd', data)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function homeGoBrowse(type, id) {
  return new Promise((resolve) => {
    const url = `homeGoBrowse?type=${type}&id=${id}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function taskHomeCoin(type, id) {
  return new Promise((resolve) => {
    const url = `taskHomeCoin?type=${type}&id=${id}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function getCoin() {
  return new Promise((resolve) => {
    const url = `getCoin?t=${Date.now()}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
        if (data.code === 1001) {
          console.log(data.msg);
          $.msg($.name, '领取失败', `${data.msg}`);
          $.done();
        } else {
          console.log(`成功领取${data.data}热力值`)
          resolve(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      }
    })
  })
}
function taskList() {
  return new Promise((resolve) => {
    const url = `taskList?t=${Date.now()}`;
    $.get(taskurl(url), async (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        console.log(`请继续等待,正在做任务,不要退出哦`)
        // console.log(`成功领取${data.data}热力值`)
        if (data.code === 200) {
          const { task4, task6, task2, task1 } = data.data;
          if (task4.finishNum < task4.totalNum) {
            await browseProduct(task4.skuId);
            await taskCoin(task4.type);
          }
          //浏览会场
          if (task1.finishNum < task1.totalNum) {
            await strollActive((task1.finishNum + 1));
            await taskCoin(task1.type);
          }
          if (task2.finishNum < task2.totalNum) {
            await strollShop(task2.shopId);
            await taskCoin(task2.type);
          }
          if (task6.finishNum < task6.totalNum) {
            await strollMember(task6.venderId);
            await taskCoin(task6.type);
          }
          if (task4.state === 2 && task1.state === 2 && task2.state === 2 && task6.state === 2) {
            console.log('taskList的任务全部做完了---')
          } else {
            await taskList();
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//浏览商品(16个)
function browseProduct(skuId) {
  return new Promise((resolve) => {
    const url = `browseProduct?0=${skuId}&t=${Date.now()}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
        // console.log(`成功领取${data.data}热力值`)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
// 浏览会场(10个)
function strollActive(index) {
  return new Promise((resolve) => {
    const url = `strollActive?0=${index}&t=${Date.now()}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
        // console.log(`成功领取${data.data}热力值`)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//关注或浏览店铺(9个)
function strollShop(shopId) {
  return new Promise((resolve) => {
    const url = `strollShop?shopId=${shopId}&t=${Date.now()}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
        // console.log(`成功领取${data.data}热力值`)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
// 加入会员(7)
function strollMember(venderId) {
  return new Promise((resolve) => {
    const url = `strollMember?venderId=${venderId}&t=${Date.now()}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
        // console.log(`成功领取${data.data}热力值`)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}

function taskCoin(type) {
  return new Promise((resolve) => {
    const url = `taskCoin?type=${type}&t=${Date.now()}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
        // console.log(`成功领取${data.data}热力值`)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
async function getAward() {
  const coinRes = await coin();
  if (coinRes.code === 200) {
    const { total, need } = coinRes.data;
    if (total > need) {
      const times = Math.floor(total / need);
      for (let i = 0; i < times; i++) {
        await $.wait(2000);
        let lotteryRes = await lottery();
        if (lotteryRes.code === 200) {
          console.log(`====抽奖结果====,${JSON.stringify(lotteryRes.data)}`);
          console.log(lotteryRes.data.name);
          console.log(lotteryRes.data.beanNum);
        } else if (lotteryRes.code === 4001) {
          console.log(`抽奖失败,${lotteryRes.msg}`);
          break;
        }
      }
    } else {
      console.log(`目前热力值${total},不够抽奖`)
    }
  }
}
//获取有多少热力值
function coin() {
  return new Promise((resolve) => {
    const url = `coin?t=${Date.now()}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
        // console.log(`成功领取${data.data}热力值`)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//抽奖API
function lottery() {
  return new Promise((resolve) => {
    const options = {
      'url': `${JD_API_HOST}/prize/lottery?t=${Date.now()}`,
      'headers': {
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "content-type": "application/x-www-form-urlencoded",
        "cookie": cookie,
        "referer": "https://blindbox.jd.com/",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1 Edg/84.0.4147.125"
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
        // console.log(`成功领取${data.data}热力值`)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function taskurl(url) {
  return {
    'url': `${JD_API_HOST}/active/${url}`,
    'headers': {
      "accept": "*/*",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
      "content-type": "application/x-www-form-urlencoded",
      "cookie": cookie,
      "referer": "https://blindbox.jd.com/",
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1 Edg/84.0.4147.125"
    }
  }
}
// prettier-ignore
function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}getScript(t){return new Promise(s=>{$.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=s&&s.timeout?s.timeout:o;const[h,a]=i.split("@"),r={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":h,Accept:"*/*"}};$.post(r,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i)}}else e=$.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}time(t){let s={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in s)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?s[e]:("00"+s[e]).substr((""+s[e]).length)));return t}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o)),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}