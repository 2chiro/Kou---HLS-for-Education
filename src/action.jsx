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
    putNode: (tabId, nodeType, nodeX, nodeY) => {
        return {
            type: 'PUT_NODE',
            tabId: tabId,
            nodeType: nodeType,
            nodeX: nodeX,
            nodeY: nodeY
        }
    },
    moveNode: (tabId, nodeId, moveX, moveY) => {
        return {
            type: 'MOVE_NODE',
            tabId: tabId,
            nodeId: nodeId,
            moveX: moveX,
            moveY: moveY
        }
    },
    removeNode: (tabId, selectNode) => {
        return {
            type: 'REMOVE_NODE',
            tabId: tabId,
            nodeId: selectNode
        }
    },
    drawEdge: (tabId, edge1, edge2, edgeType) => {
        return {
            type: 'DRAW_EDGE',
            tabId: tabId,
            nodeEdge1: edge1,
            nodeEdge2: edge2,
            nodeEdgeType: edgeType
        }
    },
    changeCycle: (v, tabId) => {
        return {
            type: 'CHANGE_CYCLE',
            tabId: tabId,
            cycle: v
        }
    },
    arrangeCoordinates: (tabId) => {
        return {
            type: 'ARRANGE_COORDINATES',
            tabId: tabId
        }
    }
}

export default Actions