import request from 'request-promise';
import formstream from 'formstream';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';

const base = 'https://api.weixin.qq.com/cgi-bin/';
const api  = {
  accessToken: base + 'token?grant_type=client_credential',
  temporary  : {
    upload: base + 'media/upload?',
    fetch : base + 'media/get?'
  },
  permanent  : { // 永久素材
    upload       : base + 'material/add_material?',
    uploadNews   : base + 'material/add_news?',
    uploadNewsPic: base + 'medial/uploadimg?',
    fetch        : base + 'material/get_material?',
    del          : base + 'material/del_material?',
    update       : base + 'material/update_material?',
    count        : base + 'material/get_meterialcount?',
    batch        : base + 'material/batchget_material?'
  }
};

function statFile(filepath) {
  return new Promise((resolve, reject) => {
    fs.stat(filepath, (err, stat) => {
      if (err) reject(err);
      else resolve(stat);
    });
  });
}

export default class Wechat {
  constructor(opts) {
    this.opts = Object.assign({}, opts);

    this.appID           = opts.appID;
    this.appSecret       = opts.appSecret;
    this.getAccessToken  = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    this.fetchAccessToken();
  }

  async request(options) {
    options = Object.assign({}, options, {json: true});
    try {
      const response = await request(options);
      console.log(response);
      console.log('success ---------');
      return response;
    } catch (error) {
      console.log('error ---------');
      console.error(error);
    }
  }

  async fetchAccessToken() {
    let data = await this.getAccessToken();
    if (!this.isValidAccessToken(data)) {
      data = await this.updateAccessToken();
    }
    await this.saveAccessToken(data);
    return data;
  }

  async updateAccessToken() {
    const url       = api.accessToken + '&appid=' + this.appID + '&secret=' + this.appSecret;
    const data      = await this.request({url});
    const now       = (new Date().getTime());
    const expiresIn = now + (data.expires_in - 20) * 1000;
    data.expires_in = expiresIn;
    return data;
  }

  isValidAccessToken(data) {
    if (!data || !data.access_token || !data.expires_in) {
      return false;
    }
    const expiresIn = data.expires_in;
    const now       = (new Date().getTime());
    if (now < expiresIn) {
      return true;
    }
    else {
      return false;
    }
  }

  async handle(operation, ...args) {
    // console.log(operation);
    // console.log(operation === 'uploadMaterial');
    const tokenData = await this.fetchAccessToken();
    // console.log(tokenData, 'tokenData');
    const options = await this[operation](tokenData.token, ...args);
    // console.log(options, 'optons');
    const data = await this.request(options);
    // console.log(data);
    return data;
  }

  async uploadMaterial(token, type, material, permanent) {
    console.log(token, type, material, permanent);
    let form = {};
    let url  = api.temporary.upload;
    if (permanent) {
      url = api.permanent.upload;
      _.extend(form, permanent);
    }
    if (type === 'pic') {
      url = api.permanent.uploadNewsPic;
    }
    if (type === 'news') {
      url  = api.permanent.uploadNews;
      form = material;
    }
    else {
      // form       = formstream();
      form.media = fs.createReadStream(material);
      // console.log(form, 'else');
      // const stat = await statFile(material);
      // console.log(stat, 'else');
      // // form.file('media', material, path.basename(material), stat.size);
      // console.log(form, 'else');
    }
    let uploadUrl = url + 'access_token=' + token;
    if (!permanent) {
      uploadUrl += '&type=' + type;
    }
    else {
      form.access_token = token;
      // form.field('access_token', token);
    }

    const options = {
      method: 'POST',
      url   : uploadUrl,
      json  : true
    };

    if (type === 'news') {
      options.body = form;
    }
    else {
      options.formData = form;
    }
    // console.log(options, 'uploadMaterial- options');
    return options;
  }
}
