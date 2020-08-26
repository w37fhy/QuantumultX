# 多看阅读

> 代码已同时兼容 Surge & QuanX, 使用同一份签到脚本即可

> QuanX 需要: v1.0.6-build195 及以后版本 (TestFlight)

## 配置 (Surge)

```properties
[MITM]
www.duokan.com

[Script]
http-request ^https:\/\/www\.duokan\.com\/checkin\/v0\/status script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/duokan/duokan.cookie.js, requires-body=true

cron "0 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/duokan/duokan.js
```

## 配置 (QuanX)

```properties
[MITM]
www.duokan.com

[rewrite_local]
# [商店版] QuanX v1.0.6-build194 及更早版本
^https:\/\/www\.duokan\.com\/checkin\/v0\/status url script-request-body duokan.cookie.js

# [TestFlight] QuanX v1.0.6-build195 及以后版本
^https:\/\/www\.duokan\.com\/checkin\/v0\/status url script-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/duokan/duokan.cookie.js

[task_local]
0 0 * * * duokan.js
```

## 说明
1. 先把 `www.duokan.com` 加到 `[MITM]`
2. 再配置重写规则:
   - Surge: 把两条远程脚本放到 `[Script]`
   - QuanX: 把 `duokan.cookie.js` 和 `duokan.js` 传到 `On My iPhone - Quantumult X - Scripts` (传到 iCloud 相同目录也可, 注意要打开 quanx 的 iCloud 开关)
3. 获取 Cookie: `我的` > `签到任务` 等到提示获取 Cookie 成功即可
> 第 1 条脚本是用来获取 cookie 的, 用浏览器访问一次获取 cookie 成功后就可以删掉或注释掉了, 但请确保在`登录成功`后再获取 cookie.

> 第 2 条脚本是签到脚本, 每天 `00:00` 执行一次.

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
     cron "10 0 0 * * *" script-path=xxx.js # 每天 00:00:10 执行一次
     # 如果有，那就两顿:
     cron "20 0 0 * * *" script-path=xxx.js # 每天 00:00:20 执行一次
     # 实在不行，三顿也能接受:
     cron "30 0 0 * * *" script-path=xxx.js # 每天 00:00:30 执行一次

     # 再粗暴点，直接:
     cron "* */60 * * * *" script-path=xxx.js # 每 60 分执行一次
     ```

   - `QuanX`配置:

     ```properties
     [task_local]
     1 0 * * * xxx.js # 每天 00:01 执行一次
     2 0 * * * xxx.js # 每天 00:02 执行一次
     3 0 * * * xxx.js # 每天 00:03 执行一次

     */60 * * * * xxx.js # 每 60 分执行一次
     ```

## 感谢

[@NobyDa](https://github.com/NobyDa)

[@lhie1](https://github.com/lhie1)

[@ConnersHua](https://github.com/ConnersHua)