<h1 align="center" style="color: #61dafb;">Auth</h1>
<h1 align="center" style="font-size: 80px;color:#61dafb">⛔</h1>

<br>


<p align="center">a pure front-end small permission library</p>

<br>

<p align="center">
    <a href="./readme.md">中文</a> | 
    <span>中文</span>
</p>

<br>



一个通过本库作为底层的react权限实现:  [**fr/auth**](<https://iixianjie.github.io/fr/docs/utils/auth>)



## 安装

```shell
yarn add @lxjx/auth
```



<br>



## 使用

```ts
import create from '@lxjx/auth';

// 1. 通过create创建权限api并使用

const {
    setDeps, // 设置dependency
    getDeps, // 获取dependency
    subscribe, // 订阅dependency变更
    auth, // 验证权限
} = create({
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
            // 验证未通过时，返回提示信息，还可以同时返回对应的操作
            if (!usr) {
                return {
                    label: 'not log',
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



## 完整API

```ts
/* create() */

const auth = create({
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
})；

// 通过promise使用
auth.auth(['login', 'vip'])
	.then(rejects => {});

// 向validator传递额外参数或局部验证器(局部验证器注册后依然需要声明key才会生效)
auth(
    ['key1, key2', ['orKey1', 'orKey2']], 
    { extra: 'someData', validators }, 
    reject => {}
)；
```

















































