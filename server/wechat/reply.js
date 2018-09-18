const tip = '欢迎来到这里\n' + '点击 <a href="http://coding.imooc.com">一起搞事情</a>';
export default async (ctx, next) => {
  const message = ctx.weixin;
  console.log(message);
  ctx.body = tip;
}
