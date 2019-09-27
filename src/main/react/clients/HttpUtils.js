function get(endpoint, queryparams) {

    return fetch(buildQuery(endpoint, queryparams))
        .then(res => {
            if (res.status === 200) {
                return res.json()
            } else {
                throw res.json()
            }
        })
}

function post(endpoint, queryparams, body) {
    const opts = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    };

    fetch(buildQuery(endpoint, queryparams), opts)
}

function buildQuery(endpoint, queryparams) {
    return endpoint + (queryparams ? '?' + queryparams : '');
}

export const HttpUtils = {
    get,
    post
};