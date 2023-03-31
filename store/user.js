export const state = () => ({
  author: "@rainbow",
  contractStatus: "", // 签约状态，0：已经签约，1：没有签约
  contractUrl: "",
  resignData: {} //从链接上取的参数会更新到这
});

export const mutations = {
  setContractStatus(state, val) {
    state.contractStatus = val;
  },
  setResignData(state, val) {
    state.resignData = { ...state.resignData, ...val };
  },
  setContractUrl(state, val) {
    state.contractUrl = val;
  }
};

export const actions = {
  // 重新签约要用的方法
  async getResignUrl({ state, commit }) {
    try {
      let postData = {
        ...state.resignData,
        platformId: getPayPlatformId()
      };
      postData = JSON.parse(JSON.stringify(postData)); //为了过滤值为undefined的数据
      let { code, message, data = {} } = await getResignApi(postData, {
        loading: true
      });
      if (code === "0") {
        let { contractStatus, contractUrl } = data;
        if (contractStatus == 2) {
          commit("setContractUrl", contractUrl);
          commit("setContractStatus", "1");
        } else if (contractStatus == 1) {
          commit("setContractStatus", "0");
        }
      } else {
        Vue.prototype.$toast({ text: message });
      }
    } catch (error) {
      console.log(error, "resign#js");
      Vue.prototype.$toast({ text: "网络繁忙请稍后重试" });
    }
  }
};
