import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    choice: null,
    servicesData: null,
    service1: null,
    service2: null,
    params1: [''],
    params2: [''],
    action: null,
    reaction: null,
    completeArea: null,
    historyArea: []
  },
  mutations: {
    setChoice (state, choice) {
      state.choice = choice
    },
    setServicesData (state, data) {
      state.servicesData = data
    },
    setService1 (state, payload) {
      state.service1 = payload.service1
      state.action = payload.action
      state.params1 = payload.params1
    },
    setService2 (state, payload) {
      state.service2 = payload.service2
      state.reaction = payload.reaction
      state.params2 = payload.params2
    },
    getStateOfArea (state) {
      const isComplete = state.service1 !== null && state.service2 !== null &&
      state.action !== null && state.reaction !== null &&
      Array.isArray(state.params1) && state.params1.every(param => param !== null) &&
      Array.isArray(state.params2) && state.params2.every(param => param !== null)
      state.completeArea = isComplete
    },
    addToHistory (state, area) {
      state.historyArea.push(area)
      state.service2 = null
      state.reaction = null
      state.params2 = ['']
      state.service1 = null
      state.action = null
      state.params1 = ['']
    },
    deleteFromHistory (state, index) {
      state.historyArea.splice(index, 1)
    }

  },
  actions: {
    fetchServicesData ({ commit }) {
      return new Promise((resolve, reject) => {
        const apiUrl = process.env.SERVER_URL
        axios.get(apiUrl + '/about/json')
          .then(response => {
            commit('setServicesData', response.data)
            resolve()
          })
          .catch(error => {
            console.error(error)
            reject(error)
          })
      })
    }
  },
  plugins: [
    createPersistedState({
      key: 'your-app-key',
      storage: window.localStorage
    })
  ]
})
