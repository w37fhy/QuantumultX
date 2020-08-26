/*
京东摇钱树 ：https://raw.githubusercontent.com/lxk0301/scripts/master/jd_moneyTree.js
更新时间:2020-08-24
京东摇钱树支持京东双账号
注：如果使用Node.js, 需自行安装'crypto-js,got,http-server,tough-cookie'模块. 例: npm install crypto-js http-server tough-cookie got --save
*/
// quantumultx
// [task_local]
// #京东摇钱树
// 3 */2 * * * https://raw.githubusercontent.com/lxk0301/scripts/master/jd_moneyTree.js, tag=京东摇钱树, img-url=https://raw.githubusercontent.com/znz1992/Gallery/master/moneyTree.png, enabled=true
// Loon
// [Script]
// cron "3 */2 * * *" script-path=https://raw.githubusercontent.com/lxk0301/scripts/master/jd_moneyTree.js,tag=京东摇钱树
const $ = new Env('京东摇钱树');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';

//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
} else {
  cookiesArr.push($.getdata('CookieJD'));
  cookiesArr.push($.getdata('CookieJD2'));
}

const Notice = $.getdata('jdMoneyTreeNoticeTimes') * 1 || 2;//设置运行多少次才通知。默认运行两次脚本通知，其他设置请在BoxJs进行设置
let jdNotify = $.getdata('jdMoneyTreeNotify');
const JD_API_HOST = 'https://ms.jr.jd.com/gw/generic/uc/h5/m';
let userInfo = null, taskInfo = [], message = '', subTitle = '', fruitTotal = 0, UserName = '';
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = i + 1;
      console.log(`\n开始【京东账号${$.index}】${UserName}\n`);
      message = '';
      subTitle = '';
      await jd_moneyTree();
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jd_moneyTree() {
  const userRes = await user_info();
  if (!userRes || !userRes.realName) return
  await signEveryDay();
  await dayWork();
  await harvest();
  await sell();
  await myWealth();

  await msgControl();

  console.log(`运行脚本次数和设置的次数是否相等::${($.getdata($.treeMsgTime) * 1) === Notice}`);
  console.log(`box订阅静默运行-是否打开::${jdNotify || jdNotify === 'true'}`);
  console.log(`是否弹窗通知::${(($.getdata($.treeMsgTime) * 1) === Notice) && (!jdNotify || jdNotify === 'false')}`);

  if (!jdNotify || jdNotify === 'false') {
    if (($.getdata($.treeMsgTime) * 1) === Notice) {
      $.msg($.name, subTitle, message);
      $.setdata('0', $.treeMsgTime);
    }
  }
}
function user_info() {
  console.log('初始化摇钱树个人信息');
  const params = {
    "sharePin":"",
    "shareType":1,
    "channelLV":"",
    "source":0,
    "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
  }
  params.riskDeviceParam = JSON.stringify(params.riskDeviceParam);
  // await $.wait(5000); //歇口气儿, 不然会报操作频繁
  return new Promise((resolve, reject) => {
    $.post(taskurl('login', params), async (err, resp, data) => {
      try {
        if (err) {
          console.log("\n摇钱树京东API请求失败 ‼️‼️")
        } else {
          const res = JSON.parse(data);
          if (res && res.resultCode === 0) {
            $.isLogin = true;
            console.log('resultCode为0')
            if (res.resultData.data) {
              userInfo = res.resultData.data;
              // userInfo.realName = null;
              if (userInfo.realName) {
                console.log(`助力码sharePin为：：${userInfo.sharePin}`);
                $.treeMsgTime = userInfo.sharePin;
                if ($.getdata($.treeMsgTime)) {
                  if ($.getdata($.treeMsgTime) >= Notice) {
                    $.setdata('0', $.treeMsgTime);
                  }
                } else {
                  $.setdata('0', $.treeMsgTime);
                }
                subTitle = `【${userInfo.nick}】${userInfo.treeInfo.treeName}`;
                // message += `【我的金果数量】${userInfo.treeInfo.fruit}\n`;
                // message += `【我的金币数量】${userInfo.treeInfo.coin}\n`;
                // message += `【距离${userInfo.treeInfo.level + 1}级摇钱树还差】${userInfo.treeInfo.progressLeft}\n`;
              } else {
                $.msg($.name, `【提示】京东账号${$.index}${UserName}运行失败`, '此账号未实名认证或者未参与过此活动\n①如未参与活动,请先去京东app参加摇钱树活动\n入口：我的->游戏与互动->查看更多\n②如未实名认证,请进行实名认证', {"open-url": "openApp.jdMobile://"});
              }
            }
          } else {
            if (res.resultCode === 3) {
              $.isLogin = false;
              $.msg($.name, `【提示】京东账号${$.index}${UserName}cookie已失效,请重新登录获取`, 'https://bean.m.jd.com/', { "open-url": "https://bean.m.jd.com/" });
              if ($.index === 1) {
                $.setdata('', 'CookieJD');//cookie失效，故清空cookie。
              } else if ($.index === 2){
                $.setdata('', 'CookieJD2');//cookie失效，故清空cookie。
              }
              if ($.isNode() && notify.SCKEY) {
                await notify.sendNotify(`${$.name}cookie已失效`, `京东账号${$.index} ${UserName}\n\n请重新登录获取cookie`);
              }
            }
          }
        }
      } catch (eor) {
        $.msg("摇钱树-初始化个人信息" + eor.name + "‼️", JSON.stringify(eor), eor.message)
      } finally {
        resolve(userInfo)
      }
    })
  })
}

