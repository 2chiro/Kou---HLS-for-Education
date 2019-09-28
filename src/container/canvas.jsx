import {connect} from 'react-redux'
import React from 'react'

import Canvas from '../component/canvas'

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps)(Canvas)