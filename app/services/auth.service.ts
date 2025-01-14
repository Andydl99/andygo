import { httpClient } from "./http-client";

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

export const authService = {
  async login(params: LoginParams) {
    return httpClient.post("/auth/local", params);
  },

  async register(params: RegisterParams) {
    return httpClient.post("/auth/local/register", params);
  },

  async logout() {
    localStorage.removeItem("token");
  },
};
