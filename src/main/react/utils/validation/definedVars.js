const isUndefined = elem => {
  return elem === undefined
}

const isDefined = elem => {
  return !isUndefined(elem)
}

export {isUndefined, isDefined}
