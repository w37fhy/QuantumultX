# 人人视频

> 代码已同时兼容 Surge & QuanX, 使用同一份签到脚本即可

> 2020.8.24 增加随机观看请求，以获得足够活跃值开金宝箱。增加每周礼包抽奖，若未达到抽奖条件，则尝试使用骰子进行刷新卡片以满足条件直至骰子用完(为了节省骰子，此过程设定为周日进行，测试版)。

> 2020.8.21 删去多余 header，去除版本信息以绕过验证，并修正开宝箱请求体

> 2020.1.11 QuanX 在`190`版本开始, 获取 Cookie 方式需要从`script-response-body`改为`script-request-header`

> 2020.1.31 增加自动领取每日福利 (无需重新获取 Cookie, 直接更新脚本即可!)

> 2020.3.4 (1) 增加每日答题 (无需重新获取 Cookie, 直接更新脚本即可!) (答题是判断哪个选项回答的人数最多来选择的，所以建议把签到时间放在 00:10 以后!)

> 2020.3.4 (2) 增加自动开启宝箱 (60 活跃可开`铜箱`和`银箱`, 100 活跃开`金箱`) ~~(仅靠脚本能自动开`铜箱`和`银箱`, `金箱`需要观看视频达一定分钟数, 平常有看视频的朋友可以把签到时间压后一点, 如: `50 23 * * *` )~~

## 配置 (Surge)

```properties
[MITM]
*.rr.tv

[Script]
http-request ^https:\/\/api\.rr\.tv\/user\/profile script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/rrtv/rrtv.cookie.js
cron "10 0 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/rrtv/rrtv.js
```

## 配置 (QuanX)

```properties
[MITM]
*.rr.tv

[rewrite_local]
# 189及以前版本
^https:\/\/api\.rr\.tv\/user\/profile url script-response-body rrtv.cookie.js
# 190及以后版本
^https:\/\/api\.rr\.tv\/user\/profile url script-request-header rrtv.cookie.js

[task_local]
10 0 * * * rrtv.js
```

## 说明

1. 先把`*.rr.tv`加到`[MITM]`
2. 再配置重写规则:
   - Surge: 把两条远程脚本放到`[Script]`
   - QuanX: 把`rrtv.cookie.js`和`rrtv.js`传到`On My iPhone - Quantumult X - Scripts` (传到 iCloud 相同目录也可, 注意要打开 quanx 的 iCloud 开关)
3. 打开 APP, 访问下`个人中心`
4. 系统提示: `获取Cookie: 成功` （如果不提示获取成功, 尝试杀进程再进个人中心）
5. 最后就可以把第 1 条脚本注释掉了

> 第 1 条脚本是用来获取 cookie 的, 用浏览器访问一次获取 cookie 成功后就可以删掉或注释掉了, 但请确保在`登录成功`后再获取 cookie.

> 第 2 条脚本是签到脚本, 每天`00:00:10`执行一次.

## 常见问题

1. 无法写入 Cookie

   - 检查 Surge 系统通知权限放开了没
   - 如果你用的是 Safari, 请尝试在浏览地址栏`手动输入网址`(不要用复制粘贴)

2. 写入 Cookie 成功, 但签到不成功

   - 看看是不是在登录前就写入 Cookie 了
   - 如果是，请确保在登录成功后，再尝试写入 Cookie

3. 为什么有时成功有时失败

   - 很正常，网络问题，哪怕你是手工签到也可能失败（凌晨签到容易拥堵就容易失败）
   - 暂时不考虑代码级的重试机制，但咱有配置级的（暴力美学）：

   - `Surge`配置:

     ```properties
     # 没有什么是一顿饭解决不了的:
     cron "10 0 0 * * *" script-path=xxx.js # 每天00:00:10执行一次
     # 如果有，那就两顿:
     cron "20 0 0 * * *" script-path=xxx.js # 每天00:00:20执行一次
     # 实在不行，三顿也能接受:
     cron "30 0 0 * * *" script-path=xxx.js # 每天00:00:30执行一次

     # 再粗暴点，直接:
     cron "0 0 * * * *" script-path=xxx.js # 每60分整点执行一次
     ```

   - `QuanX`配置:

     ```properties
     [task_local]
     1 0 * * * xxx.js # 每天00:01执行一次
     2 0 * * * xxx.js # 每天00:02执行一次
     3 0 * * * xxx.js # 每天00:03执行一次

     0 * * * * xxx.js # 每60分整点执行一次
     ```

## 感谢

[@NobyDa](https://github.com/NobyDa)

[@lhie1](https://github.com/lhie1)

[@ConnersHua](https://github.com/ConnersHua)
