import {connect} from 'react-redux'
import React from 'react'

import Tools from '../component/tools'
import Actions from '../action'

const mapStateToProps = state => {
    return state
}

const mapDispatchToProps = dispatch => {
    return {
        dfgmodeClickHandler: (num) => {
            dispatch(Actions.changeDfgMode(num))
        },
        IDClickHandler: (num) => {
            dispatch(Actions.changeId(num))
        },
        cycleChangeHandler: (v) => {
            dispatch(Actions.changeCycle(v))
        },
        opChangeHandler: (id, v) => {
            dispatch(Actions.changeOP(id, v))
        },
        sdfgArrangeHandler: () => {
            dispatch(Actions.arrangeCoordinates())
        },
        lifetimeAnalysisHandler: () => {
            dispatch(Actions.analysisLifetime())
        },
        nodeTimeSetHandler: (nodeTime, cycle) => {
            dispatch(Actions.timeSetNode(nodeTime, cycle))
        },
        registerChangeHandler: (v) => {
            dispatch(Actions.changeRegister(v))
        },
        changeALUHandler: (v) => {
            dispatch(Actions.changeALU(v))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tools)