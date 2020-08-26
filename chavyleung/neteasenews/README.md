# 网易新闻

> 代码已同时兼容 Surge & QuanX, 使用同一份签到脚本即可

> 2020.2.4 QuanX v1.0.6-build195 及以后版本可以直接使用 `neteasenews.cookie.js` 自动获取 Cookie

> 2020.2.4 如果是 195 以前的版本, 或者想尝试手动抓包获取参数, 请点[这里](https://github.com/chavyleung/scripts/tree/master/neteasenews/README.old.md)

## 配置 (Surge)

```properties
[MITM]
*.m.163.com

[Script]
http-request ^https:\/\/(.*?)c\.m\.163\.com\/uc\/api\/sign\/v3\/commit script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/neteasenews/neteasenews.cookie.js,requires-body=true
cron "10 0 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/neteasenews/neteasenews.js
```

## 配置 (QuanX)

```properties
[MITM]
*.m.163.com

[rewrite_local]
^https:\/\/(.*?)c\.m\.163\.com\/uc\/api\/sign\/v3\/commit url script-request-body neteasenews.cookie.js

[task_local]
1 0 * * * neteasenews.js
```

## 说明

1. 先把`*.m.163.com`加到`[MITM]`
2. 再配置重写规则:
   - Surge: 把两条远程脚本放到`[Script]`
   - QuanX: 把`neteasenews.cookie.js`和`neteasenews.js`传到`On My iPhone - Quantumult X - Scripts` (传到 iCloud 相同目录也可, 注意要打开 quanx 的 iCloud 开关)
3. 打开 APP 然后手动签到 1 次:
4. 系统提示: `获取Cookie: 成功`, `获取Body: 成功`
5. 最后就可以把第 1 条脚本注释掉了
6. 运行一次脚本, 如果提示重复签到, 那就算成功了!

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
