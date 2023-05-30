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
    live2d: "../../../model/血小板/血小板.model.json",
    scale: 0.18,
    percentage: parseFloat(13.0),
    parameterIndex: "",
}

const mutations = {}

const store = new Store(state, mutations)