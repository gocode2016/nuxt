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
  },
  tag        : {
    create    : base + 'tags/create?',
    fetch     : base + 'tags/get?',
    update    : base + 'tags/update?',
    del       : base + 'tags/delete?',
    fetchUsers: base + 'user/tag/get?',
    batchTag  : base + 'tags/members/batchtagging?',
    batchUnTag: base + 'tags/members/batchuntagging?',
    getTagList: base + 'tags/getidlist?'
  },
  user       : {
    remark           : base + 'user/info/updateremark?',
    info             : base + 'user/info?',
    batchInfo        : base + 'user/info/batchget?',
    fetchUserList    : base + 'user/get?',
    getBlackList     : base + 'tags/members/getblacklist?',
    batchBlackUsers  : base + 'tags/members/batchblacklist?',
    batchUnblackUsers: base + 'tags/members/batchunblacklis?'
  },
  menu       : {
    create      : base + 'menu/create?',
    get         : base + 'menu/get?',
    del         : base + 'menu/delete?',
    addCondition: base + 'menu/addconditional?',
    delCondition: base + 'menu/delconditional?',
    getInfo     : base + 'get_current_selfmenu_info?'
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
    const options   = await this[operation](tokenData.token, ...args);
    // console.log(options, 'optons');
    const data      = await this.request(options);
    // console.log(data);
    return data;
  }

  uploadMaterial(token, type, material, permanent) {
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
      if (type !== 'news') {
        form.access_token = token;
      }
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

  /**
   * 获取素材
   * @param token
   * @param mediaId
   * @param type
   * @param permanent 永久
   */
  fetchMaterial(token, mediaId, type, permanent) {
    let form     = {};
    let fetchUrl = api.temporary.fetch;
    if (permanent) {
      fetchUrl = api.permanent.fetch;
    }
    let url     = fetchUrl + 'access_token=' + token;
    let options = {method: 'POST', url};

    if (permanent) {
      form.media_id     = mediaId;
      form.access_token = token;
      options.body      = form;
    }
    else {
      if (type === 'video') {
        url = url.replace('https://', 'http://');
      }
      url += '&media_id' + mediaId;
    }
    return options;
  }

  deleteMaterial(token, mediaId) {
    const form = {
      media_id: mediaId
    };
    const url  = api.permanent.del + 'access_token=' + token + '&media_id=' + mediaId;
    return {method: 'POST', url, body: form};
  }

  updateMaterial(token, mediaId, news) {
    const form = {
      media_id: mediaId
    };
    _.extend(form, news);
    const url = api.permanent.update + 'access_token=' + token + '&media_id=' + mediaId;
    return {method: 'POST', url, body: form};
  }

  /**
   * 获取计数
   * @param token
   * @returns {{method: string, url: string}}
   */
  countMaterial(token) {
    const url = api.permanent.count + 'access_token=' + token;
    return {method: 'GET', url};
  }

  /**
   * 获取列表
   * @param token
   * @param options
   * @returns {{method: string, url: string, body: *}}
   */
  batchMaterial(token, options) {
    options.type   = options.type || 'image';
    options.offset = options.offset || 0;
    options.count  = options.count || 10;
    const url      = api.permanent.batch + 'access_token=' + token;
    return {method: 'POST', url, body: options};
  }

  /** tag **/
  createTag(token, name) {
    const form = {
      tag: {
        name
      }
    };
    const url  = api.tag.create + 'access_token=' + token;
    return {method: 'POST', url, body: form};
  }

  fetchTags(token) {
    const url = api.tag.fetch + 'access_token=' + token;
    return {url};
  }

  updateTag(token, tagId, name) {
    const form = {
      tag: {
        id: tagId,
        name
      }
    };
    const url  = api.tag.update + 'access_token=' + token;
    return {method: 'POST', url, body: form};
  }

  delTag(token, tagId) {
    const form = {
      tag: {
        id: tagId
      }
    };
    const url  = api.tag.del + 'access_token=' + token;
    return {method: 'POST', url, body: form};
  }

  fetchTagUsers(token, tagId, openId) {
    const form = {
      tagid      : tagId,
      next_openid: openId || ''
    };
    const url  = api.tag.fetchUsers + 'access_token=' + token;
    return {method: 'POST', url, body: form};

  }

  // unTag true|false
  batchTag(token, openIdList, tagId, unTag) {
    const form = {
      openid_list: openIdList,
      tagid      : tagId
    };

    let url = api.tag.batchTag;
    if (unTag) {
      url = api.tag.batchTag;
    }
    url += 'access_token=' + token;
    return {method: 'POST', url, body: form};
  }

  getTagList(token, openId) {
    const form = {
      openid: openId
    };
    const url  = api.tag.getTagList + 'access_token=' + token;
    return {method: 'POST', url, body: form};
  }

  remarkUser(token, openId, remark) {
    const form = {
      openid: openId,
      remark
    };
    const url  = api.user.remark + 'access_token=' + token;
    return {method: 'POST', url, body: form};

  }

  getUserInfo(token, openId, lang) {
    const url = `${api.user.info}access_token=${token}&openid=${openId}&lang=${lang || 'zh_CN'}`;
    return {url};
  }

  batchUserInfo(token, userList) {
    const url  = `${api.user.batchInfo}access_token=${token}`;
    const form = {
      user_list: userList
    };
    return {method: 'POST', url, body: form};

  }

  fetchUserList(token, openId) {
    const url = `${api.user.fetchUserList}access_token=${token}` + (openId
      ? `&next_openid=${openId}`
      : '');
    return {url};

  }

  /** menu **/
  createMenu(token, menu) {
    const url = `${api.menu.create}access_token=${token}`;
    return {method: 'POST', url, body: menu};
  }

  getMenu(token) {
    const url = `${api.menu.get}access_token=${token}`;
    return {url};
  }

  delMenu(token) {
    const url = `${api.menu.del}access_token=${token}`;
    return {url};
  }

  addConditionMenu(token, menu, rule) {
    const url  = `${api.menu.addCondition}access_token=${token}`;
    const form = {
      button   : menu,
      matchrule: rule
    };
    return {method: 'POST', url, body: form};
  }

  delConditionMenu(token, menuId) {
    const url = `${api.menu.delCondition}access_token=${token}`;
    let form  = {
      menuid: menuId
    };
    return {method: 'POST', url, body: form};
  }
}
