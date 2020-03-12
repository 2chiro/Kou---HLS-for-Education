import { start } from "repl"

const initialState = {
    id: 0,
    dfgMode: 0,
    selectTabId: 0,
    pointTabId: null,
    nodeInfo: [
        {
            nodeName: 'noname',
            // --- Cエディタ用 --- 
            //code: '#include <stdio.h>\nvoid noname(int a, int b, int c, int d, int *out1, int *out2)\n{\nint add1 = a + b;\nint add2 = c * d;\nint add3 = add1 + add2;\nint multi1 = add1*add2;\n*out1 = add3;\n*out2 = multi1;\n}',
            code: '#include <stdio.h>\nvoid noname()\n{\n\n}',
            // --- DFG用 ---
            nodeType: [], nodeX: [], nodeY: [], nodeTime: [],
            cycle: 0, nodeMinY: 0, nodeMaxX: 0, nodeMinX: 0,
            add: 1, sub: 1, mult: 1, div: 1, reg: 0,
            nodeEdge1: [], nodeEdge2: [], nodeEdgeType: [],
            startEdge: [], endEdge: [], doubleEdge: [],
            useRegister: [], registerX: [], registerY: [],
            useALU: [], ALUValue: '',
            // --- RTL用 ---
            inputNode: [], inputX:[], inputY: 0,
            outputNode: [], outputX: [], outputY: 0,
            aluNode: [], aluX: [], aluY: 0,
            regNode: [], regX: [], muxNode: [], muxX: [], muxY: 0,
            rtlNode: [], rtlLine1: [], rtlLine2: [], rtlLine3: [],
            tmux: 0
            // -------------
        }
    ]
}

