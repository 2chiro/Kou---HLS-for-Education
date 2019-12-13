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
        setNodeTimeHandler: (nodeTime, cycle) => {
            dispatch(Actions.timeSetNode(nodeTime, cycle))
        },
        changeRegisterHandler: (v) => {
            dispatch(Actions.changeRegister(v))
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