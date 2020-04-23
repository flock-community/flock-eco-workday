export function PageableClient(path, internalize) {
  const findAllByPage = ({page, size, sort}) => {
    const opts = {
      method: "GET",
    }
    const params = {page, size, sort}
    const query = Object.keys(params)
      .filter(key => params[key])
      .map(key => `${key}=${params[key]}`)
      .join("&")
    return fetch(`${path}?${query}`, opts).then(res =>
      res
        .json()
        .then(json => ({
          total: res.headers.get("x-total"),
          list: json,
        }))
        .then(it => (internalize ? it.map(internalize) : it))
    )
  }

  return {findAllByPage}
}
