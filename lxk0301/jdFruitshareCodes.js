/*
此文件为Node.js专用。其他用户请忽略
支持京东N个账号
 */
//此处填写京东东农场的好友码。注：github action用户ck填写到Settings-Secrets里面
let FruitShareCodes = [
  '0a74407df5df4fa99672a037eec61f7e@dbb21614667246fabcfd9685b6f448f3',//账号一的好友shareCode,不同好友中间用@符号隔开
  '6fbd26cc27ac44d6a7fed34092453f77@61ff5c624949454aa88561f2cd721bf6',//账号二的好友shareCode，不同好友中间用@符号隔开
]
// 判断github action里面是否有京东ck
if (process.env.FruitShareCodes && process.env.FruitShareCodes.split('&') && process.env.FruitShareCodes.split('&').length > 0) {
  FruitShareCodes = process.env.FruitShareCodes.split('&');
}
for (let i = 0; i < FruitShareCodes.length; i++) {
  const index = (i + 1 === 1) ? '' : (i + 1);
  exports['FruitShareCode' + index] = FruitShareCodes[i];
}