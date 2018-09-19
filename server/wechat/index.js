import mongoose from 'mongoose';
import config from '../config';
import Wechat from '../wechat-lib';

const Token = mongoose.model('Token');

const wechatConfig = {
  wechat: Object.assign({
    getAccessToken : async () => await Token.getAccessToken(),
    saveAccessToken: async (data) => await Token.saveAccessToken(data)
  }, config.wechat)
};

export const getWechat = () => {
  const wechatClient = new Wechat(wechatConfig.wechat);
  return wechatClient;
};
