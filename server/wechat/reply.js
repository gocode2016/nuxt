const tip = '欢迎来到这里\n' + '点击 <a href="http://coding.imooc.com">一起搞事情</a>';
export default async (ctx, next) => {
  const message = ctx.weixin;

  let mp     = require('../wechat');
  let client = mp.getWechat();

  if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') { // 关注
      ctx.body = tip;
    }
    else if (message.Event === 'unsubscribe') { // 取消关注
      console.log('取消关注了！');
    }
    else if (message.Event === 'LOCATION') {
      ctx.body = message.Latitude + ' : ' + message.longitude;
    }
  }
  else if (message.MsgType === 'text') {
    if (message.Content === '1') {
      let userList = [{openid: 'ofrda1BhAJcspF3v3FNNd1IsK-34', lang: 'zh_CN'}];
      const data = await client.handle('getTagList', userList[0].openid);
      console.log(data);
    }
    ctx.body = message.Content;
  }

  else if (message.MsgType === 'image') {
    ctx.body = {
      type   : 'image',
      mediaId: message.MediaId
    };
  }
  else if (message.MsgType === 'vioce') {
    ctx.body = {
      type   : 'vioce',
      mediaId: message.MediaId
    };
  }
  else if (message.MsgType === 'video') {
    ctx.body = {
      title  : message.ThumbMediaId,
      type   : 'vioce',
      mediaId: message.MediaId
    };
  }
  else if (message.MsgType === 'location') {
    ctx.body = message.Location_X + ' : ' + message.Location_Y + message.Label;

  }
  else if (message.MsgType === 'link') {
    ctx.body = [
      {
        title      : message.Title,
        description: message.Description,
        picUrl     : 'http://mmbiz.qpic.cn/mmbiz_jpg/PbgyIib2UibXP2K8cc3mZHByWicsoP2hEffbu7XQ2uT2BicnAmaPvGiahyvA8ZPzs4jbnFnvhXkKKAcfDsKYSI01RpA/0',
        url        : message.Url
      }
    ];

  }
}
