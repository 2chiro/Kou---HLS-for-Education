const Actions = {
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
    removeNode: (tabId, selectNode) => {
        return {
            type: 'REMOVE_NODE',
            tabId: tabId,
            nodeId: selectNode
        }
    }
}

export default Actions