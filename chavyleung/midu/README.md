# 米读

> 代码已同时兼容 Surge & QuanX, 使用同一份签到脚本即可

> QuanX 需要: v1.0.6-build195 及以后版本 (TestFlight)

> 感谢 [@GideonSenku](https://github.com/GideonSenku) Commit

> 2020.04.29 添加阅读时长
> 2020.04.30 添加签到、掷骰子
> 2002.05.01 添加阅读双签
> 2002.05.01 添加签到双签
> 2020.05.04 使用python生成无限账户签到和阅读JavaScript脚本
## 配置 (Surge)

```properties
[MITM]
apiwz.midukanshu.com

[Script]
http-request ^https:\/\/apiwz\.midukanshu\.com script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/midu/midu.cookie.js, requires-body=true


cron "10 0 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/midu/miduSign.js
cron "*/1 * * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/midu/miduRead.js
```

## 配置 (QuanX)

```properties
[MITM]
apiwz.midukanshu.com

[rewrite_local]

# [商店版] QuanX v1.0.6-build194 及更早版本
^https:\/\/apiwz\.midukanshu\.com url script-request-body midu.cookie.js

# [TestFlight] QuanX v1.0.6-build195 及以后版本
^https:\/\/apiwz\.midukanshu\.com url script-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/midu/midu.cookie.js



[task_local]
*/1 * * * * miduRead.js
0 1 * * * miduSign.js
```

## 说明

0. 越狱用户请关闭越狱状态,否则会视为作弊用户!!!
1. 先把`apiwz.midukanshu.com`加到`[MITM]`
2. 再配置重写规则:
   - Surge: 把两条远程脚本放到`[Script]`
   - QuanX: 把`midu.cookie.js`和`miduRead.js`&`miduSign.js`传到`On My iPhone - Quantumult X - Scripts` (传到 iCloud 相同目录也可, 注意要打开 quanx 的 iCloud 开关)
3. 打开 APP 进入`我的` -> `疯狂摇摇乐`,系统提示: `签到:获取Cookie: 成功`
4. 阅读时长获取Cookie:打开 APP 选取文章阅读， `书城` > `任意文章阅读` 等到提示获取Cookie成功即可
5. 把获取 Cookie 的脚本注释掉
6. 建议将`miduRead.js`脚本`task`执行次数改成每分钟执行以达到阅读时长
7. 若要双签到,切换账号获取账户二的Cookie即可
8. 赞赏:邀请码`A1040276307`,[直达链接](http://html34.qukantoutiao.net/qpr2/bBmQ.html?pid=5eb14518)
9. 无限账户签到请移步:[GideonSenku](https://github.com/GideonSenku/scripts/tree/master/midu),目前支持仅制支持Surge
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
     cron "* */60 * * * *" script-path=xxx.js # 每60分执行一次
     ```

   - `QuanX`配置:

     ```properties
     [task_local]
     1 0 * * * xxx.js # 每天00:01执行一次
     2 0 * * * xxx.js # 每天00:02执行一次
     3 0 * * * xxx.js # 每天00:03执行一次

     */60 * * * * xxx.js # 每60分执行一次
     ```

## 感谢

[@NobyDa](https://github.com/NobyDa)

[@lhie1](https://github.com/lhie1)

[@ConnersHua](https://github.com/ConnersHua)

[@GideonSenku](https://github.com/GideonSenku)
