# Surge
Remove weibo ads
```properties
[Script]
http-response ^https?://(sdk|wb)app\.uve\.weibo\.com(/interface/sdk/sdkad.php|/wbapplua/wbpullad.lua) requires-body=1,script-path=https://raw.githubusercontent.com/yichahucha/surge/master/wb_launch.js
http-response ^https?://m?api\.weibo\.c(n|om)/2/(statuses/(unread|extend|positives/get|(friends|video)(/|_)(mix)?timeline)|stories/(video_stream|home_list)|(groups|fangle)/timeline|profile/statuses|comments/build_comments|photo/recommend_list|service/picfeed|searchall|cardlist|page|!/photos/pic_recommend_status|video/tiny_stream_video_list|photo/info) requires-body=1,max-size=-1,script-path=https://raw.githubusercontent.com/yichahucha/surge/master/wb_ad.js
[MITM]
hostname = api.weibo.cn, mapi.weibo.com, *.uve.weibo.com
```

Display netflix ratings（IMDb、douaban）
```properties
[Script]
http-request ^https?://ios\.prod\.ftl\.netflix\.com/iosui/user/.+path=%5B%22videos%22%2C%\d+%22%2C%22summary%22%5D script-path=https://raw.githubusercontent.com/yichahucha/surge/master/nf_rating.js
http-response ^https?://ios\.prod\.ftl\.netflix\.com/iosui/user/.+path=%5B%22videos%22%2C%\d+%22%2C%22summary%22%5D requires-body=1,script-path=https://raw.githubusercontent.com/yichahucha/surge/master/nf_rating.js
# 单集评分
nf_rating_season.js = type=http-response,pattern=^https?://ios\.prod\.ftl\.netflix\.com/iosui/warmer/.+type=show-ath,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/yichahucha/surge/master/nf_rating_season.js
[MITM]
hostname = ios.prod.ftl.netflix.com
```

Display jd historical price
```properties
# 不生效或失效的检查一下配置有没有这两条复写，删除试试
# ^https?:\/\/api\.m\.jd.com\/client\.action\?functionId=start - reject
# ^https?:\/\/api\.m\.jd.com\/client\.action\?functionId=(start|queryMaterialAdverts) - reject
[Script]
http-response ^https?://api\.m\.jd\.com/client\.action\?functionId=(wareBusiness|serverConfig|basicConfig) requires-body=1,script-path=https://raw.githubusercontent.com/yichahucha/surge/master/jd_price.js
[MITM]
hostname = api.m.jd.com
```

Display taobao historical price
```properties
# 不生效或失效的需要卸载 tb 重装，注意不开脚本进 tb 会失效
[Script]
http-request ^http://.+/amdc/mobileDispatch requires-body=1,script-path=https://raw.githubusercontent.com/yichahucha/surge/master/tb_price.js
http-response ^https?://trade-acs\.m\.taobao\.com/gw/mtop\.taobao\.detail\.getdetail requires-body=1,script-path=https://raw.githubusercontent.com/yichahucha/surge/master/tb_price.js
[MITM]
hostname = trade-acs.m.taobao.com
```

DingDing clock in
```properties
[Script]
cron "0 9,18 * * 1-5" script-path=https://raw.githubusercontent.com/yichahucha/surge/master/clock_in.js
```

# Quan-X

Remove weibo ads
```properties
[rewrite_local]
^https?://(sdk|wb)app\.uve\.weibo\.com(/interface/sdk/sdkad.php|/wbapplua/wbpullad.lua) url script-response-body wb_launch.js
^https?://m?api\.weibo\.c(n|om)/2/(statuses/(unread|extend|positives/get|(friends|video)(/|_)(mix)?timeline)|stories/(video_stream|home_list)|(groups|fangle)/timeline|profile/statuses|comments/build_comments|photo/recommend_list|service/picfeed|searchall|cardlist|page|!/photos/pic_recommend_status|video/tiny_stream_video_list|photo/info) url script-response-body wb_ad.js
[mitm]
hostname = api.weibo.cn, mapi.weibo.com, *.uve.weibo.com
```

Display netflix ratings（IMDb、douaban）
```properties
[rewrite_local]
^https?://ios\.prod\.ftl\.netflix\.com/iosui/user/.+path=%5B%22videos%22%2C%\d+%22%2C%22summary%22%5D url script-request-header nf_rating.js
^https?://ios\.prod\.ftl\.netflix\.com/iosui/user/.+path=%5B%22videos%22%2C%\d+%22%2C%22summary%22%5D url script-response-body nf_rating.js
[mitm]
hostname = ios.prod.ftl.netflix.com
```

Display jd historical price
```properties
[rewrite_local]
^https?://api\.m\.jd\.com/client\.action\?functionId=(wareBusiness|serverConfig|basicConfig) url script-response-body jd_price.js
[mitm]
hostname = api.m.jd.com
```

Display taobao historical price
```properties
# 不生效或失效的需要卸载 tb 重装，注意不开脚本进 tb 会失效
[rewrite_local]
^http://.+/amdc/mobileDispatch url script-request-body tb_price.js
^https?://trade-acs\.m\.taobao\.com/gw/mtop\.taobao\.detail\.getdetail url script-response-body tb_price.js
[mitm]
hostname = trade-acs.m.taobao.com
```

DingDing clock in
```properties
[task_local]
0 9,18 * * 1-5 clock_in.js
```

[Issue Group](https://t.me/joinchat/GNhmPg1pixfpvKyD0h-8YA)
