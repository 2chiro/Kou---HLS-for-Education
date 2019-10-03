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
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Canvas)