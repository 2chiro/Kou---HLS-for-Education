import {connect} from 'react-redux'
import React from 'react'

import Actions from '../action'
import TextBox from '../component/textbox'

const mapStateToProps = state => {
    return state
}

const mapDispatchToProps = dispatch => {
    return {
        chageCodeHandler: (value) => {
            dispatch(Actions.changeCode(value))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TextBox)