function dayWork() {
  console.log(`开始做任务userInfo了\n`)
  return new Promise(async resolve => {
    const data = {
      "source":0,
      "linkMissionIds":["666","667"],
      "LinkMissionIdValues":[7,7],
      "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
    };
    let response = await request('dayWork', data);
    // console.log(`获取任务的信息:${JSON.stringify(response)}\n`)
    let canTask = [];
    taskInfo = [];
    if (response.resultCode === 0) {
      if (response.resultData.code === '200') {
        response.resultData.data.map((item) => {
          if (item.prizeType === 2) {
            canTask.push(item);
          }
          if (item.workType === 7 && item.prizeType === 0) {
            // missionId.push(item.mid);
            taskInfo.push(item);
          }
          // if (item.workType === 7 && item.prizeType === 0) {
          //   missionId2 = item.mid;
          // }
        })
      }
    }
    console.log(`canTask::${JSON.stringify(canTask)}\n`)
    console.log(`浏览任务列表taskInfo::${JSON.stringify(taskInfo)}\n`)
    for (let item of canTask) {
      if (item.workType === 1) {
        //  签到任务
        // let signRes = await sign();
        // console.log(`签到结果:${JSON.stringify(signRes)}`);
        if (item.workStatus === 0) {
          // const data = {"source":2,"workType":1,"opType":2};
          // let signRes = await request('doWork', data);
          let signRes = await sign();
          console.log(`三餐签到结果:${JSON.stringify(signRes)}`);
        } else if (item.workStatus === 2) {
          console.log(`三餐签到任务已经做过`)
        } else if (item.workStatus === -1) {
          console.log(`三餐签到任务不在时间范围内`)
        }
      } else if (item.workType === 2) {
        // 分享任务
        if (item.workStatus === 0) {
          // share();
          const data = {"source":0,"workType":2,"opType":1};
          //开始分享
          // let shareRes = await request('doWork', data);
          let shareRes = await share(data);
          console.log(`开始分享的动作:${JSON.stringify(shareRes)}`);
          const b = {"source":0,"workType":2,"opType":2};
          // let shareResJL = await request('doWork', b);
          let shareResJL = await share(b);
          console.log(`领取分享后的奖励:${JSON.stringify(shareResJL)}`)
        } else if (item.workStatus === 2) {
          console.log(`分享任务已经做过`)
        }
      }
    }
    for (let task of taskInfo) {
      if (task.mid && task.workStatus === 0) {
        console.log('开始做浏览任务');
        // yield setUserLinkStatus(task.mid);
        let aa = await setUserLinkStatus(task.mid);
        console.log(`aaa${JSON.stringify(aa)}`);
      } else if (task.mid && task.workStatus === 1){
        console.log(`workStatus === 1开始领取浏览后的奖励:mid:${task.mid}`);
        let receiveAwardRes = await receiveAward(task.mid);
        console.log(`领取浏览任务奖励成功：${JSON.stringify(receiveAwardRes)}`)
      } else if (task.mid && task.workStatus === 2) {
        console.log('所有的浏览任务都做完了')
      }
    }
    resolve();
  });
}

