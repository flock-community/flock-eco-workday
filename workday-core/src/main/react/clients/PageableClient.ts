import {QueryParameters, toQueryString, validateResponse} from './utils'

interface Page<T> {
  list: T[]
  count: number
}

interface Pageable {
  page: number
  size: number
  sort: string
}

export function PageableClient<T>(path: string) {
  const queryByPage = (
    pageable: Pageable,
    queryParameters: QueryParameters,
  ): Promise<Page<T>> => {
    const opts = {
      method: 'GET',
    }

    const query = toQueryString({...pageable, ...queryParameters})

    return fetch(`${path}?${query}`, opts)
      .then((it) => validateResponse<T[]>(it))
      .then((it) => {
        if (it) {
          const total = it?.headers.get('x-total')
          return {
            list: it.body,
            count: total ? parseInt(total, 10) : 0,
          }
        } else {
          throw new Error('List not found')
        }
      })
  }

  const findAllByPage = (pageable: Pageable) => queryByPage(pageable, {})

  return {findAllByPage, queryByPage}
}
