import React, {createContext, useContext, useState} from "react"
import PropTypes from "prop-types"

const BreadcrumbsContext = createContext([null, null])
const useBreadcrumbs = () => useContext(BreadcrumbsContext)

const BreadcrumbsContextProvider = props => {
  const [state, setState] = useState([])

  return (
    <BreadcrumbsContext.Provider value={[state, setState]}>
      {props.children}
    </BreadcrumbsContext.Provider>
  )
}

BreadcrumbsContextProvider.propTypes = {
  children: PropTypes.any,
}

export {BreadcrumbsContextProvider, useBreadcrumbs}
