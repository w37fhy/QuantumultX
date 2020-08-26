# 腾讯视频

> 代码已同时兼容 Surge & QuanX, 使用同一份签到脚本即可

> 2020.2.7 从网页端获取的 Cookie 很稳定!

> 2020.2.17 增加移动端网页版签到 (请仔细阅读移动端网页版的操作说明) (MITM 新增一条、获取 Cookie 脚本新增一条、两脚本需要更新)

> 2020.3.2 \[Beta\] 增加移动端抽奖脚本 (部分用户移动端签到时会提示: 无匹配的签到活动, 那就是移动端签不上了)

> 2020.3.6 移动端每个用户仅可签两周，签到活动结果后，移动端签到不再弹通知

> 2020.3.16 移动端签到活动已结束

## 配置 (Surge)

```properties
[MITM]
*.video.qq.com

[Script]
http-request ^https:\/\/access.video.qq.com\/user\/auth_refresh script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/videoqq/videoqq.cookie.js
cron "10 0 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/videoqq/videoqq.js
```

## 配置 (QuanX)

```properties
[MITM]
*.video.qq.com

[rewrite_local]
^https:\/\/access.video.qq.com\/user\/auth_refresh url script-request-header videoqq.cookie.js

[task_local]
1 0 * * * videoqq.js
```

## 说明 （PC 端）

1. 先把`*.video.qq.com`加到`[MITM]`
2. 再配置重写规则:
   - Surge: 把两条远程脚本放到`[Script]`
   - QuanX: 把`videoqq.cookie.js`和`videoqq.js`传到`On My iPhone - Quantumult X - Scripts` (传到 iCloud 相同目录也可, 注意要打开 quanx 的 iCloud 开关)
3. 获取 Cookie:
   - 手机浏览器访问: https://film.qq.com/
   - 随便选 1 部电影观看
4. 系统提示: `获取Cookie: 成功` （如果不提示获取成功, 点自己头像退出登录, 重新登录下应该就能获取）
5. 最后就可以把第 1 条脚本注释掉了

> 第 1 条脚本是用来获取 cookie 的, 用浏览器访问一次获取 cookie 成功后就可以删掉或注释掉了, 但请确保在`登录成功`后再获取 cookie.

> 第 2 条脚本是签到脚本, 每天`00:00:10`执行一次.

## 说明 （移动端网页版）

1. 先把`v.qq.com`加到`[MITM]`
2. 手机浏览器访问下: https://film.qq.com/ 随便选 1 部电影观看
3. 手机浏览器访问下: http://v.qq.com/x/bu/mobile_checkin 页面提示提示`签到成功`, 系统提示: `获取Cookie: 成功` （为保成功率，请刷新一下页面再获取一次）
4. 运行下签到脚本看是否提示
5. 最后就可以把第 1 条脚本注释掉了

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

[@Liquor030](https://github.com/Liquor030)
