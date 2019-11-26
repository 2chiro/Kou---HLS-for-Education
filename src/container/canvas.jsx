import {connect} from 'react-redux'
import React from 'react'

import Canvas from '../component/canvas'
import Actions from '../action'

const mapStateToProps = state => {
    return state
}

const mapDispatchToProps = dispatch => {
    return {
        putNodeHandler: (nodeType, nodeX, nodeY) => {
            dispatch(Actions.putNode(nodeType, nodeX, nodeY))
        },
        moveNodeHandler: (nodeId, moveX, moveY) => {
            dispatch(Actions.moveNode(nodeId, moveX, moveY))
        },
        removeNodeHandler: (selectNode) => {
            dispatch(Actions.removeNode(selectNode))
        },
        drawEdgeHandler: (edge1, edge2, edgeType) => {
            dispatch(Actions.drawEdge(edge1, edge2, edgeType))
        },
        moveLifetimeHandler: (edgeId, moveX) => {
            dispatch(Actions.moveLifetime(edgeId, moveX))
        },
        paintNodeHandler: (nodeId) => {
            dispatch(Actions.paintNode(nodeId))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Canvas)