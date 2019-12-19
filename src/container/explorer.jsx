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
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Explorer)