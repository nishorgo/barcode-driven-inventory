import { BASE_URL } from "@/constants";
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const TOKEN_KEY = 'auth_token';

// Function to save token to local storage
export const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Function to get token from local storage
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Function to remove token from local storage
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const login = async (username: string, password: string) => {
    try {
        const response = await axiosInstance.post("/auth/login", { username, password });
        const { token } = response.data;
        saveToken(token); // Save token after successful login
        return response.data;
    } catch (error) {
        throw error;
    }
};