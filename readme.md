<h1 align="center" style="color: #61dafb;">Auth</h1>
<h1 align="center" style="font-size: 80px;color:#61dafb">⛔</h1>

<br>


<p align="center">small and simple javaScript permission library</p>

<br>



<p align="center">
    <span>en</span> | 
    <a href="./readme.zh-cn.md">中文</a>
</p>


<br>



😘 a implementation of the underlying react permissions through this library:  [**M78/auth**](<http://llixianjie.gitee.io/m78/docs/utils/auth>)



<br>




<!-- TOC -->

- [Install](#install)
- [Introduction](#introduction)
- [Usage](#usage)
- [Overview](#overview)
- [Middleware](#middleware)

<!-- /TOC -->



<br>

<br>




## Install

```shell
yarn add @lxjx/auth
```



<br>

## Introduction

`auth` contains the following core concepts：

- `dependency`, also known as `deps`, permission dependency, an object describing all permission related states.
- `validator`, permission validator, receives ``dependency` `for permission verification, and returns description and operation without permission if it fails.
- `auth api`, an object that contains operations such as setting `deps`, obtaining `deps`, subscribing to `deps` changes, and performing verification actions.
- `middleware`, middleware system, used to change the initial `deps` and enhance the api



<br>



Usually, for more convenient use, the upper-level authentication library will be developed based on this library. If you are a react user, you can directly use [**M78/auth**](<http://llixianjie.gitee.io/m78/docs /utils/auth>), if it is used by other frameworks or pure js, you can also refer to its api to implement your own upper library.



<br>

## Usage

```ts
import create from '@lxjx/auth';
import cache from '@lxjx/auth/cacheMiddleware';

// 1. create a permission api through create and use the

const {
    setDeps, // set dependency
    getDeps, // get dependency
    subscribe, // subscribe to dependency changes
    auth, // verify permissions
} = create({
    /* optional behavior, persist the dependency locally (browser only)*/
    middleware: [cache('my_auth_deps', 86400000/* ms */)],
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
                    // except for label, everything else is non-contracted and determined by your own verification requirements
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



## Overview

```ts
/* create() */

const auth = create({
    /** middlewares */
    middleware?: Middleware[];
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
});

// use through promise
auth.auth(['login', 'vip'])
	.then(rejects => {});

// pass additional parameters or local validators to validator (after local validators are registered, you still need to declare that key will take effect)
auth(
    ['key1, key2', ['orKey1', 'orKey2']], 
    { extra: 'someData', validators }, 
    reject => {}
);
```

<br/>

<br/>

## Middleware

Middleware is used to add various patches to the original api, and it can also be used to modify the configuration before it actually takes effect.

Middleware has two execution cycles:

- Initialization phase, which is used to modify the default configuration passed in
- Patch phase, which is used to add various enhanced patches to the built-in api



**signature：**

```ts
interface Middleware {
  (bonus: MiddlewareBonusPatch | MiddlewareBonusInit): CreateAuthConfig<any, any> | void;
}

// Initialization phase parameters
export interface MiddlewareBonusInit {
  /** Whether it is the initialization phase */
  init: true;
  /** Currently create configuration (may have been modified by other middleware) */
  config: CreateAuthConfig<any, any>;
  /** Objects shared in different middleware */
  ctx: AnyObject;
}

// Patch phase parameters
export interface MiddlewareBonusPatch {
  init: false;
  /** The current auth api */
  apis: Auth<any, any>;
  /** Add enhanced patches for api */
  monkey: MonkeyHelper;
  /** Objects shared in different middleware */
  ctx: AnyObject;
}
```

<br/>

**a log middleware example**

```ts
import { Middleware } from '@lxjx/auth';

const cacheMiddleware: Middleware = bonus => {
    
  /* ##### Initialization ##### */
  if (bonus.init) {
    const conf = bonus.config;
    console.log('init');
      
    // The configuration must be returned during initialization, even if it is not modified, the return value will be used as the new initial deps
    return { ...conf, dependency: { ...conf.dependency, additionalDep: 'hello😄'  } }; 
  }
  
  /* ##### Patch ##### */
    
  console.log('api created');

  // The new deps set in the execution of setDeps printing
  bonus.monkey('setDeps', next => patch => {
    console.log('setDeps', patch);
    next(patch);
  });

  // Output fetching behavior when fetching deps
  bonus.monkey('getDeps', next => () => {
    console.log('getDeps');
    return next();
  });

}
```















































