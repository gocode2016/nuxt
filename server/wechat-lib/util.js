import xml2js from 'xml2js';
import template from './tpl';
import sha1 from 'sha1';

export function parseXML(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, {trim: true}, (err, content) => {
      if (err) reject(err);
      else resolve(content);
    });
  });
}

export function formatMessage(result) {
  let message = {};
  if (typeof result === 'object') {
    const keys = Object.keys(result);
    for (let i = 0; i < keys.length; i++) {
      let item = result[keys[i]];
      let key  = keys[i];

      if (!(item instanceof Array) || item.length === 0) {
        continue;
      }
      if (item.length === 1) {
        let val = item[0];
        if (typeof val === 'object') {
          message[key] = formatMessage(val);
        }
        else {
          message[key] = (val || '').trim();
        }
      }
      else {
        message[key] = [];
        for (let j = 0; j < item.length; j++) {
          message[key].push(formatMessage(item[j]));
        }
      }
    }
    return message;
  }
}

export function tpl(content, message) {
  console.log(content);
  let type = 'text';
  if (Array.isArray(content)) {
    type = 'news';
  }
  if (!content) {
    content = 'Empty News';

  }
  if (content && content.type) {
    type = content.type;
  }

  let info = Object.assign({}, {
    content,
    createTime  : new Date().getTime(),
    msgType     : type,
    toUserName  : message.FromUserName,
    fromUserName: message.ToUserName
  });
  return template(info);

}

/**
 * 生成随机字符串
 * @returns {string}
 */
function createNonce() {
  return Math.random().toString(36).substr(2, 15);
}

/**
 * 生成时间戳
 * @returns {string}
 */
function createTimestamp() {
  return parseInt(new Date().getTime() / 1000, 0) + '';
}

function raw(args) {
  let keys    = Object.keys(args);
  let str     = '';
  keys        = keys.sort();
  let newArgs = {};
  keys.forEach(key => {
    newArgs[key.toLowerCase()] = args[key];
  });
  for (let k in newArgs) {
    str += '&' + k + '=' + newArgs[k];
  }
  return str.substr(1);
}

function signIt(nonce, ticket, timestamp, url) {
  const ret    = {
    jsapi_ticket: ticket,
    noncestr    : nonce,
    timestamp,
    url
  };
  const string = raw(ret);
  const sha    = sha1(string);
  return sha;
}

export function sign(ticket, url) {
  const nonce     = createNonce();
  const timestamp = createTimestamp();
  console.log(nonce, ticket, timestamp, url)
  const signature = signIt(nonce, ticket, timestamp, url);
  console.log(signature)
  return {
    noncestr: nonce,
    timestamp,
    signature
  };
}
