const isUndefined = (elem) => {
  return elem === undefined;
};

const isDefined = (elem) => {
  return !isUndefined(elem);
};

const isEmptyObject = (elem) => {
  if (typeof elem !== 'object')
    throw TypeError('parameter is not of type object');
  return isDefined(elem) && Object.keys(elem).length === 0;
};

export { isUndefined, isDefined, isEmptyObject };
