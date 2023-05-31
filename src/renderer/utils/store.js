class Store {
    constructor(state, mutations) {
        this.state = state
        this.mutations = mutations
    }

    dispatch(name, payload) {
        this.mutations[name](this.state, payload)
    }
}

const state = {
    model4: "",
    live2d: "../../../model/hiyori_pro/hiyori_pro.model3.json",
    scale: 0.1,
    percentage: parseFloat(13.0),
    parameterIndex: "",
}

const mutations = {}

const store = new Store(state, mutations)