export default function reducer (state = initialState, action) {
    switch (action.type) {
        case 'NEW':
            var nodeInfo = state.nodeInfo
            var node = {
                nodeName: 'noname',
                code: '#include <stdio.h>\nvoid noname()\n{\n\n}',
                nodeType: [], nodeX: [], nodeY: [], nodeTime: [],
                cycle: 0, nodeMinY: 0, nodeMaxX: 0,
                add: 1, sub: 1, mult: 1, div: 1, reg: 0,
                nodeEdge1: [], nodeEdge2: [], nodeEdgeType: [],
                startEdge: [], endEdge: [], doubleEdge: [],
                useRegister: [], registerX: [], registerY: [],
                useALU: [], ALUValue: '',
                inputNode: [], inputX:[], inputY: 0,
                outputNode: [], outputX: [], outputY: 0,
                aluNode: [], aluX: [], aluY: 0,
                regNode: [], regX: [], muxNode: [], muxX: [], muxY: 0,
                rtlNode: [], rtlLine1: [], rtlLine2: [], rtlLine3: [],
                tmux: 0
            }
            nodeInfo.push(node)
            return {
                ...state, id: 0, dfgMode: 0, selectTabId: parseInt(nodeInfo.length)-1,
                nodeInfo: nodeInfo
            }
        case 'OPEN':
            return {...state, nodeInfo: action.node}
        case 'CHANGE_ID':
            return {...state, id: action.value, dfgMode: 0,}
        case 'CHANGE_DFGMODE':
            return {...state, dfgMode: action.value}
        case 'CHANGE_SELECT_TAB_ID':
            return {...state, selectTabId: action.value}
        case 'CHANGE_POINT_TAB_ID':
            return {...state, pointTabId: action.value}
        case 'COPY_NODE':
            var nodeInfo = state.nodeInfo
            nodeInfo.push(action.node)
            return {
                ...state, id: 0, dfgMode: 0, selectTabId: parseInt(nodeInfo.length)-1,
                nodeInfo: nodeInfo
            }
        case 'RENAME_NODE':
            var node = state.nodeInfo[action.value]
            node.nodeName = action.name
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        case 'DELETE_NODE': {
            var nodeInfo = state.nodeInfo
            nodeInfo.splice(action.value, 1)
            return {
                ...state, id: 0, dfgMode: 0, selectTabId: 0,
                nodeInfo: nodeInfo
            }
        }
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
            if (state.id !== 3) {
                var x1, x2, y;
                for (var i in nodeX) {
                    x1 = i == 0 ? nodeX[0] : x1
                    x1 = i > 0 && x1 < nodeX[i] ? nodeX[i] : x1
                    x2 = i == 0 ? nodeX[0] : x2
                    x2 = i > 0 && x2 > nodeX[i] ? nodeX[i] : x2
                    y = i == 0 ? nodeY[0] : y
                    y = i > 0 && y > nodeY[i] ? nodeY[i] : y
                }
                node.nodeMaxX = x1
                node.nodeMixX = x2
                node.nodeMinY = y
            }
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
        case 'SET_SDFG':
            var node = state.nodeInfo[state.selectTabId]
            node.nodeType = action.nodeType
            node.nodeX = action.nodeX
            node.nodeY = action.nodeY
            node.nodeTime = action.nodeTime
            node.nodeEdge1 = action.nodeEdge1
            node.nodeEdge2 = action.nodeEdge2
            node.nodeEdgeType = action.nodeEdgeType
            node.cycle = action.cycle

            var nodeEdge1 = node.nodeEdge1
            var nodeEdge2 = node.nodeEdge2
            var nodeTime = node.nodeTime
            var nodeType = node.nodeType
            var doubleEdge = []
            var startEdge = new Array(nodeEdge1)
            var endEdge = new Array(nodeEdge2)
            for (var i = 0; i < nodeEdge1.length; i++) {
                if (nodeType[nodeEdge2[i]] === 'O' || nodeType[nodeEdge2[i]] === 'R') {
                    nodeTime[nodeEdge2[i]] = node.cycle
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
        case 'SET_REGISTER':
            var node = state.nodeInfo[state.selectTabId]
            var registerX = node.registerX
            var registerY = node.registerY
            var nodeMaxX = node.nodeMaxX
            var nodeMinY = node.nodeMinY
            var reg = node.reg
            var cycle = node.cycle
            var useRegister = []
            for (var i = 0; i < reg; i++) {
                var rx = []
                for (var j in registerX) {
                    if (registerX[i] !== 'none' && registerY[i] !== 'none') {
                        if (i === 0) {
                            if (registerX[j] < nodeMaxX + 120) {
                                //console.log('reg0',  j)
                                rx.push(Number(j))
                            }
                        } else if (i === reg - 1) {
                            if (registerX[j] > nodeMaxX + 80 + 40 * i) {
                                //console.log('reg' + i,  j)
                                rx.push(Number(j))
                            }
                        } else {
                            if (registerX[j] > nodeMaxX + 80 + 40 * i && registerX[j] < nodeMaxX + 80 + 40 * (i + 1)) {
                                //console.log('reg' + i,  j)
                                rx.push(Number(j))
                            }
                        }
                    }
                }
                //console.log(rx)
                var ry = []
                for (var j = 0; j < cycle; j++) {
                    for (var k in rx) {
                        if (registerY[k] > nodeMinY - 60 + 120 * j && registerY[k] < nodeMinY + 60 + 120 * j) {
                            ry.push(Number(rx[k]))
                        }
                    }
                }
                //console.log(ry)
                useRegister.push(ry)
            }
            node.useRegister = useRegister

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

            var type = ''
            switch (node.ALUValue.substring(0, 3)){
                case '加算器':
                    type = 'A'
                    break
                case '減算器':
                    type = 'S'
                    break
                case '乗算器':
                    type = 'M'
                    break
                case '除算器':
                    type = 'D'
                    break
            }
            if (node.nodeType[action.nodeId] !== type) {
                return state
            }

            for (var i in useALU) {
                if (useALU[i].name === node.ALUValue) {
                    if (useALU[i].node.indexOf(action.nodeId) === -1) {
                        useALU[i].node.push(Number(action.nodeId))
                    }
                } else {
                    if (useALU[i].node.indexOf(Number(action.nodeId)) !== -1) {
                        useALU[i].node.splice(useALU[i].node.indexOf(action.nodeId), 1)
                    }
                }
            }
            node.useALU = useALU
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        case 'USE_REGISTER_ALU':
            var node = state.nodeInfo[state.selectTabId]
            node.reg = action.reg
            node.useRegister = action.useRegister
            node.useALU = action.useALU

            var registerX = new Array(node.nodeEdge1.length)
            for (var i in node.useRegister) {
                for (var j in node.useRegister[i]) {
                    registerX[node.useRegister[i][j]] = node.nodeMaxX + 100 + 40 * i
                }
            }
            node.registerX = registerX
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        case 'CALCULATE_CF':
            var node = state.nodeInfo[state.selectTabId]
            var rtlNode = action.rtlNode
            var rtlLine1 = action.rtlLine1
            var rtlLine2 = action.rtlLine2
            var rtlLine3 = action.rtlLine3

            var regX = []
            var outputX = [], outputY = 0

            var input = 0, output = 0, reg = 0
            var add = 0, sub = 0, mult = 0, div = 0, mux = 0
            for (var i in rtlNode) {
                switch (rtlNode[i]) {
                    case 1:
                        input = input + 1
                        break
                    case 2:
                        output = output + 1
                        break
                    case 3:
                        reg = reg + 1
                        break
                    case 4:
                        add = add + 1
                        break
                    case 5:
                        sub = sub + 1
                        break
                    case 6:
                        mult = mult + 1
                        break
                    case 7:
                        div = div + 1
                        break
                    case 8:
                        mux = mux + 1
                        break
                }
            }

            var aluNode = new Array(add + sub + mult + div)
            var aluX = new Array(add + sub + mult + div), aluY = 0
            for (var i = 0; i < add + sub + mult + div; i++) {
                aluNode[i] = new Array(2).fill(-1)
            }
            var muxNode = new Array(mux)
            for (var i = 0; i < mux; i++) {
                muxNode[i] = new Array(7).fill(-1)
            }
            var muxX = new Array(mux), muxY = new Array(mux)

            var regNode = []
            var inputNode = new Array(input)
            var inputX = new Array(input), inputY = 0
            var outputNode = []

            var umux_n = 0, tmux_n = 0, mux_s = 0, in_s = 0;

            // レジスタ・マルチプレクサ・演算器相対配置
            var umux_x = 0, umux_y = -60, tmux_x = 0, tmux_y = 30
            var alu_x = 30, reg_x = 0, out_x = 0
            var k = 0
            for (var i in rtlLine1) {
                // 下部（レジスター演算器間）
                if (rtlNode[rtlLine2[i]] === 4 || rtlNode[rtlLine2[i]] === 5 || rtlNode[rtlLine2[i]] === 6 || rtlNode[rtlLine2[i]] === 7) {
                    for (var j = Number(i) + 1; j < rtlLine1.length; j++) {
                       if (rtlLine2[i] === rtlLine2[j]) {
                            aluNode[k][0] = rtlNode[rtlLine2[i]]
                            aluNode[k][1] = rtlLine2[i]
                            aluX[k] = alu_x
                            if (rtlNode[rtlLine1[i]] === 8) {
                                var m = mux_s
                                if (rtlLine3[i] === 1) {
                                    var umux_result = umux_alu(muxNode, muxX, muxY, mux_s, umux_n,
                                        rtlNode, rtlLine1, rtlLine2, rtlLine3,
                                        i, umux_x, umux_y, 1, m, 1, rtlLine2[i])
                                    function umux_alu (muxNode, muxX, muxY, mux_s, umux_n,
                                        rtlNode, rtlLine1, rtlLine2, rtlLine3,
                                        i, x, y, u, s, p, h) {
                                        var m = s;
                                        muxX[m] = x;
                                        muxY[m] = y;
                                        if (u > umux_n) {
                                            umux_n = umux_n + 1;
                                        }
                                        mux_s = mux_s + 1;
                                        muxNode[m][0] = rtlLine1[i]
                                        muxNode[m][3] = p;
                                        muxNode[m][5] = u;
                                        muxNode[m][6] = h;
                                        for(var k = 0; k < rtlLine1.length; k++) {
                                            var cl1_i = rtlLine1[i];
                                            var cl2_k = rtlLine2[k];
                                            if (cl1_i === cl2_k) {
                                                if (rtlLine3[k] === 1) {
                                                    muxNode[m][1] = rtlLine1[k];
                                                } else {
                                                    muxNode[m][2] = rtlLine1[k];
                                                }
                                                if (rtlNode[rtlLine1[k]] === 8) {
                                                    muxNode[m][4] = 0;
                                                    var ms = mux_s;
                                                    var umux_result = umux_alu(muxNode, muxX, muxY, mux_s, umux_n,
                                                        rtlNode, rtlLine1, rtlLine2, rtlLine3,
                                                        k, x, y - 40, u + 1 , ms, p, h);
                                                    
                                                    muxNode = umux_result.muxNode
                                                    muxX = umux_result.muxX
                                                    muxY = umux_result.muxY
                                                    mux_s = umux_result.mux_s
                                                    umux_n = umux_result.umux_n
                                                    rtlNode = umux_result.rtlNode
                                                    rtlLine1 = umux_result.rtlLine1
                                                    rtlLine2 = umux_result.rtlLine2
                                                    rtlLine3 = umux_result.rtlLine3
                                                } else {
                                                    muxNode[m][4] = 1;
                                                }
                                            }
                                        }
                                        return {
                                            muxNode, muxX, muxY, mux_s, umux_n,
                                            rtlNode, rtlLine1, rtlLine2, rtlLine3,
                                        }
                                    }
                                    muxNode = umux_result.muxNode
                                    muxX = umux_result.muxX
                                    muxY = umux_result.muxY
                                    mux_s = umux_result.mux_s
                                    umux_n = umux_result.umux_n
                                    rtlNode = umux_result.rtlNode
                                    rtlLine1 = umux_result.rtlLine1
                                    rtlLine2 = umux_result.rtlLine2
                                    rtlLine3 = umux_result.rtlLine3
                                } else {
                                    var umux_result = umux_alu(muxNode, muxX, muxY, mux_s, umux_n,
                                        rtlNode, rtlLine1, rtlLine2, rtlLine3,
                                        i, umux_x + 60, umux_y, 1, m, 2, rtlLine2[i])
                                    function umux_alu (muxNode, muxX, muxY, mux_s, umux_n,
                                        rtlNode, rtlLine1, rtlLine2, rtlLine3,
                                        i, x, y, u, s, p, h) {
                                        var m = s;
                                        muxX[m] = x;
                                        muxY[m] = y;
                                        if (u > umux_n) {
                                            umux_n = umux_n + 1;
                                        }
                                        mux_s = mux_s + 1;
                                        muxNode[m][0] = rtlLine1[i]
                                        muxNode[m][3] = p;
                                        muxNode[m][5] = u;
                                        muxNode[m][6] = h;
                                        for(var k = 0; k < rtlLine1.length; k++) {
                                            var cl1_i = rtlLine1[i];
                                            var cl2_k = rtlLine2[k];
                                            if (cl1_i === cl2_k) {
                                                if (rtlLine3[k] === 1) {
                                                    muxNode[m][1] = rtlLine1[k];
                                                } else {
                                                    muxNode[m][2] = rtlLine1[k];
                                                }
                                                if (rtlNode[rtlLine1[k]] === 8) {
                                                    muxNode[m][4] = 0;
                                                    var ms = mux_s;
                                                    var umux_result = umux_alu(muxNode, muxX, muxY, mux_s, umux_n,
                                                        rtlNode, rtlLine1, rtlLine2, rtlLine3,
                                                        k, x, y - 40, u + 1 , ms, p, h);
                                                    
                                                    muxNode = umux_result.muxNode
                                                    muxX = umux_result.muxX
                                                    muxY = umux_result.muxY
                                                    mux_s = umux_result.mux_s
                                                    umux_n = umux_result.umux_n
                                                    rtlNode = umux_result.rtlNode
                                                    rtlLine1 = umux_result.rtlLine1
                                                    rtlLine2 = umux_result.rtlLine2
                                                    rtlLine3 = umux_result.rtlLine3
                                                } else {
                                                    muxNode[m][4] = 1;
                                                }
                                            }
                                        }
                                        return {
                                            muxNode, muxX, muxY, mux_s, umux_n,
                                            rtlNode, rtlLine1, rtlLine2, rtlLine3,
                                        }
                                    }
                                    muxNode = umux_result.muxNode
                                    muxX = umux_result.muxX
                                    muxY = umux_result.muxY
                                    mux_s = umux_result.mux_s
                                    umux_n = umux_result.umux_n
                                    rtlNode = umux_result.rtlNode
                                    rtlLine1 = umux_result.rtlLine1
                                    rtlLine2 = umux_result.rtlLine2
                                    rtlLine3 = umux_result.rtlLine3
                                }
                            }
                            if (rtlNode[rtlLine1[j]] === 8) {
                                var m = mux_s
                                if (rtlLine3[j] === 2) {
                                    var umux_result = umux_alu(muxNode, muxX, muxY, mux_s, umux_n,
                                        rtlNode, rtlLine1, rtlLine2, rtlLine3,
                                        j, umux_x + 60, umux_y, 1, m, 2, rtlLine2[i])
                                    function umux_alu (muxNode, muxX, muxY, mux_s, umux_n,
                                        rtlNode, rtlLine1, rtlLine2, rtlLine3,
                                        i, x, y, u, s, p, h) {
                                        var m = s;
                                        muxX[m] = x;
                                        muxY[m] = y;
                                        if (u > umux_n) {
                                            umux_n = umux_n + 1;
                                        }
                                        mux_s = mux_s + 1;
                                        muxNode[m][0] = rtlLine1[i]
                                        muxNode[m][3] = p;
                                        muxNode[m][5] = u;
                                        muxNode[m][6] = h;
                                        for(var k = 0; k < rtlLine1.length; k++) {
                                            var cl1_i = rtlLine1[i];
                                            var cl2_k = rtlLine2[k];
                                            if (cl1_i === cl2_k) {
                                                if (rtlLine3[k] === 1) {
                                                    muxNode[m][1] = rtlLine1[k];
                                                } else {
                                                    muxNode[m][2] = rtlLine1[k];
                                                }
                                                if (rtlNode[rtlLine1[k]] === 8) {
                                                    muxNode[m][4] = 0;
                                                    var ms = mux_s;
                                                    var umux_result = umux_alu(muxNode, muxX, muxY, mux_s, umux_n,
                                                        rtlNode, rtlLine1, rtlLine2, rtlLine3,
                                                        k, x, y - 40, u + 1 , ms, p, h);
                                                    
                                                    muxNode = umux_result.muxNode
                                                    muxX = umux_result.muxX
                                                    muxY = umux_result.muxY
                                                    mux_s = umux_result.mux_s
                                                    umux_n = umux_result.umux_n
                                                    rtlNode = umux_result.rtlNode
                                                    rtlLine1 = umux_result.rtlLine1
                                                    rtlLine2 = umux_result.rtlLine2
                                                    rtlLine3 = umux_result.rtlLine3
                                                } else {
                                                    muxNode[m][4] = 1;
                                                }
                                            }
                                        }
                                        return {
                                            muxNode, muxX, muxY, mux_s, umux_n,
                                            rtlNode, rtlLine1, rtlLine2, rtlLine3,
                                        }
                                    }
                                    muxNode = umux_result.muxNode
                                    muxX = umux_result.muxX
                                    muxY = umux_result.muxY
                                    mux_s = umux_result.mux_s
                                    umux_n = umux_result.umux_n
                                    rtlNode = umux_result.rtlNode
                                    rtlLine1 = umux_result.rtlLine1
                                    rtlLine2 = umux_result.rtlLine2
                                    rtlLine3 = umux_result.rtlLine3
                                } else {
                                    var umux_result = umux_alu(muxNode, muxX, muxY, mux_s, umux_n,
                                        rtlNode, rtlLine1, rtlLine2, rtlLine3,
                                        j, umux_x, umux_y, 1, m, 1, rtlLine2[i])
                                    function umux_alu (muxNode, muxX, muxY, mux_s, umux_n,
                                        rtlNode, rtlLine1, rtlLine2, rtlLine3,
                                        i, x, y, u, s, p, h) {
                                        var m = s;
                                        muxX[m] = x;
                                        muxY[m] = y;
                                        if (u > umux_n) {
                                            umux_n = umux_n + 1;
                                        }
                                        mux_s = mux_s + 1;
                                        muxNode[m][0] = rtlLine1[i]
                                        muxNode[m][3] = p;
                                        muxNode[m][5] = u;
                                        muxNode[m][6] = h;
                                        for(var k = 0; k < rtlLine1.length; k++) {
                                            var cl1_i = rtlLine1[i];
                                            var cl2_k = rtlLine2[k];
                                            if (cl1_i === cl2_k) {
                                                if (rtlLine3[k] === 1) {
                                                    muxNode[m][1] = rtlLine1[k];
                                                } else {
                                                    muxNode[m][2] = rtlLine1[k];
                                                }
                                                if (rtlNode[rtlLine1[k]] === 8) {
                                                    muxNode[m][4] = 0;
                                                    var ms = mux_s;
                                                    var umux_result = umux_alu(muxNode, muxX, muxY, mux_s, umux_n,
                                                        rtlNode, rtlLine1, rtlLine2, rtlLine3,
                                                        k, x, y - 40, u + 1 , ms, p, h);
                                                    
                                                    muxNode = umux_result.muxNode
                                                    muxX = umux_result.muxX
                                                    muxY = umux_result.muxY
                                                    mux_s = umux_result.mux_s
                                                    umux_n = umux_result.umux_n
                                                    rtlNode = umux_result.rtlNode
                                                    rtlLine1 = umux_result.rtlLine1
                                                    rtlLine2 = umux_result.rtlLine2
                                                    rtlLine3 = umux_result.rtlLine3
                                                } else {
                                                    muxNode[m][4] = 1;
                                                }
                                            }
                                        }
                                        return {
                                            muxNode, muxX, muxY, mux_s, umux_n,
                                            rtlNode, rtlLine1, rtlLine2, rtlLine3,
                                        }
                                    }
                                    muxNode = umux_result.muxNode
                                    muxX = umux_result.muxX
                                    muxY = umux_result.muxY
                                    mux_s = umux_result.mux_s
                                    umux_n = umux_result.umux_n
                                    rtlNode = umux_result.rtlNode
                                    rtlLine1 = umux_result.rtlLine1
                                    rtlLine2 = umux_result.rtlLine2
                                    rtlLine3 = umux_result.rtlLine3
                                }
                            }
                            umux_x = umux_x + 150
                            alu_x = alu_x + 150
                            k = k + 1
                       }
                    } 
                }
                //上部（入力・演算器ーレジスタ間）
                if (rtlNode[rtlLine2[i]] === 3) {
                    regNode.push(rtlLine2[i])
                    regX.push(reg_x)
                    if (rtlNode[rtlLine1[i]] === 8) {
                        var m = mux_s
                        var tmux_result = tmux_alu(muxNode, muxX, muxY, mux_s, tmux_n,
                            inputNode, inputX, in_s,
                            rtlNode, rtlLine1, rtlLine2, rtlLine3,
                            i, tmux_x, tmux_y, 1, m)
                        function tmux_alu (muxNode, muxX, muxY, mux_s, tmux_n,
                            inputNode, inputX, in_s,
                            rtlNode, rtlLine1, rtlLine2, rtlLine3,
                            i, x, y, t, s) {
                            var m = s;
                            muxX[m] = x;
                            muxY[m] = y;
                            if (t > tmux_n) {
                                tmux_n = tmux_n + 1;
                            }
                            mux_s = mux_s + 1;
                            muxNode[m][0] = rtlLine1[i];
                            muxNode[m][3] = 3;
                            muxNode[m][5] = t;
                            for (var k = 0; k < rtlLine1.length; k++) {
                                var cl1_i = rtlLine1[i];
                                var cl2_k = rtlLine2[k];
                                if (cl1_i === cl2_k) {
                                    if (rtlLine3[k] === 1) {
                                        muxNode[m][1] = rtlLine1[k];
                                    } else {
                                        muxNode[m][2] = rtlLine1[k];
                                    }
                                    if (rtlNode[rtlLine1[k]] === 8) {
                                        muxNode[m][4] = 0;
                                        var ms = mux_s;
                                        var tmux_result = tmux_alu(muxNode, muxX, muxY, mux_s, tmux_n,
                                            inputNode, inputX, in_s,
                                            rtlNode, rtlLine1, rtlLine2, rtlLine3,
                                            k, x, y + 40, t + 1, ms);
                                        muxNode = tmux_result.muxNode
                                        muxX = tmux_result.muxX
                                        muxY = tmux_result.muxY
                                        mux_s = tmux_result.mux_s
                                        tmux_n = tmux_result.tmux_n
                                        inputNode = tmux_result.inputNode
                                        inputX = tmux_result.inputX
                                        in_s = tmux_result.in_s
                                        rtlNode = tmux_result.rtlNode
                                        rtlLine1 = tmux_result.rtlLine1
                                        rtlLine2 = tmux_result.rtlLine2
                                        rtlLine3 = tmux_result.rtlLine3
                                    } else if (rtlNode[rtlLine1[k]] === 1) {
                                        var ns = in_s;
                                        inputX[ns] = x;
                                        inputNode[ns] = rtlLine1[k];
                                        in_s = in_s + 1;
                                        muxNode[m][4] = 1;
                                    } else {
                                        muxNode[m][4] = 1;
                                    }
                                }
                            }
                            return {
                                muxNode, muxX, muxY, mux_s, tmux_n,
                                inputNode, inputX, in_s,
                                rtlNode, rtlLine1, rtlLine2, rtlLine3,
                            }
                        }
                        muxNode = tmux_result.muxNode
                        muxX = tmux_result.muxX
                        muxY = tmux_result.muxY
                        mux_s = tmux_result.mux_s
                        tmux_n = tmux_result.tmux_n
                        inputNode = tmux_result.inputNode
                        inputX = tmux_result.inputX
                        in_s = tmux_result.in_s
                        rtlNode = tmux_result.rtlNode
                        rtlLine1 = tmux_result.rtlLine1
                        rtlLine2 = tmux_result.rtlLine2
                        rtlLine3 = tmux_result.rtlLine3
                    } else if (rtlNode[rtlLine1[i]] === 1) {
                        var s = in_s;
                        inputX[s] = tmux_x
                        inputNode[s] = rtlLine1[i]
                        in_s = in_s + 1
                    }
                    tmux_x = tmux_x + 75
                    reg_x = reg_x + 75
                }
                // 出力
                if (rtlNode[rtlLine2[i]] === 2) {
                    outputNode.push(rtlLine2[i])
                    outputX.push(out_x)
                    out_x = out_x + 20
                }
            }
            /*
            console.log("相対配置")
            console.log("inputNode:", inputNode, "inputX:", inputX)
            console.log("outputNode:", outputNode, "outputX:", outputX)
            console.log("aluNode:", aluNode, "aluX:", aluX)
            console.log("regNode:", regNode, "regX:", regX)
            console.log("muxNode:", muxNode, "muxX:", muxX, "muxY:", muxY)
            */

            //演算器絶対配置
		    aluY = 10 + reg * 10 + 200 + umux_n * 40 + 60;

		    //マルチプレクサ絶対配置
		    for (var i = 0; i < mux; i++) {
			    if (muxY[i] < 0) {
                    muxY[i] = muxY[i] + aluY;
			    } else {
				    muxY[i] = - muxY[i];
			    }
		    }

		    //入力絶対配置
		    inputY = -20 - 40 * tmux_n - (add + sub + mult + div) * 10 - 25;

		    //出力絶対配置
		    var out_x2 = reg * 75 + 15;
		    outputY = reg * 10 + 25;
		    for (var i = 0; i < output; i++) {
			    outputX[i] = outputX[i] + out_x2;
            }
            
            console.log("絶対配置")
            console.log("inputNode:", inputNode, "inputX:", inputX, "inputY:", inputY)
            console.log("outputNode:", outputNode, "outputX:", outputX, "outputY:", outputY)
            console.log("aluNode:", aluNode, "aluX:", aluX, "aluY:", aluY)
            console.log("regNode:", regNode, "regX:", regX)
            console.log("muxNode:", muxNode, "muxX:", muxX, "muxY:", muxY)

            node.inputNode = inputNode
            node.inputX = inputX
            node.inputY = inputY
            node.outputNode = outputNode
            node.outputX = outputX
            node.outputY = outputY
            node.aluNode = aluNode
            node.aluX = aluX
            node.aluY = aluY
            node.regNode = regNode
            node.regX = regX
            node.muxNode = muxNode
            node.muxX = muxX
            node.muxY = muxY

            node.rtlNode = rtlNode
            node.rtlLine1 = rtlLine1
            node.rtlLine2 = rtlLine2
            node.rtlLine3 = rtlLine3

            node.tmux = tmux_n
            
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        case 'CHANGE_CODE' :
            var node = state.nodeInfo[state.selectTabId]
            node.code = action.code
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        case 'SET_NODE_TXY' :
            var node = state.nodeInfo[state.selectTabId]
            node.nodeType = action.nodeType
            node.nodeX = action.nodeX
            node.nodeY = action.nodeY
            node.nodeEdge1 = action.nodeEdge1
            node.nodeEdge2 = action.nodeEdge2
            node.nodeEdgeType = action.nodeEdgeType
            var x, y;
            for (var i in node.nodeX) {
                x = i == 0 ? node.nodeX[0] : x
                x = i > 0 && x < node.nodeX[i] ? node.nodeX[i] : x
                y = i == 0 ? node.nodeY[0] : y
                y = i > 0 && y > node.nodeY[i] ? node.nodeY[i] : y
            }
            node.nodeMaxX = x
            node.nodeMinY = y
            return {
                ...state,
                nodeInfo: state.nodeInfo.map(el => el === state.nodeInfo[state.selectTabId] ? node : el)
            }
        default:
            return state
    }
}