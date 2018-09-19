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
    // console.log(1111111111111111);
    const data =await  client.handle('uploadMaterial', 'video', resolve(__dirname, '../../ice.mp4'), {
      type: 'video', description: '{"title": "haha", "instroduction": "heihei"}'
    });
    console.log(data);
  });
  app
  .use(router.routes())
  .use(router.allowedMethods());
};
