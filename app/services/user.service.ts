import { httpClient } from "./http-client";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar?: string;
}

export const userService = {
  async getCurrentUser() {
    return httpClient.get<UserProfile>("/users/me");
  },

  async updateProfile(data: Partial<UserProfile>) {
    return httpClient.put("/users/me", data);
  },

  async updateAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);
    return httpClient.post("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
