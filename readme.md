<h1 align="center" style="color: #61dafb;">Auth</h1>
<h1 align="center" style="font-size: 80px;color:#61dafb">⛔</h1>

<br>


<p align="center">a pure front-end small permission library</p>

<br>



<p align="center">
    <span>en</span> | 
    <a href="./readme.zh-cn.md">中文</a>
</p>



<br>



a implementation of the underlying react permissions through this library:  [**M78/auth**](<https://iixianjie.github.io/M78/docs/utils/auth>)



## Install

```shell
yarn add @lxjx/auth
```



<br>



## Usage

```ts
import create from '@lxjx/auth';

// 1. create a permission api through create and use the

const {
    setDeps, // set dependency
    getDeps, // get dependency
    subscribe, // subscribe to dependency changes
    auth, // verify permissions
} = create({
    /* data relied on by all validators */
    dependency: {
        verify: false,
        usr: {
            name: 'lxj',
            audit: true,
            vip: false,
        },
    },
    /* declaration validator */
    validators: {
        login({ usr }) {
            // if the verification fails, the prompt message is returned, and the corresponding operation is returned at the same time.
            if (!usr) {
                return {
                    label: 'not log',
                    desc: 'Please log in first',
                    actions: [
                        {
                            label: 'go login',
                            handler() { console.log('go login') },
                        },
                        {
                            label: 'go back',
                            handler() { console.log('go back') },
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

// 2. verify through auth ()
auth.auth(['login', 'vip'], rejects => {
    // if rejects is not null, the permission verification failed
    // when there is a value, rejects is an array of results returned by validator
});
```



<br>



## 完整API

```ts
/* create() */

const auth = create({
    /** an object made up of values that all validators depend on*/
    dependency?: object,
    /** validators to be registered */
    // * the signature of the validator is `validator(deps, extra)` 
    // * receive the extra passed in the current dependency and auth() call as a parameter
    // * the return value indicates that the validator failed the verification and will be passed back to the callback of auth () as an item of rejects. If you use typescript, the return value will contain some prescriptive restrictions.
    // * you can return Promise to create an asynchronous validator, and because of this, the validator can also be declared as an async function
    validators: { [string: any]: Validator };
    /**
    * if one of the validations fails, the subsequent validations are blocked
    * * for sub-permissions in or, even if validFirst, is turned on, each item will still be validated, but only the first will be returned.
    * * puting the higher priority permission key in front of the auth () can help improve the accuracy of verification feedback, such as login > vip, because the vip status is based on login status.
    *  */
    validFirst?: boolean;
})

// upate the value of dependency, updating only the keys contained in the incoming object
auth.setDeps({ name: 'lj', })

// get current dependency
auth.getDeps();

// subscribe to dependency changes
const unsub = subscribe(() => {
   // ... 
});

// unsubscribe
unsub();

// verify permissions. The array entry is the key, contained in validators. If the array entry is an array, it means `or`.
auth(['key1, key2', ['orKey1', 'orKey2']], reject => {
    // if rejects is not null, the permission verification failed
    // when there is a value, rejects is an array of results returned by validator
})；

// use through promise
auth.auth(['login', 'vip'])
	.then(rejects => {});

// pass additional parameters or local validators to validator (after local validators are registered, you still need to declare that key will take effect)
auth(
    ['key1, key2', ['orKey1', 'orKey2']], 
    { extra: 'someData', validators }, 
    reject => {}
)；
```

















































