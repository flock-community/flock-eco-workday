export function PageableClient(path) {

  const findAllByPage = ({page, size, sort}) => {
    const opts = {
      method: 'GET',
    }
    return fetch(`${path}?page=${page || 0}&size=${size || 20}`, opts)
      .then(res => res.json())
  }

  return {findAllByPage}

}
