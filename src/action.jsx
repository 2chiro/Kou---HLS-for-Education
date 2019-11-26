const Actions = {
    changeId: (num) => {
        return {
            type: 'CHANGE_ID',
            value: num
        }
    },
    changeDfgMode: (num) => {
        return {
            type: 'CHANGE_DFGMODE',
            value: num
        }
    },
    putNode: (nodeType, nodeX, nodeY) => {
        return {
            type: 'PUT_NODE',
            nodeType: nodeType,
            nodeX: nodeX,
            nodeY: nodeY
        }
    },
    moveNode: (nodeId, moveX, moveY) => {
        return {
            type: 'MOVE_NODE',
            nodeId: nodeId,
            moveX: moveX,
            moveY: moveY
        }
    },
    removeNode: (selectNode) => {
        return {
            type: 'REMOVE_NODE',
            nodeId: selectNode
        }
    },
    drawEdge: (edge1, edge2, edgeType) => {
        return {
            type: 'DRAW_EDGE',
            nodeEdge1: edge1,
            nodeEdge2: edge2,
            nodeEdgeType: edgeType
        }
    },
    changeCycle: (v) => {
        return {
            type: 'CHANGE_CYCLE',
            cycle: v
        }
    },
    changeOP: (id, v) => {
        return {
            type: 'CHANGE_OP',
            opID: id,
            value: v
        }
    },
    arrangeCoordinates: () => {
        return {
            type: 'ARRANGE_COORDINATES',
        }
    },
    analysisLifetime: () => {
        return {
            type: 'ANALYSIS_LIFETIME',
        }
    },
    timeSetNode: (nodeTime, cycle) => {
        return {
            type: 'TIMESET_NODE',
            nodeTime: nodeTime,
            cycle: cycle
        }
    },
    changeRegister: (v) => {
        return {
            type: 'CHANGE_REGISTER',
            reg: v
        }
    },
    moveLifetime: (edgeId, moveX) => {
        return {
            type: 'MOVE_LIFETIME',
            edgeId: edgeId,
            moveX: moveX
        }
    },
    changeALU: (v) => {
        return {
            type: 'CHANGE_ALU',
            value: v
        }
    },
    paintNode: (nodeId) => {
        return {
            type: 'PAINT_NODE',
            nodeId: nodeId
        }
    }
}

export default Actions