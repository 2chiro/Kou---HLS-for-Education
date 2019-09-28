const initialState = {
    id: 1,
    dfgMode: 0
}

export default function reducer (state = initialState, action) {
    switch (action.type) {
        case 'CHANGE_DFGMODE':
            return Object.assign({}, state, {
                dfgMode: action.value
            })
        default:
            return state
    }
}