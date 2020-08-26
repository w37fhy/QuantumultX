// 京东全民开红包（京东app->主页->领券->抢红包(在底部)）
// 已完成功能：
// ①浏览活动
// ②关注频道
// 领取前两个任务完成后的红包
// 领3张券功能,邀请好友未实现

const $hammer = (() => {
  const isRequest = "undefined" != typeof $request,
      isSurge = "undefined" != typeof $httpClient,
      isQuanX = "undefined" != typeof $task;

  const log = (...n) => {
    for (let i in n) console.log(n[i])
  };
  const alert = (title, body = "", subtitle = "", link = "", option) => {
    if (isSurge) return $notification.post(title, subtitle, body, link);
    if (isQuanX) return $notify(title, subtitle, (link && !body ? link : body), option);
    log("==============📣系统通知📣==============");
    log("title:", title, "subtitle:", subtitle, "body:", body, "link:", link);
  };
  const read = key => {
        if (isSurge) return $persistentStore.read(key);
        if (isQuanX) return $prefs.valueForKey(key);
      },
      write = (key, val) => {
        if (isSurge) return $persistentStore.write(key, val);
        if (isQuanX) return $prefs.setValueForKey(key, val);
      };
  const request = (method, params, callback) => {
    /**
     *
     * params(<object>): {url: <string>, headers: <object>, body: <string>} | <url string>
     *
     * callback(
     *      error,
     *      {status: <int>, headers: <object>, body: <string>} | ""
     * )
     *
     */
    let options = {};
    if (typeof params == "string") {
      options.url = params;
    } else {
      options.url = params.url;
      if (typeof params == "object") {
        params.headers && (options.headers = params.headers);
        params.body && (options.body = params.body);
      }
    }
    method = method.toUpperCase();

    const writeRequestErrorLog = function (m, u) {
      return err => {
        log("=== request error -s--");
        log(`${m} ${u}`, err);
        log("=== request error -e--");
      };
    }(method, options.url);

    if (isSurge) {
      const _runner = method == "GET" ? $httpClient.get : $httpClient.post;
      return _runner(options, (error, response, body) => {
        if (error == null || error == "") {
          response.body = body;
          callback("", response);
        } else {
          writeRequestErrorLog(error);
          callback(error, "");
        }
      });
    }
    if (isQuanX) {
      options.method = method;
      $task.fetch(options).then(
          response => {
            response.status = response.statusCode;
            delete response.statusCode;
            callback("", response);
          },
          reason => {
            writeRequestErrorLog(reason.error);
            callback(reason.error, "");
          }
      );
    }
  };
  const done = (value = {}) => {
    if (isQuanX) return isRequest ? $done(value) : null;
    if (isSurge) return isRequest ? $done(value) : $done();
  };
  return {isRequest, isSurge, isQuanX, log, alert, read, write, request, done};
})();

const JD_API_HOST = 'https://api.m.jd.com/api';
//直接用NobyDa的js cookie
const cookie = $hammer.read('CookieJD');
let taskInfo = null;
const name = '全民开红包';
let step = start();
step.next();

function* start() {
  if (!cookie) {
    return $hammer.alert(name, '请先获取cookie\n直接使用NobyDa的京东签到获取');
  }
  yield taskHomePage(); // 初始化任务
  if (taskInfo && taskInfo.length > 0) {
    for (let item of taskInfo) {
      if (item.requireCount === item.alreadyReceivedCount) {
        // innerStatus=4已领取红包，3：任务已完成，红包未领取，2：任务未完成，7,未领取任务
        if (item.innerStatus === 3) {
          yield receiveTaskRedpacket(item.taskType);
        }
      } else {
        if (item.innerStatus === 7) {
          yield startTask(item.taskType);//开始领取任务
          if (item.taskType === 4 || item.taskType === 5) {
            //做浏览任务
            console.log(`开始做浏览任务\n`)
            yield active(item.taskType)
          }
        }
      }
    }
    // yield getTaskDetailForColor();
  }
  $hammer.alert(name);
  // let test = await getTaskDetailForColor();
  // console.log(`---test---${JSON.stringify(test)}`);
}
//获取任务列表
function taskHomePage() {
  const data = {"clientInfo":{}};
  request(arguments.callee.name.toString(), data).then((response) => {
    try {
      if (response.code === 0) {
        taskInfo = response.data.result.taskInfos;
        console.log(`任务初始化完成:${JSON.stringify(response)}`);
        step.next();
      }
    } catch (e) {
      console.log(e);
      console.log('初始化任务异常');
      step.return();
    }
  })
}
//领取任务
function startTask(taskType) {
  // 从taskHomePage返回的数据里面拿taskType
  const data = {"clientInfo":{},"taskType":taskType};
  request(arguments.callee.name.toString(), data).then((response) => {
    try {
      // taskInfo = res.data.result.taskInfos;
      console.log(`领取任务:${JSON.stringify(response)}`);
      step.next();
    } catch (e) {
      console.log(e);
      console.log('初始化任务异常');
    }
  })
}

