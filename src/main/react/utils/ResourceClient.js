export const ExtractJSON = res => {
  if (res.ok) {
    if (res.status === 204) {
      return null;
    }
    return res.json();
  }
  return res.text().then(message => {
    throw new Error(message);
  });
};

export function ResourceClient(path, internalize) {
  const all = () => {
    const opts = {
      method: "GET"
    };
    return fetch(`${path}`, opts)
      .then(ExtractJSON)
      .then(it => (internalize ? it.map(internalize) : it));
  };

  const get = id => {
    const opts = {
      method: "GET"
    };
    return fetch(`${path}/${id}`, opts)
      .then(ExtractJSON)
      .then(it => (internalize ? internalize(it) : it));
  };

  const post = item => {
    const opts = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(item)
    };
    return fetch(path, opts)
      .then(ExtractJSON)
      .then(it => (internalize ? internalize(it) : it));
  };

  const put = (id, item) => {
    const opts = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(item)
    };
    return fetch(`${path}/${id}`, opts)
      .then(ExtractJSON)
      .then(it => (internalize ? internalize(it) : it));
  };

  const del = id => {
    const opts = {
      method: "DELETE"
    };
    return fetch(`${path}/${id}`, opts).then(ExtractJSON);
  };

  return { all, get, post, put, delete: del };
}
