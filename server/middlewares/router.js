import Router from 'koa-router';
import config from '../config';
import reply from '../wechat/reply';
import wechatMiddle from '../wechat-lib/middleware';
import {resolve} from 'path';

export const router = app => {
  const router = new Router();
  router.all('/wechat-hear', wechatMiddle(config.wechat, reply));
  router.get('/upload', async (ctx, next) => {
    let mp     = require('../wechat');
    let client = mp.getWechat();
    //vsAK-fS_mtUHc3gXpQIfiaGcOPkCALVsTpcW8t21r-To2PRMOYN7nEaePI9spnT8
    // SPUdKV1a5ZoFbzJU4uh0HZLCNr_-QT-uMbnRr1PmRFI 永久
    // http://mmbiz.qpic.cn/mmbiz_jpg/Uibp67JSGyDfdeEWia5ibT6qZ3dZZEe1RedFoOyXj7gveHn0BFfsae5qMP1xEC2eunNibtibowMACShx60SX3mXZMicw/0?wx_fmt=jpeg
    // 视频
    // const data = await  client.handle('uploadMaterial', 'video', resolve(__dirname, '../../docs/test-files/ice.mp4')); // 临时
    // const data = await  client.handle('uploadMaterial', 'video', resolve(__dirname, '../../docs/test-files/ice.mp4'), {
    //   type: 'video', description: '{"title": "哈哈", "instroduction":"嘿嘿"}'
    // }); // 永久
    // 图片
    // const data = await  client.handle('uploadMaterial', 'image', resolve(__dirname, '../../docs/test-files/bird.jpg')); // 临时
    // const data = await  client.handle('uploadMaterial', 'image', resolve(__dirname, '../../docs/test-files/bird.jpg'), {type: 'image'}); // 永久
    // 图文
    const news = {
      articles: [
        {
          "title": 'SSR 1',
          "thumb_media_id": 'SPUdKV1a5ZoFbzJU4uh0HXq3ZucQx6UTryLNDKLzgCE',
          "author": 'ice',
          "digest": '没有摘要',
          "show_cover_pic": 1,
          "content": '没有内容',
          "content_source_url": 'http://www.baidu.com'
        },
        {
          "title": 'SSR 2',
          "thumb_media_id": 'SPUdKV1a5ZoFbzJU4uh0HXq3ZucQx6UTryLNDKLzgCE',
          "author": 'ice',
          "digest": '没有摘要',
          "show_cover_pic": 0,
          "content": '没有内容',
          "content_source_url": 'http://www.qq.com'
        }
      ]
    };
    const data = await  client.handle('uploadMaterial', 'news', news, {}); // 永久
    console.log(data);
  });
  app
  .use(router.routes())
  .use(router.allowedMethods());
};
