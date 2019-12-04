import React, {createContext, useContext, useState} from "react"
import PropTypes from "prop-types"

const PersonContext = createContext([{}, {}])
const usePerson = () => useContext(PersonContext)

const PersonContextProvider = props => {
  const [state, setState] = useState({})

  return (
    <PersonContext.Provider value={[state, setState]}>
      {props.children}
    </PersonContext.Provider>
  )
}

PersonContextProvider.propTypes = {
  children: PropTypes.any,
}

export {PersonContextProvider, usePerson}