function harvest() {
  console.log(`收获的操作:${JSON.stringify(userInfo)}\n`)
  if (!userInfo) return
  const data = {
    "source": 2,
    "sharePin": "",
    "userId": userInfo.userInfo,
    "userToken": userInfo.userToken
  }
  return new Promise((rs, rj) => {
    request('harvest', data).then((harvestRes) => {
      if (harvestRes.resultCode === 0 && harvestRes.resultData.code === '200') {
        console.log('收获金果')
        let data = harvestRes.resultData.data;
        message += `【距离${data.treeInfo.level + 1}级摇钱树还差】${data.treeInfo.progressLeft}\n`;
        fruitTotal = data.treeInfo.fruit;
      }
      rs()
      // gen.next();
    })
  })
  // request('harvest', data).then((harvestRes) => {
  //   if (harvestRes.resultCode === 0 && harvestRes.resultData.code === '200') {
  //     let data = harvestRes.resultData.data;
  //     message += `【距离${data.treeInfo.level + 1}级摇钱树还差】${data.treeInfo.progressLeft}\n`;
  //     fruitTotal = data.treeInfo.fruit;
  //     gen.next();
  //   }
  // })
}
//卖出金果，得到金币
function sell() {
  return new Promise((rs, rj) => {
    const params = {
      "source": 2,
      "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
    }
    params.riskDeviceParam = JSON.stringify(params.riskDeviceParam);//这一步，不可省略，否则提交会报错（和login接口一样）
    console.log(`目前金果数量${fruitTotal}`)
    if (fruitTotal > 380) {
      request('sell', params).then((sellRes) => {
        console.log(`卖出金果结果:${JSON.stringify(sellRes)}\n`)
        rs()
      })
    } else {
      rs()
    }
    // request('sell', params).then(response => {
    //   rs(response);
    // })
  })
  // request('sell', params).then((sellRes) => {
  //   console.log(`卖出金果结果:${JSON.stringify(sellRes)}\n`)
  //   gen.next();
  // })
}
//获取金币和金果数量
function myWealth() {
  return new Promise((resolve) => {
    const params = {
      "source": 2,
      "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
    }
    params.riskDeviceParam = JSON.stringify(params.riskDeviceParam);//这一步，不可省略，否则提交会报错（和login接口一样）
    request('myWealth', params).then(res=> {
      if (res.resultCode === 0 && res.resultData.code === '200') {
        console.log(`金币数量和金果：：${JSON.stringify(res)}`);
        message += `【我的金果数量】${res.resultData.data.gaAmount}\n`;
        message += `【我的金币数量】${res.resultData.data.gcAmount}\n`;
      }
      resolve();
    })
  });
}
function sign() {
  console.log('开始三餐签到')
  const data = {"source":2,"workType":1,"opType":2};
  return new Promise((rs, rj) => {
    request('doWork', data).then(response => {
      rs(response);
    })
  })
}
function signIndex() {
  const params = {
    "source":0,
    "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
  }
  return new Promise((rs, rj) => {
    request('signIndex', params).then(response => {
      rs(response);
    })
  })
}
function signEveryDay() {
  return new Promise(async (resolve) => {
    let signIndexRes = await signIndex();
    if (signIndexRes.resultCode === 0) {
      console.log(`每日签到条件查询:${signIndexRes.resultData.data.canSign === 2 ? '可以签到' : '已经签到过了'}`);
      if (signIndexRes.resultData && signIndexRes.resultData.data.canSign == 2) {
        console.log('准备每日签到')
        let signOneRes = await signOne(signIndexRes.resultData.data.signDay);
        console.log(`第${signIndexRes.resultData.data.signDay}日签到结果:${JSON.stringify(signOneRes)}`);
        if (signIndexRes.resultData.data.signDay === 7) {
          let getSignAwardRes = await getSignAward();
          console.log(`店铺券（49-10）领取结果：${JSON.stringify(getSignAwardRes)}`)
          if (getSignAwardRes.resultCode === 0 && getSignAwardRes.data.code === 0) {
            message += `【7日签到奖励领取】${getSignAwardRes.datamessage}\n`
          }
        }
      }
    }
    resolve()
  })
}
function signOne(signDay) {
  const params = {
    "source":0,
    "signDay": signDay,
    "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
  }
  return new Promise((rs, rj) => {
    request('signOne', params).then(response => {
      rs(response);
    })
  })
}
// 领取七日签到后的奖励(店铺优惠券)
function getSignAward() {
  const params = {
    "source":2,
    "awardType": 2,
    "deviceRiskParam": 1,
    "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
  }
  return new Promise((rs, rj) => {
    request('getSignAward', params).then(response => {
      rs(response);
    })
  })
}
// 浏览任务
async function setUserLinkStatus(missionId) {
  let resultCode = 0, code = 200, index = 0;
  do {
    const params = {
      "missionId": missionId,
      "pushStatus": 1,
      "keyValue": index,
      "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
    }
    let response = await request('setUserLinkStatus', params)
    console.log(`missionId为${missionId}：：第${index + 1}次浏览活动完成: ${JSON.stringify(response)}`);
    resultCode = response.resultCode;
    code = response.resultData.code;
    // if (resultCode === 0) {
    //   let sportRevardResult = await getSportReward();
    //   console.log(`领取遛狗奖励完成: ${JSON.stringify(sportRevardResult)}`);
    // }
    index++;
  } while (index < 7) //不知道结束的条件，目前写死循环7次吧
  console.log('浏览店铺任务结束');
  console.log('开始领取浏览后的奖励');
  let receiveAwardRes = await receiveAward(missionId);
  console.log(`领取浏览任务奖励成功：${JSON.stringify(receiveAwardRes)}`)
  return new Promise((resolve, reject) => {
    resolve(receiveAwardRes);
  })
  // gen.next();
}
// 领取浏览后的奖励
function receiveAward(mid) {
  if (!mid) return
  mid = mid + "";
  const params = {
    "source":0,
    "workType": 7,
    "opType": 2,
    "mid": mid,
    "riskDeviceParam":{"eid":"","dt":"","ma":"","im":"","os":"","osv":"","ip":"","apid":"","ia":"","uu":"","cv":"","nt":"","at":"1","fp":"","token":""}
  }
  return new Promise((rs, rj) => {
    request('doWork', params).then(response => {
      rs(response);
    })
  })
}
function share(data) {
  if (data.opType === 1) {
    console.log(`开始做分享任务\n`)
  } else {
    console.log(`开始做领取分享后的奖励\n`)
  }
  return new Promise((rs, rj) => {
    request('doWork', data).then(response => {
      rs(response);
    })
  })
  // const data = 'reqData={"source":0,"workType":2,"opType":1}';
  // request('doWork', data).then(res => {
  //   console.log(`分享111:${JSON.stringify(res)}`)
  //   setTimeout(() => {
  //     const data2 = 'reqData={"source":0,"workType":2,"opType":2}';
  //     request('doWork', data2).then(res => {
  //       console.log(`分享222:${JSON.stringify(res)}`)
  //     })
  //   }, 2000)
  // })
  // await sleep(3);
}
function msgControl() {
  return new Promise((resolve) => {
    let time = $.getdata($.treeMsgTime) * 1;
    time ++;
    $.setdata(`${time}`, $.treeMsgTime);
    resolve();
  })
}

