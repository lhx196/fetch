import FetchRequest from 'common/request';

// 项目基础配置
const isProduct = false;

const config = {
  baseUrl: 'https://b.com/',
  productUrl: 'https://a.com/',
};

const headers = {
  userName: 'afsadfasdfasdfas',
};

export const myServerRequest = new FetchRequest({
  host: isProduct ? config.productUrl : config.baseUrl,
  requestInterception: (defaultConfig: any) => {
    //业务层配置额外参数逻辑
    Object.assign(defaultConfig.headers, headers);
    return defaultConfig;
  },
  responseInterception(res) {
    console.log('---------------相应拦截');
    return res;
  },
  defaultConfig: {
    method: 'POST',
  },
});

//同一域名不同路径的接口可单独封装JS并统一导出
export const textService = (data?: any) => {
  return myServerRequest.request({
    apiPath: '/api/merchant/channel/update/shopChannels',
    defaultConfig: {
      method: 'PUT',
    },
    body: data,
  });
};

//调用
// let data = {
//   a: '123',
//   b: '456',
// };
// textService(data).then(res => console.log(res));
