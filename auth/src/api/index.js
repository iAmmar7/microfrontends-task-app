import axios from "axios";

import errorMapper from "./errorMapper";

const BASE_URL = "http://localhost:8000";
const CONTENT_TYPE = {
  JSON: "application/json",
  MULTIPART: "multipart/form-data",
};

export default class API {
  constructor(
    baseURL,
    token,
    config = {
      headers: { contentType: CONTENT_TYPE.JSON },
    },
    tokenType = "Bearer"
  ) {
    this.token = token;
    this.config = {
      baseURL: baseURL || BASE_URL,
      headers: {
        "Content-Type": config?.headers?.contentType ?? CONTENT_TYPE.JSON,
      },
      timeout: 30000,
      ...(config.responseType && { responseType: config.responseType }),
    };
    this.instance = axios.create(this.config);

    // Request interceptor for API calls
    this.instance.interceptors.request.use(async (axiosConfig) => {
      const accessToken = localStorage.getItem("access_token");
      const originalConfig = {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          Authorization: `${tokenType} ${this.token || accessToken}`,
        },
      };
      return originalConfig;
    });

    // Response interceptor for API calls
    this.instance.interceptors.response.use(
      (response) => {
        if (response.status === 200 || response.status === 206) {
          if (response.data?.access_token)
            localStorage.setItem("access_token", response.data?.access_token);
          return response.data;
        }
        throw errorMapper(response);
      },
      async (error) => {
        console.log("Error from the API", error);
        throw errorMapper(error);
      }
    );
  }

  get(url, id, params) {
    let endpoint = url;
    if (id) {
      endpoint += `/${id}`;
    }
    return this.instance.get(endpoint, { params });
  }

  post(url, body, params, id) {
    let endpoint = url;
    if (id) {
      endpoint += `/${id}`;
    }
    return this.instance.post(endpoint, body, { params });
  }

  delete(url, id, params) {
    let endpoint = url;
    if (id) {
      endpoint += `/${id}`;
    }
    return this.instance.delete(endpoint, { params });
  }

  put(url, body, id) {
    let endpoint = url;
    if (id) {
      endpoint += `/${id}`;
    }
    return this.instance.put(endpoint, body);
  }

  patch(url, body) {
    return this.instance.patch(url, body);
  }
}