const state = () =>  ({
    username: '',
    token:''
  })
  
  const getters = {
    username: state => state.username,
    token: state => state.token,
  }
  
  const mutations = {
    SET_USERNAME_STATUS(state, name) {
      state.username = name;
    },
    SET_TOKEN_STATUS(state, name) {
      state.token = name;
    },
  
  }
  const actions = {
  
  
  }
  
  export default {
      state,
      getters,
      actions,
      mutations,
  }