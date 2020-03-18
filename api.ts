import FetchRequest from "./request";

// 项目基础配置
const isProduct = false;

const config = {
  baseUrl: "http://b.com/",
  productUrl: "https://a.com/"
};

const headers = {
  token: "afsadfasdfasdfas"
};

export const myServerRequest = new FetchRequest({
  host: isProduct ? config.productUrl : config.baseUrl,
  requestInterception: (defaultConfig: any) => {
    //业务层配置额外参数
    const newConfig = {
      headers
    };

    return Object.assign(defaultConfig, newConfig);
  },
  responseInterception(res) {
    console.log("---------------相应拦截");
    return res;
  },
  defaultConfig: {
    method: "POST"
  }
});

//同一域名不同路径的接口可单独封装并统一导出
export const textService = (data?: any) => {
  return myServerRequest.request({
    apiPath: "/abc/def",
    body: data
  });
};

//调用
// let data = {
//   a: '123',
//   b: '456',
// };
// textService(data).then(res => console.log(res));