async function active(taskType) {
  let getTaskDetailForColorRes = await getTaskDetailForColor(taskType);
  console.log(`---具体任务详情---${JSON.stringify(getTaskDetailForColorRes)}`);
  const data = getTaskDetailForColorRes.data.result.advertDetails;
  for (let item of data) {
    if (item.id && item.status == 0) {
      let taskReportForColorRes = await taskReportForColor(taskType, item.id);
      console.log(`完成任务的动作---${JSON.stringify(taskReportForColorRes)}`)
    }
  }
  step.next();
}

//获取具体任务详情
function getTaskDetailForColor(taskType) {
  const data = {"clientInfo":{},"taskType":taskType};
  return new Promise((rs, rj) => {
    request(arguments.callee.name.toString(), data).then((response) =>{
      rs(response);
    })
  })
  // request(arguments.callee.name.toString(), data).then((test) => {
  //   console.log(`---test---${JSON.stringify(test)}`);
  // })
}
//完成任务的动作
function taskReportForColor(taskType, detailId) {
  const data = {"clientInfo":{},"taskType":taskType,"detailId":detailId};
  console.log(`活动id：：：${detailId}\n`)
  return new Promise((rs, rj) => {
    request(arguments.callee.name.toString(), data).then((response) =>{
      rs(response);
    })
  })
  // request(arguments.callee.name.toString(), data).then(res => {
  //   console.log(`完成任务的动作---${res}`)
  //   step.next();
  // })
}
//领取 领3张券任务后的红包
function receiveTaskRedpacket(taskType) {
  const data = {"clientInfo":{},"taskType":taskType};
  // return new Promise((rs, rj) => {
  //   request(arguments.callee.name.toString(), data).then((response) =>{
  //     rs(response);
  //   })
  // })
  request(arguments.callee.name.toString(), data).then((res) => {
    console.log(`领取红包结果：${JSON.stringify(res)}`);
    step.next();
  })
}

function getCcTaskList() {

}
function newReceiveRvcCouponWithTask() {
  const data = {"taskType":"0","extend":"","source":"couponCenter_app","pageClickKey":"CouponCenter","rcType":"1","taskId":"415","childActivityUrl":"","eid":"","shshshfpb":"","lat":"","lng":""};
  request(arguments.callee.name.toString(), data).then((response) => {
    try {
      // taskInfo = res.data.result.taskInfos;
      console.log(`领券结果:${JSON.stringify(response)}`);
      step.next();
    } catch (e) {
      console.log(e);
      console.log('初始化任务异常');
    }
  })
}

async function request(function_id, body = {}) {
  await sleep(2);
  return new Promise((resolve, reject) => {
    $hammer.request('POST', taskurl(function_id, body), (error, response) => {
      if(error){
        $hammer.log("Error:", error);
      }else{
        resolve(JSON.parse(response.body));
      }
    })
  })
}

function sleep(s) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, s * 1000);
  })
}

function taskurl(function_id, body) {
  return {
    url: `${JD_API_HOST}?appid=jd_mp_h5&functionId=${function_id}&loginType=2&client=jd_mp_h5&t=${new Date().getTime()*1000}`,
    body: `body=${JSON.stringify(body)}`,
    headers: {
      "Host": "api.m.jd.com",
      "Content-Type": "application/x-www-form-urlencoded",
      "Origin": "https://happy.m.jd.com",
      "Accept-Encoding": "gzip, deflate, br",
      "Cookie": cookie,
      "Connection": "keep-alive",
      "Accept": "*/*",
      "User-Agent": "jdapp;iPhone;9.0.2;13.5.1;e35caf0a69be42084e3c97eef56c3af7b0262d01;network/wifi;ADID/3B3AD5BC-B5E6-4A08-B32A-030CD805B5DD;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;model/iPhone11,8;addressid/;hasOCPay/0;appBuild/167249;supportBestPay/0;jdSupportDarkMode/0;pv/2.76;apprpd/CouponCenter;ref/NewCouponCenterViewController;psq/0;ads/;psn/e35caf0a69be42084e3c97eef56c3af7b0262d01|28;jdv/0|;adk/;app_device/IOS;pap/JA2015_311210|9.0.2|IOS 13.5.1;Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
      "Referer": "https://happy.m.jd.com/babelDiy/zjyw/3ugedFa7yA6NhxLN5gw2L3PF9sQC/index.html?channel=7&un_area=19_1601_3633_63249&lng=113.3211898256493&lat=23.13961934629229",
      "Content-Length": "36",
      "Accept-Language": "zh-cn"
    }
  }
}