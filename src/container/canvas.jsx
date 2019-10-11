import {connect} from 'react-redux'
import React from 'react'

import Canvas from '../component/canvas'
import Actions from '../action'

const mapStateToProps = state => {
    return state
}

const mapDispatchToProps = dispatch => {
    return {
        putNodeHandler: (tabId, nodeType, nodeX, nodeY) => {
            dispatch(Actions.putNode(tabId, nodeType, nodeX, nodeY))
        },
        moveNodeHandler: (tabId, nodeId, moveX, moveY) => {
            dispatch(Actions.moveNode(tabId, nodeId, moveX, moveY))
        },
        removeNodeHandler: (tabId, selectNode) => {
            dispatch(Actions.removeNode(tabId, selectNode))
        },
        drawEdgeHandler: (tabId, edge1, edge2, edgeType) => {
            dispatch(Actions.drawEdge(tabId, edge1, edge2, edgeType))
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Canvas)