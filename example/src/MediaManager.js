const serialize = (obj, prefix) => {
  var str = [],
    p;
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p,
        v = obj[p];
      str.push(
        v !== null && typeof v === "object"
          ? serialize(v, k)
          : encodeURIComponent(k) + "=" + encodeURIComponent(v)
      );
    }
  }
  return str.join("&");
};

const get = (url, params = {}, opts = {}) =>
  fetch(`${url}?${serialize(params)}`, opts);

const post = (url, params = {}, opts = {}) =>
  fetch(
    url,
    Object.assign(
      {
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify(params),
      },
      opts
    )
  );

const put = (url, params = {}, opts = {}) =>
  fetch(
    url,
    {
      method: "PUT",
      credentials: "same-origin",
      body: JSON.stringify(params),
      ...opts
    },
  );

const del = (url, params = {}, opts = {}) =>
  fetch(
    url,
    Object.assign(
      {
        method: "DELETE",
        credentials: "same-origin",
        body: JSON.stringify(params),
      },
      opts
    )
  );

export default class MediaManager {
  constructor(baseUrl, api_key) {
    this.baseUrl = baseUrl;
    this.api_key = api_key;
  }

  findAll(callback, params = {}, page_size = 100) {
    get(
      `${this.baseUrl}images`,
      { page_size, ...params },
      {
        headers: { Authorization: `Bearer ${this.api_key}` },
      }
    )
      .then((r) => r.json())
      .then((images) => callback(images));
  }

  uploadFile(file, callback) {
    const body = new FormData();
    body.append("image", file);

    post(
      `${this.baseUrl}images`,
      {},
      { body, headers: { Authorization: `Bearer ${this.api_key}` } }
    )
      .then((r) => r.json())
      .then((image) => callback(image));
  }

  destroy(image, callback) {
    del(
      `${this.baseUrl}images/${image.id}`,
      {},
      {
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${this.api_key}`,
        },
      }
    )
      .then((r) => r.json())
      .then((image) => callback(image));
  }

  update(image, updates, callback) {
    const params = {
      image: {
        ...updates
      }
    };

    put(`${this.baseUrl}images/${image.id}`, params, { headers: { Authorization: `Bearer ${this.api_key}`, 'Content-Type': 'application/json' } })
      .then((r) => r.json())
      .then((image) => callback(image));
  }
}
