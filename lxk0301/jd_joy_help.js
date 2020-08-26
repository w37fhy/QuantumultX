/**
来客有礼宠汪汪强制助力（助力一个好友可以获得30机会，一天上限是3好友，获得积分即90积分）
更新地址：https://raw.githubusercontent.com/lxk0301/scripts/master/jd_joy_help.js
更新时间：2020-08-26
目前提供了122位好友的friendPin供使用。助力成功后，退出小程序重写点击进去。
欢迎大家使用 https://jdjoy.jd.com/pet/getFriends?itemsPerPage=20&currentPage=1 (currentPage=1表示第一页好友，=2表示第二页好友)
提供各自账号列表的friendPin给我
如果想设置固定好友，那下载下来放到本地使用，可以修改friendPin换好友(助力一好友后，更换一次friendPin里面的内容)
感谢github @Zero-S1提供
使用方法：
①设置好相应软件的重写
②从京东APP宠汪汪->领狗粮->邀请好友助力，分享给你小号微信或者微信的文件传输助手。 自己再打开刚才的分享，助力成功后，退出小程序重新进去刚才分享的小程序即可

[MITM]
hostname = draw.jdfcloud.com
surge
[Script]
来客有礼宠汪汪强制助力= type=http-request,pattern=(^https:\/\/draw\.jdfcloud\.com\/\/pet\/enterRoom\?reqSource=weapp&invitePin=\w+(&inviteSource=task_invite&shareSource=h5&inviteTimeStamp=\d+&openId=\w+)?|^https:\/\/draw\.jdfcloud\.com\/\/pet\/helpFriend\?friendPin=\w+),requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/lxk0301/scripts/master/jd_joy_help.js

圈x
[rewrite_local]
^https:\/\/draw\.jdfcloud\.com\/\/pet\/enterRoom\?reqSource=weapp&invitePin=.*+(&inviteSource=task_invite&shareSource=\w+&inviteTimeStamp=\d+&openId=\w+)?|^https:\/\/draw\.jdfcloud\.com\/\/pet\/helpFriend\?friendPin url script-request-header https://raw.githubusercontent.com/lxk0301/scripts/master/jd_joy_help.js

 LOON：
[Script]
http-request ^https:\/\/draw\.jdfcloud\.com\/\/pet\/enterRoom\?reqSource=weapp&invitePin=.*+(&inviteSource=task_invite&shareSource=\w+&inviteTimeStamp=\d+&openId=\w+)?|^https:\/\/draw\.jdfcloud\.com\/\/pet\/helpFriend\?friendPin script-path=https://raw.githubusercontent.com/lxk0301/scripts/master/jd_joy_help.js
 , requires-body=true, timeout=10, tag=来客有礼宠汪汪强制助力


下面提供了122位好友的friendPin，程序随机从里面获取一个
你也可从下面链接拿好友的friendPin(复制链接到有京东ck的浏览器打开即可)

https://jdjoy.jd.com/pet/getFriends?itemsPerPage=20&currentPage=1
**/
let url = $request.url
const friendsArr = ["yhr_19820404","13008094886_p","13966269193_p","jd_4e4d9825e5fb1","jd_5ff306cf94512","ququkoko","jd_59a9823f35496","529577509-275616","18923155789_p","jd_455da88071d1e","dreamscometrue5120","蒋周南19620607","jd_620ceca400151","杉雨2011","MARYMY88","13682627696_p","jd_6777ee65f9fcc","夏海东12315","jd_437b4f3fa5d83","zyjyc9998","meoygua","MLHK7288","jd_42d9ce3001acd","jd_57650a30ef6eb","jd_44ca1016e0f96","jd_74332d1d62a97","jd_7dbe4f8a40a7d","jd_4fa238e4e3039","elbereth1122","jd_4d9be23908e41","jd_51f0d43d78900","13588108107_p","123by456","09niuniuma","143798682-947527","jd_560c6f30e6951","jd_54ddb8af5374a","夏革平","247466310","wang2011","chensue","1362245003-624122","wdGefYCBlyOuvz","jd_412f7eb363cd8","18311575050_p","1307976-34738981","wdgOGLtOJjjbnp","klhzdx","jd_5fdcdcb183d7d","jd_5862fd8834680","jd_6cd93e613b0e5","jd_51a64a9da6b94","302990512-553401","jd_4078f69a72873","jd_ewYCRdmukzQH","13348822441_p","hlcx86021","390823571-784974","jd_79af2bc7a56a3","15053231812_p","jd_6f53253d117c5","jd_5bf29dffa62ea","jd_47a1c4ad02103","刘凤苓","145391572-102667","yanglan0409","jd_4b8a70f3b06c3","弑神X","jd_59d962a076126","sjw3000","jd_4d4def8b59787","L1518235423","jd_579b891fbea9b","frank818","hellohuhua","jd_4cf1918577871","jd_akYbyiXqrIDC","李纪红","jd_54a4260ca986c","jd_4cba35cfa8220","13654075776_p","13916051043","jd_6f9b9a6769afb","iamkgbfox","jd_5fbda9be54d5b","jd_76763ba485c5e","jd_45a6b5953b15b","jd_485c757b79422","xiaojingang_0","lanye1545","chenzhiyun2002","lmpbjs1988","jd_SmPxpudoGYOb","jwl19690905","荷舞弄清影88","jd_750d6a9734717","jd_64e37854e713f","jd_573c9832d8989","wdkplHVQlgowTW","wwk232323","jd_6bfe51f915c90","我手机号码","13681610268_p","ss836580793","15868005933_p","zooooo58","陌上花开花又落","jd_701f52f8badbb","jd_462f9229c20e4","jd_42193689987a0","jd_7dc5829121bcc","13656692651_phz","jd_47f49f22f1dc3","handechun959","13775208986_p","guoyizhang","jd_677dd20bf2749","被折叠的记忆33","jd_FfAnqFVEoBul","jd_4e59841cae4f9","jd_5279d593e7803","思绪随风2011","jd_62e335d785872","suyugen","jd_4e68b48d16f7b","jd_56b7a4e092e85","cocoty","jd_7b6d6e7dc98f1","jd_63423cd594e8b","greatyunyun","4349小丢丢","18027486801_p","15207695569_p","llbai11","wdNRUvbJItetlvB","jd_54154982c707f","85192cool","jd_60d497271825b","greatyunyun9320","ky252571504","jd_74e60dbcae365","wdiicnSbYSHWwE","jd_529a0a309d418","jd_7be92b11b7e8f","13486659225_p","jd_iFnquhpWWAzO","jd_6e348ece13e20","jd_6f5b49bb757cb","znz传奇","418001066_m","jd_67ded5748c3ab","361372-27819972","jd_5fafb631c98af","jd_76dd04e844d63","小鹿Jenny","00数字方程式","jd_77a82b603c6c3","勇敢的小泪","jd_4481f68984466","jd_758f5224ee957","mwb1992062_m","15975229552_p","zdj8341","pet_virtual_friend_胡皋三","pet_virtual_friend_绿茶sama","pet_virtual_friend_Ainio","jd_4915949b7bfa1","jd_7ca74ed9224ef","jd_42764f5ea2341","5317123-63418293","jd_40a2d9485cbdb","qazmcl1230","jd_7ced325aba4fd","jd_402fe7425fcaf","95581245-627991","luffy-314_m","jd_BCXgLlmxHdiS","jd_610b3d00928e5","你要醒来","338379384-148135","pet_virtual_friend_乔治桑","jd_54130a3e282ea","jd_6169b3411ed5b","jd_428d930ca56a5","qq6924309","pet_virtual_friend_路遇狗与少年","jd_712bd3bfd55d6","jd_4e97fe5ca4003","tommy_he1","13981372001_p","129867657-673064","jd_525d6e7a57e7c","wdZuirGekSHKmF","jd_75e1da74980ab","jd_RVMXldNSQNOP","jd_5f94da0265e0d","jd_67ab629be7e61","13887490621_p","jd_4e0d529ba3c35","jd_493918e314b50","jd_71a220104187a","jd_vVhhkdUpTkJQ","gary388jingdong","wdjQkAbFobMTyo","cloud_kim","jd_558ed75f52d39","15555448319_p","wdhxZuEvXhhvCf","jd_72b940be8c0f4","congcong炒葱葱","jd_7eb0de64eb25a","13209558123_p"]
function randomFriendPin(m,n) {
  return Math.floor(Math.random()*(m - n) + n);
}
let friendPin = friendsArr[randomFriendPin(0, friendsArr.length - 1)]  //强制为对方助力，有几率自动成为好友 (pin形如jd_xxxxxxxxx的几率大，其他的不会，原因未知)
friendPin = encodeURI(friendPin);
const timestamp = new Date().getTime()
newUrl = url.replace(/friendPin=.*?$/i, "friendPin=" + friendPin).replace(/invitePin=.*?$/i, "invitePin=" + friendPin).replace(/inviteTimeStamp=.*?$/i, "inviteTimeStamp=" + timestamp + "&")
console.log(newUrl)
$done({ url: newUrl })
