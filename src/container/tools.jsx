import {connect} from 'react-redux'
import React from 'react'

import Tools from '../component/tools'
import Actions from '../action'

const mapStateToProps = state => {
    return state
}

const mapDispatchToProps = dispatch => {
    return {
        clickDFGModeHandler: (num) => {
            dispatch(Actions.changeDfgMode(num))
        },
        clickIDHandler: (num) => {
            dispatch(Actions.changeId(num))
        },
        changeCycleHandler: (v) => {
            dispatch(Actions.changeCycle(v))
        },
        changeOPHandler: (id, v) => {
            dispatch(Actions.changeOP(id, v))
        },
        arrangeSDFGHandler: () => {
            dispatch(Actions.arrangeCoordinates())
        },
        analysisLifetimeHandler: () => {
            dispatch(Actions.analysisLifetime())
        },
        setNodeTXYHandler: (nodeType, nodeX, nodeY, nodeEdge1, nodeEdge2, nodeEdgeType) => {
            dispatch(Actions.setNodeTXY(nodeType, nodeX, nodeY, nodeEdge1, nodeEdge2, nodeEdgeType))
        },
        setNodeTimeHandler: (nodeTime, cycle) => {
            dispatch(Actions.timeSetNode(nodeTime, cycle))
        },
        setSDFGHandler: (nodeType, nodeX, nodeY, nodeTime, nodeEdge1, nodeEdge2, nodeEdgeType, cycle) => {
            dispatch(Actions.setSDFG(nodeType, nodeX, nodeY, nodeTime, nodeEdge1, nodeEdge2, nodeEdgeType, cycle))
        },
        changeRegisterHandler: (v) => {
            dispatch(Actions.changeRegister(v))
        },
        setRegisterHandler: () => {
            dispatch(Actions.setRegister())
        },
        changeALUHandler: (v) => {
            dispatch(Actions.changeALU(v))
        },
        useRegAndALUHandler: (reg, useRegister, useALU) => {
            dispatch(Actions.useRegAndALU(reg, useRegister, useALU))
        },
        calculateCFHandler: (cn, cl1, cl2, cl3) => {
            dispatch(Actions.calculateCF(cn, cl1, cl2, cl3))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tools)