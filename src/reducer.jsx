const initialState = {
    id: 1,
    dfgMode: 0,
    selectTabId: 0,
    nodeInfo: [
        {nodeName: 'noname', nodeType: [], nodeX: [], nodeY: []}
    ]
}

export default function reducer (state = initialState, action) {
    switch (action.type) {
        case 'CHANGE_DFGMODE':
            return {...state, dfgMode: action.value}
        case 'PUT_NODE': 
            var node = state.nodeInfo[action.tabId]
            var nodeType = node.nodeType
            var nodeX = node.nodeX
            var nodeY = node.nodeY
            nodeType.push(action.nodeType)
            nodeX.push(action.nodeX)
            nodeY.push(action.nodeY)
            node.nodeType = nodeType
            node.nodeX = nodeX
            node.nodeY = nodeY
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[action.tabId] ? node : el)
            }
        case 'REMOVE_NODE':
            var node = state.nodeInfo[action.tabId]
            var nodeType = node.nodeType
            var nodeX = node.nodeX
            var nodeY = node.nodeY
            nodeType.splice(action.nodeId[0], 1)
            nodeX.splice(action.nodeId[0], 1)
            nodeY.splice(action.nodeId[0], 1)
            node.nodeType = nodeType
            node.nodeX = nodeX
            node.nodeY = nodeY
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[action.tabId] ? node : el)
            }
        default:
            return state
    }
}