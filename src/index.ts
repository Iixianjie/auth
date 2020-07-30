import create from './create';

const res = create({
  dependency: {
    userInfo: {
      name: 'lxj',
      age: 17,
      isVip: false,
    },
  },
  validators: {
    login({ userInfo }) {
      console.log(userInfo)
      if (!userInfo) {
        return {
          label: '未登录',
          desc: '请前往登录',
        };
      }
    },
    vip({ userInfo }) {
      if (userInfo && !userInfo.isVip) {
        return {
          label: '不是vip',
          desc: '快去开通吧!',
        };
      }
    },
    notMinor({ userInfo }) {
      if (userInfo && userInfo.age < 18) {
        return {
          label: '未满18岁',
          desc: '请18岁后再来观看!',
        };
      }
    },
  },
});

// res.update({}); 

res.getAuth(['login', ['vip', 'notMinor']], (pass, rejects) => {
  console.log(pass, rejects);
});
