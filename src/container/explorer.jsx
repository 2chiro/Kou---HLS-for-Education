import {connect} from 'react-redux'
import React from 'react'

import Actions from '../action'
import Explorer from '../component/explorer'

const mapStateToProps = state => {
    return state
}

const mapDispatchToProps = dispatch => {
    return {
        newHandler: () => {
            dispatch(Actions.new())
        },
        openHandler: (node) => {
            dispatch(Actions.open(node))
        },
        clickIDHandler: (num) => {
            dispatch(Actions.changeId(num))
        },
        changeSelectHandler: (num) => {
            dispatch(Actions.changeSelectTabId(num))
        },
        changePointHandler: (num) => {
            dispatch(Actions.changePointTabId(num))
        },
        copyNodeHandler: (node) => {
            dispatch(Actions.copyNode(node))
        },
        renameNodeHandler: (index, name) => {
            dispatch(Actions.renameNode(index, name))
        },
        deleteNodeHandler: (index) => {
            dispatch(Actions.deleteNode(index))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Explorer)