const initialState = {
    id: 1,
    dfgMode: 0,
    selectTabId: 0,
    nodeInfo: [
        {
            nodeName: 'noname',
            nodeType: [], nodeX: [], nodeY: [], nodeTime: [],
            add: 0, sub: 0, mult: 0, div: 0,
            nodeEdge1: [], nodeEdge2: [], nodeEdgeType: [],
            cycle: 0, nodeMinY: 0
        }
    ]
}

export default function reducer (state = initialState, action) {
    switch (action.type) {
        case 'CHANGE_ID':
            return {...state, id: action.value, dfgMode: 0}
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

            var y;
            for (var i in nodeY) {
              y = i == 0 ? nodeY[0] : y
              y = i > 0 && y > nodeY[i] ? nodeY[i] : y
            }
            node.nodeMinY = y
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

            var y;
            for (var i in nodeY) {
              y = i == 0 ? nodeY[0] : y
              y = i > 0 && y > nodeY[i] ? nodeY[i] : y
            }
            node.nodeMinY = y
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
        case 'CHANGE_CYCLE':
            var node = state.nodeInfo[action.tabId]
            node.cycle = action.cycle
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[action.tabId] ? node : el)
            }
        case 'ARRANGE_COORDINATES':
            var node = state.nodeInfo[action.tabId]
            var nodeY = node.nodeY
            var nodeTime = node.nodeTime
            var nodeType = node.nodeType
            for (var i in nodeY) {
                for (var j = 0; j <= node.cycle; j++) {
                    if (j == node.cycle) {
                        nodeY[i] = node.nodeMinY + (j * 120)
                        nodeTime[i] = nodeType[i] === 'I' || nodeType[i] === 'O' ? -1 : j
                    }
                    if (node.nodeMinY + 60 + (j * 120) > nodeY[i]) {
                        nodeY[i] = node.nodeMinY + (j * 120)
                        nodeTime[i] = nodeType[i] === 'I' || nodeType[i] === 'O' ? -1 : j
                        break
                    }
                }
            }
            node.nodeY = nodeY
            var add = 0, sub = 0, mult = 0, div = 0
            for (var j = 0; j <= node.cycle; j++) {
                var a = 0, s = 0, m = 0, d = 0
                for (var i in nodeType) {
                    switch (nodeType[i]) {
                        case 'A': a++
                        break
                        case 'S': s++
                        break
                        case 'M': m++
                        break
                        case 'D': d++
                        break
                    }
                }
                add = a > add ? a : add
                sub = s > sub ? s : sub
                mult = m > mult ? m : mult
                div = d > div ? d : div
            }
            node.add = add
            node.sub = sub
            node.mult = mult
            node.div = div
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[action.tabId] ? node : el)
            }
        default:
            return state
    }
}