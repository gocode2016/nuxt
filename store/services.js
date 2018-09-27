import axios from 'axios';

const baseUrl = '';

export default new class Services {
  getWechatSignature(url) {
    return axios.get(`${baseUrl}/wechat-signature?url=${url}`);
  }

  getUserByOAuth(url) {
    return axios.get(`${baseUrl}/wechat-oauth?url=${url}`);
  }

};
