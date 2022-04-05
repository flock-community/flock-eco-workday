type Page<T> = {
  total: number;
  list: T[];
};

type PageInput = {
  page: number;
  size: number;
  sort: string;
  query?: object;
};

export function PageableClient<Out, OutRaw>(path: string, internalize?: (input: OutRaw) => Out) {
  const findAllByPage: (input: PageInput) => Promise<Page<Out>> = ({
    page,
    size,
    sort,
    query
  }) => {
    const opts = {
      method: "GET",
    };

    const params = Object.assign({ page, size, sort}, query)

    const queryString = Object.keys(params)
      .filter((key) => params[key])
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    return fetch(`${path}?${queryString}`, opts).then((res) =>
      res
        .json()
        .then((json) => {
          if (!Array.isArray(json)) {
            throw new Error("Json is not an array");
          }
          return {
            total: parseInt(res.headers.get("x-total") || "0", 10),
            list: json as OutRaw[]
          };
        })
        .then((it) => {
            const list = internalize ? it.list.map(internalize) : (it.list as unknown as Out[]);
            return {...it, list: list};
        })
    );
  };

  return { findAllByPage };
}
