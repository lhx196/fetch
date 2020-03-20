export type TConfig = {
  mode?: "same-origin" | "no-cors" | "cors" | "navigate"; // 请求的模式
  method?: "GET" | "POST"; // 请求类型，部分后端只能识别大写
  cache?:
    | "default"
    | "no-store"
    | "reload"
    | "no-cache"
    | "force-cache"
    | "only-if-cached"; // 缓存模式
  credentials?: "omit" | "same-origin" | "include"; // 是否应该在来源请求中发送来自其他域的cookie
  responseType?: "json" | "text" | "blob"; // 响应数据类型
  // 请求头
  headers?: {
    Accept?: string; // 期望得到数据格式
    "Content-type"?: string; // 传递参数格式
    [key: string]: any;
  };
  timeout?: number; // 请求超时
  url?: string; // 请求地址
  data?: any; // 请求元数据，转为主体前的数据
  [key: string]: any;
};

/**
 * 数据类型
 */
export const application = {
  json: "application/json", // json格式
  form: "application/x-www-form-urlencoded" // 表单对象格式
};

interface TFetchRequset {
  defaultConfig?: TConfig; // 默认配置
  host?: string; // API地址
  apiPath?: string; // API目录
  body?: any; // 请求主体
  requestInterception?: (config: TConfig) => TConfig; // 请求拦截，可以返回拦截处理的配置
  responseInterception?: (res: any, config: TConfig) => any; // 响应拦截，可以返回拦截处理的结果
}

export default class FetchRequest {
  host = "";
  apiPath = "";
  body = {};
  defaultConfig: TConfig = {
    mode: "cors",
    method: "GET",
    cache: "default",
    credentials: "omit",
    responseType: "json",
    headers: {
      Accept: application.json,
      "Content-type": application.json
    },
    timeout: 10000
  };
  requestInterception = (config?: TConfig) => config;
  responseInterception = (res: any) => res;

  // 编译器若版本不兼容 用下面形式
  // responseInterception(res) {
  //   return res;
  // }
  // requestInterception(config) {
  //   return config;
  // }

  constructor(config?: TFetchRequset) {
    if (config) {
      const { defaultConfig, ...configs } = config;
      //设置额外请求配置,覆盖默认配置 -- 请求头，缓存等
      Object.assign(this.defaultConfig, defaultConfig);
      //设置业务请求配置 --ip地址等
      Object.assign(this, configs);
    }
  }
  request = (configs: TFetchRequset) => {
    let { host, apiPath, body, ...defaultConfig } = configs;

    !host && (host = this.host);
    !apiPath && (apiPath = this.apiPath);
    !body && (body = this.body);

    let url = host + apiPath;

    let requestConfig = this.requestInterception(this.defaultConfig);
    //对于某些特殊接口临时改请求配置 --defaultConfig
    if (JSON.stringify(defaultConfig) !== "{}")
      requestConfig = Object.assign({}, requestConfig, defaultConfig);
    const data = Object.assign({}, requestConfig, {
      body: JSON.stringify(body)
    });

    const { timeout } = data;

    // GET请求拼接url，去除body
    if (data.method == "GET") {
      let paramsArray = [];
      Object.keys(body).forEach(key => paramsArray.push(key + "=" + body[key]));
      console.log(paramsArray);
      if (url.search(/\?/) === -1) {
        url += "?" + paramsArray.join("&");
      } else {
        url += "&" + paramsArray.join("&");
      }
      delete data.body;
    }

    return Promise.race([
      fetch(url, data),
      new Promise((_, reject) => setTimeout(reject, timeout, "请求超时")) // 请求超时
    ])
      .then(response => {
        return (response as Response).json();
      })
      .catch(error => {
        throw error;
      })
      .then(res => {
        res = this.responseInterception(res);
        return new Promise(resolve => {
          resolve(res);
        });
      });
  };
}
