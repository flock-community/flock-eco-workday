import React, {forwardRef} from "react"
import PropTypes from "prop-types"
import {Slide} from "@material-ui/core"

/* eslint-disable-next-line react/display-name */
const TransitionSlider = forwardRef((props, ref) => (
  <Slide direction={props.direction} ref={ref} {...props} />
))

TransitionSlider.propTypes = {
  direction: PropTypes.string.isRequired,
}

export {TransitionSlider}
