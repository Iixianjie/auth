<h1 align="center" style="color: #61dafb;">Auth</h1>
<h1 align="center" style="font-size: 80px;color:#61dafb">⛔</h1>

<br>


<p align="center">small and simple javaScript permission library</p>

<br>

<p align="center">
    <a href="./readme.md">en</a> | 
    <span>中文</span>
</p>
<br>

😘 一个通过本库作为底层的react权限实现:  [**M78/auth**](<http://llixianjie.gitee.io/m78/docs/utils/auth>)

<br>

<!-- TOC -->

- [安装](#安装)
- [介绍](#介绍)
- [使用](#使用)
- [API速览](#api速览)
- [中间件](#中间件)

<!-- /TOC -->

<br>

<br>

## 安装

```shell
yarn add @lxjx/auth
```



<br>



## 介绍

`auth`包含以下几个核心概念：

- `dependency` , 也称为`deps`, 权限依赖，一个描述所有权限相关状态的对象。
- `validator` , 权限验证器，接收``dependency` `进行权限验证，在未通过时返回无权限的描述和操作等。
- `auth api` , 一个包含设置`deps`、获取`deps`、订阅`deps`变更、执行验证行为等操作的对象。
- `middleware` , 中间件系统，用来更改初始`deps`，增强api



<br>



通常，为了更方便的使用，会基于此库开发上层验证库，如果你是react用户，可以直接使用 [**M78/auth**](<http://llixianjie.gitee.io/m78/docs/utils/auth>)，如果是其他框架或纯js使用，也可以参考它的api来实现自己的上层库。



<br>



## 使用

```ts
import create from '@lxjx/auth';
import cache from '@lxjx/auth/cacheMiddleware';

// 1. 通过create创建权限api并使用

const {
    setDeps, // 设置dependency
    getDeps, // 获取dependency
    subscribe, // 订阅dependency变更
    auth, // 验证权限
} = create({
    /* 可选行为，将dependency持久化到本地(仅限浏览器) */
    middleware: [cache('my_auth_deps', 86400000/* ms */)],
    /* 被所有验证器依赖数据 */
    dependency: {
        verify: false,
        usr: {
            name: 'lxj',
            audit: true,
            vip: false,
        },
    },
    /* 声明验证器 */
    validators: {
        login({ usr }) {
            // 验证未通过时，返回拒绝信息，还可以同时返回对应的操作
            if (!usr) {
                return {
                    label: 'not log',
                    // 除了label，其他都是非约定的，由自己的验证需求决定
                    desc: 'Please log in first',
                    actions: [
                        {
                            label: '去登陆',
                            handler() { console.log('去登陆') },
                        },
                        {
                            label: '算了',
                            handler() { console.log('算了') },
                        },
                    ],
                };
            }
        },
        vip({ usr }) {
            if (!usr.vip) {
                return {
                    label: 'not vip',
                    desc: 'User is not vip',
                };
            }
        },
    },
});

// 2. 通过auth()进行验证
auth.auth(['login', 'vip'], rejects => {
    // rejects不为null时，说明权限验证未通过
    // 存在值时，rejects为validator返回结果组成的数组
});
```



<br>



## API速览

```ts
/* create() */

const auth = create({
    /** 中间件 */
    middleware?: Middleware[];
    /** 被所有验证器依赖的值组成的对象 */
    dependency?: object,
    /** 待注册的验证器 */
    // * 验证器的签名为 `validator(deps, extra)` 
    // * 接收当前dependency和auth()调用时传入的extra作为参数
    // * 返回值时表示该验证器验证未通过，并会作为rejects的项回传给auth()的回调, 如果你使用typescript，返回值会包含一些约定性的限制
    // * 可以返回Promise来创建异步验证器，正因为如此，验证器也可以声明为async函数
    validators: { [string: any]: Validator };
    /**
    * 如果一个验证未通过，则阻止后续验证
    * * 对于or中的子权限，即使开启了validFirst，依然会对每一项进行验证，但是只会返回第一个
    * * 在执行auth()时将优先级更高的权限key放到前面有助于提高验证反馈的精度, 如 login > vip, 因为vip状态是以登录状态为基础的
    *  */
    validFirst?: boolean;
})

// 更新dependency的值，只更新传入对象中包含的键
auth.setDeps({ name: 'lj', })

// 获取当前dependency
auth.getDeps();

// 订阅dependency变更
const unsub = subscribe(() => {
   // ... 
});

// 取消订阅
unsub();

// 验证权限, 数组项为validators中包含的key, 如果数组项为数组，则表示 `or` 
auth(['key1, key2', ['orKey1', 'orKey2']], reject => {
    // rejects不为null时，说明权限验证未通过
    // 存在值时，rejects为validator返回结果组成的数组
});

// 通过promise使用
auth.auth(['login', 'vip'])
	.then(rejects => {});

// 向validator传递额外参数或局部验证器(局部验证器注册后依然需要声明key才会生效)
auth(
    ['key1, key2', ['orKey1', 'orKey2']], 
    { extra: 'someData', validators },
    reject => {}
);
```

<br/>

<br/>


## 中间件

中间件用于为原有api添加各种补丁功能，也可用于在配置实际生效前对其进行修改。

中间件有两个执行周期：

- 初始化阶段，用于修改传入的默认配置
- 补丁阶段，用于为内置api添加各种增强性补丁



**签名：**

```ts
interface Middleware {
  (bonus: MiddlewareBonusPatch | MiddlewareBonusInit): CreateAuthConfig<any, any> | void;
}

// 初始化阶段参数
export interface MiddlewareBonusInit {
  /** 是否为初始化阶段 */
  init: true;
  /** 当前创建配置(可能已被其他中间件修改过) */
  config: CreateAuthConfig<any, any>;
  /** 在不同中间件中共享的对象 */
  ctx: AnyObject;
}

// 补丁阶段参数
export interface MiddlewareBonusPatch {
  init: false;
  /** 当前的auth api */
  apis: Auth<any, any>;
  /** 为api添加增强补丁 */
  monkey: MonkeyHelper;
  /** 在不同中间件中共享的对象 */
  ctx: AnyObject;
}
```

<br/>

**一个log中间件的例子**

```ts
import { Middleware } from '@lxjx/auth';

const cacheMiddleware: Middleware = bonus => {
    
  /* ##### 初始化阶段 ##### */
  if (bonus.init) {
    const conf = bonus.config;
    console.log('init');
      
    // 初始化时必须返回配置，即使没有对其进行修改， 返回值会作为新的初始deps使用
    return { ...conf, dependency: { ...conf.dependency, additionalDep: 'hello😄'  } }; 
  }
  

  /* ##### 补丁阶段 ##### */
    
  console.log('api created');
    
  // 在执行setDeps打印设置的新deps
  bonus.monkey('setDeps', next => patch => {
    console.log('setDeps', patch);
    next(patch);
  });

  // 获取deps时输出获取行为
  bonus.monkey('getDeps', next => () => {
    console.log('getDeps');
    return next();
  });

}
```













































