type Page<T> = {
  total: number;
  list: T[];
};

type PageInput = {
  page: number;
  size: number;
  sort: string;
};

export function PageableClient<T>(path: string, internalize?: (input: T) => T) {
  const findAllByPage: (input: PageInput) => Promise<Page<T>> = ({
    page,
    size,
    sort,
  }) => {
    const opts = {
      method: "GET",
    };
    const params = { page, size, sort };
    const query = Object.keys(params)
      .filter((key) => params[key])
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    return fetch(`${path}?${query}`, opts).then((res) =>
      res
        .json()
        .then((json) => {
          if (!Array.isArray(json)) {
            throw new Error("Json is not an array");
          }
          return {
            total: parseInt(res.headers.get("x-total") || "0", 10),
            list: json as T[],
          };
        })
        .then((it) =>
          internalize ? { ...it, list: it.list.map(internalize) } : it
        )
    );
  };

  return { findAllByPage };
}
