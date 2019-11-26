import { start } from "repl"

const initialState = {
    id: 1,
    dfgMode: 0,
    selectTabId: 0,
    nodeInfo: [
        {
            nodeName: 'noname',
            nodeType: [], nodeX: [], nodeY: [], nodeTime: [],
            cycle: 0, nodeMinY: 0, nodeMaxX: 0,
            add: 1, sub: 1, mult: 1, div: 1, reg: 0,
            nodeEdge1: [], nodeEdge2: [], nodeEdgeType: [],
            startEdge: [], endEdge: [], doubleEdge: [],
            useRegister: [], registerX: [], registerY: [],
            useALU: [], ALUValue: ''
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
            var node = state.nodeInfo[state.selectTabId]
            var nodeType = node.nodeType
            var nodeX = node.nodeX
            var nodeY = node.nodeY
            nodeType.push(action.nodeType)
            nodeX.push(action.nodeX)
            nodeY.push(action.nodeY)
            node.nodeType = nodeType
            node.nodeX = nodeX
            node.nodeY = nodeY

            var x, y;
            for (var i in nodeX) {
                x = i == 0 ? nodeX[0] : x
                x = i > 0 && x < nodeX[i] ? nodeX[i] : x
                y = i == 0 ? nodeY[0] : y
                y = i > 0 && y > nodeY[i] ? nodeY[i] : y
            }
            node.nodeMaxX = x
            node.nodeMinY = y
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        case 'MOVE_NODE':
            var node = state.nodeInfo[state.selectTabId]
            var nodeX = node.nodeX
            var nodeY = node.nodeY
            nodeX[action.nodeId] = action.moveX
            node.nodeX = nodeX
            if (state.id < 3) {
                nodeY[action.nodeId] = action.moveY
                node.nodeY = nodeY
            }
            var x, y;
            for (var i in nodeX) {
                x = i == 0 ? nodeX[0] : x
                x = i > 0 && x < nodeX[i] ? nodeX[i] : x
                y = i == 0 ? nodeY[0] : y
                y = i > 0 && y > nodeY[i] ? nodeY[i] : y
            }
            node.nodeMaxX = x
            node.nodeMinY = y
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        case 'REMOVE_NODE':
            var node = state.nodeInfo[state.selectTabId]
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
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        case 'DRAW_EDGE':
            var node = state.nodeInfo[state.selectTabId]
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
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        case 'CHANGE_CYCLE':
            var node = state.nodeInfo[state.selectTabId]
            node.cycle = action.cycle
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        case 'CHANGE_OP':
            var node = state.nodeInfo[state.selectTabId]
            switch (action.opID) {
                case 1:
                    node.add = action.value
                    break
                case 2:
                    node.sub = action.value
                    break
                case 3:
                    node.mult = action.value
                    break
                case 4:
                    node.div = action.value
                    break
            }
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        case 'ARRANGE_COORDINATES':
            var node = state.nodeInfo[state.selectTabId]
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
            node.nodeTime = nodeTime
            var add = 0, sub = 0, mult = 0, div = 0
            for (var j = 0; j <= node.cycle; j++) {
                var a = 0, s = 0, m = 0, d = 0
                for (var i in nodeType) {
                    if (nodeTime[i] === j) {
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

            var useALU = []
            for (var i = 0; i < add; i++){
                useALU.push({name: '加算器' + i, node: []})
            }
            for (var i = 0; i < sub; i++){
                useALU.push({name: '減算器' + i, node: []})
            }
            for (var i = 0; i < mult; i++){
                useALU.push({name: '乗算器' + i, node: []})
            }
            for (var i = 0; i < div; i++){
                useALU.push({name: '除算器' + i, node: []})
            }
            node.useALU = useALU

            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        case 'ANALYSIS_LIFETIME':
            var node = state.nodeInfo[state.selectTabId]
            var nodeEdge1 = node.nodeEdge1
            var nodeEdge2 = node.nodeEdge2
            var nodeTime = node.nodeTime
            var nodeType = node.nodeType
            var doubleEdge = []
            var startEdge = new Array(nodeEdge1)
            var endEdge = new Array(nodeEdge2)
            var x = 0
            for (var i = 0; i < nodeEdge1.length; i++) {
                if (nodeType[nodeEdge1[i]] === 'I') {
                    nodeTime[nodeEdge1[i]] = 0
                }
                if (nodeType[nodeEdge2[i]] === 'O') {
                    if (x === 0) {
                        for (var j in nodeTime) {
                            if (x < nodeTime[j]) {
                                x = nodeTime[j]
                            }
                        }
                        x = x + 1
                    }
                    nodeTime[nodeEdge2[i]] = x
                }
                for (var k = i + 1; k < nodeEdge1.length; k++) {
                    if (nodeEdge1[i] === nodeEdge1[k]) {
                        if (nodeTime[nodeEdge2[i]] < nodeTime[nodeEdge2[k]]) {
                            doubleEdge.push(i)
                        } else {
                            var p = false
                            for (var l in doubleEdge) {
                                if (l === k) {
                                    p = true
                                    break
                                }
                            }
                            if (!p) {
                                doubleEdge.push(k)
                            }
                        }
                    }
                }
                endEdge[i] = nodeTime[nodeEdge2[i]]
                startEdge[i] = nodeTime[nodeEdge1[i]]
            }
            node.endEdge = endEdge
            node.startEdge = startEdge
            node.doubleEdge = doubleEdge

            //一時的なレジスタ割当
            var registerX = [], registerY = []
            var reg = 0
            for (var i in startEdge) {
                var v = doubleEdge.indexOf(Number(i))
                if (v === -1) {
                    var x = node.nodeMaxX + 100 + 40 * reg
                    var y = node.nodeMinY + 120 * startEdge[i]
                    registerX.push(x)
                    registerY.push(y)
                    reg = reg + 1
                } else {
                    registerX.push('none')
                    registerY.push('none')
                }
            }
            node.reg = reg
            node.registerX = registerX
            node.registerY = registerY
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        case 'TIMESET_NODE':
            var node = state.nodeInfo[state.selectTabId]
            var nodeY = node.nodeY
            node.nodeTime = action.nodeTime
            node.cycle = action.cycle
            for (var i in node.nodeTime) {
                switch (node.nodeType[i]) {
                    case 'A':
                    case 'S':
                    case 'M':
                    case 'D':
                        nodeY[i] = node.nodeMinY + (node.nodeTime[i] * 120)
                        break
                    case 'I':
                        nodeY[i] = node.nodeMinY
                        break
                    case 'O':
                        nodeY[i] = node.nodeMinY + (node.cycle * 120)
                        break
                }
            }
            node.nodeY = nodeY
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        case 'CHANGE_REGISTER':
            var node = state.nodeInfo[state.selectTabId]
            node.reg = action.reg
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        case 'MOVE_LIFETIME':
            var node = state.nodeInfo[state.selectTabId]
            var registerX = node.registerX
            registerX[action.edgeId] = action.moveX
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        case 'CHANGE_ALU':
            var node = state.nodeInfo[state.selectTabId]
            node.ALUValue = action.value
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        case 'PAINT_NODE':
            var node = state.nodeInfo[state.selectTabId]
            if (node.ALUValue === '') {
                return state
            }
            var useALU = node.useALU
            for (var i in useALU) {
                if (useALU[i].name === node.ALUValue) {
                    if (useALU[i].node.indexOf(action.nodeId) === -1) {
                        useALU[i].node.push(Number(action.nodeId))
                        break
                    }
                }
            }
            node.useALU = useALU
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        default:
            return state
    }
}