async function request(function_id, body = {}) {
  await $.wait(1000); //歇口气儿, 不然会报操作频繁
  return new Promise((resolve, reject) => {
    $.post(taskurl(function_id,body), (err, resp, data) => {
      try {
        if (err) {
          console.log("\n摇钱树京东API请求失败 ‼️‼️")
        } else {
          data = JSON.parse(data);
        }
      } catch (eor) {
        $.msg("摇钱树-初始化个人信息" + eor.name + "‼️", JSON.stringify(eor), eor.message)
      } finally {
        resolve(data)
      }
      // if (err) {
      //   console.log("=== request error -s--");
      //   console.log("=== request error -e--");
      // } else {
      //   try {
      //     data = JSON.parse(data);
      //   } catch (e) {
      //     console.log(e)
      //   } finally {
      //     resolve(data)
      //   }
      // }
    })
  })
}

function taskurl(function_id, body) {
  return {
    url: JD_API_HOST + '/' + function_id + '?_=' + new Date().getTime()*1000,
    body: `reqData=${function_id === 'harvest' || function_id === 'login' || function_id === 'signIndex' || function_id === 'signOne' || function_id === 'setUserLinkStatus' || function_id === 'dayWork' || function_id === 'getSignAward' || function_id === 'sell' ? encodeURIComponent(JSON.stringify(body)) : JSON.stringify(body)}`,
    headers: {
      'Accept' : `application/json`,
      'Origin' : `https://uua.jr.jd.com`,
      'Accept-Encoding' : `gzip, deflate, br`,
      'Cookie' : cookie,
      'Content-Type' : `application/x-www-form-urlencoded;charset=UTF-8`,
      'Host' : `ms.jr.jd.com`,
      'Connection' : `keep-alive`,
      'User-Agent' : `jdapp;iPhone;9.0.0;13.4.1;e35caf0a69be42084e3c97eef56c3af7b0262d01;network/4g;ADID/F75E8AED-CB48-4EAC-A213-E8CE4018F214;supportApplePay/3;hasUPPay/0;pushNoticeIsOpen/1;model/iPhone11,8;addressid/2005183373;hasOCPay/0;appBuild/167237;supportBestPay/0;jdSupportDarkMode/0;pv/1287.19;apprpd/MyJD_GameMain;ref/https%3A%2F%2Fuua.jr.jd.com%2Fuc-fe-wxgrowing%2Fmoneytree%2Findex%2F%3Fchannel%3Dyxhd%26lng%3D113.325843%26lat%3D23.204628%26sid%3D2d98e88cf7d182f60d533476c2ce777w%26un_area%3D19_1601_50258_51885;psq/1;ads/;psn/e35caf0a69be42084e3c97eef56c3af7b0262d01|3485;jdv/0|kong|t_1000170135|tuiguang|notset|1593059927172|1593059927;adk/;app_device/IOS;pap/JA2015_311210|9.0.0|IOS 13.4.1;Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
      'Referer' : `https://uua.jr.jd.com/uc-fe-wxgrowing/moneytree/index/?channel=yxhd&lng=113.325896&lat=23.204600&sid=2d98e88cf7d182f60d533476c2ce777w&un_area=19_1601_50258_51885`,
      'Accept-Language' : `zh-cn`
    }
  }
}
// prettier-ignore
function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}getScript(t){return new Promise(s=>{$.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=s&&s.timeout?s.timeout:o;const[h,a]=i.split("@"),r={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":h,Accept:"*/*"}};$.post(r,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i)}}else e=$.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}time(t){let s={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in s)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?s[e]:("00"+s[e]).substr((""+s[e]).length)));return t}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o)),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}