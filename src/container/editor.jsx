import {connect} from 'react-redux'
import React from 'react'

import Editor from '../component/editor'

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps)(Editor)