const initialState = {
    id: 1,
    dfgMode: 0,
    selectTabId: 0,
    nodeInfo: [
        {nodeName: 'noname', nodeType: [], nodeX: [], nodeY: [], nodeEdge1: [], nodeEdge2: [], nodeEdgeType: []}
    ]
}

export default function reducer (state = initialState, action) {
    switch (action.type) {
        case 'CHANGE_ID':
                return {...state, id: action.value}
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
        case 'MOVE_NODE':
            var node = state.nodeInfo[action.tabId]
            var nodeX = node.nodeX
            var nodeY = node.nodeY
            nodeX[action.nodeId] = action.moveX
            nodeY[action.nodeId] = action.moveY
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
            var nodeEdge1 = node.nodeEdge1
            var nodeEdge2 = node.nodeEdge2
            var nodeEdgeType = node.nodeEdgeType
            nodeType.splice(action.nodeId[0], 1)
            nodeX.splice(action.nodeId[0], 1)
            nodeY.splice(action.nodeId[0], 1)
            node.nodeType = nodeType
            node.nodeX = nodeX
            node.nodeY = nodeY
            for (var i in nodeEdge1) {
                if (nodeEdge1[i] === Number(action.nodeId[0]) || nodeEdge2[i] === Number(action.nodeId[0])) {
                    nodeEdge1[i] = -1
                    nodeEdge2[i] = -1
                    nodeEdgeType[i] = -1
                }
                if (nodeEdge1[i] > Number(action.nodeId[0])) {
                    nodeEdge1[i] = nodeEdge1[i] - 1
                }
                if (nodeEdge2[i] > Number(action.nodeId[0])) {
                    nodeEdge2[i] = nodeEdge2[i] - 1
                }
            }
            const new_nodeEdge1 = nodeEdge1.filter(n => n !== -1)
            const new_nodeEdge2 = nodeEdge2.filter(n => n !== -1)
            const new_nodeEdgeType = nodeEdgeType.filter(n => n !== -1)
            node.nodeEdge1 = new_nodeEdge1
            node.nodeEdge2 = new_nodeEdge2
            node.nodeEdgeType = new_nodeEdgeType
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[action.tabId] ? node : el)
            }
        case 'DRAW_EDGE':
            var node = state.nodeInfo[action.tabId]
            var nodeEdge1 = node.nodeEdge1
            var nodeEdge2 = node.nodeEdge2
            var nodeEdgeType = node.nodeEdgeType
            nodeEdge1.push(Number(action.nodeEdge1))
            nodeEdge2.push(Number(action.nodeEdge2))
            nodeEdgeType.push(action.nodeEdgeType)
            node.nodeEdge1 = nodeEdge1
            node.nodeEdge2 = nodeEdge2
            node.nodeEdgeType = nodeEdgeType
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[action.tabId] ? node : el)
            }
        default:
            return state
    }
}