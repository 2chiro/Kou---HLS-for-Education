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
        cycleChangeHandler: (v, tabId) => {
            dispatch(Actions.changeCycle(v, tabId))
        },
        SdfgArrangeHandler: (tabId) => {
            dispatch(Actions.arrangeCoordinates(tabId))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tools)