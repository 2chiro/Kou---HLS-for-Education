import {connect} from 'react-redux'
import React from 'react'

import TextBox from '../component/textbox'

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps)(TextBox)