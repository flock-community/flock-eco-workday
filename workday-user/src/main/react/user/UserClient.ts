import {User} from '../graphql/user'

function internalize<T>(res): Promise<T> {
  if (res.ok) {
    if (res.status === 204) {
      return null
    } else {
      return res.json()
    }
  } else {
    return res.text().then((text) => {
      throw new Error(text)
    })
  }
}

export function findAllAuthorities() {
  return fetch('/api/authorities').then((res) => internalize<string[]>(res))
}

export function findUsersMe() {
  return fetch(`/api/users/me`).then((res) => internalize<User>(res))
}

export function findAllUsers(
  search,
  page,
  size,
): Promise<{list: User[]; count: number}> {
  return fetch(
    `/api/users?search=${search}&page=${page}&size=${size}&sort=name,ignoreCase`,
  ).then((res) =>
    internalize<User[]>(res).then((json) => ({
      list: json,
      count: parseInt(res.headers.get('x-total')),
    })),
  )
}

export function findAllUserByids(ids) {
  const opts = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(ids),
  }
  return fetch(`/api/users/search`, opts).then((res) =>
    internalize<User[]>(res),
  )
}

export function findUserByid(id) {
  const opts = {
    method: 'GET',
  }
  return fetch(`/api/users/${id}`, opts).then((res) => internalize<User>(res))
}

export function createUser(item) {
  const opts = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(item),
  }
  return fetch('/api/users', opts).then((res) => internalize<User>(res))
}

export function updateUser(id, item) {
  const opts = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(item),
  }
  return fetch(`/api/users/${id}`, opts).then((res) => internalize<User>(res))
}

export function deleteUser(id) {
  const opts = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  }
  return fetch(`/api/users/${id}`, opts).then((res) => internalize<User>(res))
}

export function resetUserPassword(id) {
  const opts = {
    method: 'PUT',
  }
  return fetch(`/api/users/${id}/reset-password`, opts).then((res) =>
    internalize<User>(res),
  )
}

export default {
  findUsersMe,
  findAllAuthorities,
  findAllUsers,
  findUserByid,
  findAllUserByids,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
}