import { BASE_URL, PRODUCT_DESCRIPTION_API_URL } from "@/constants";
import { Product } from "@/types/product";
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const scanAndFetchProduct = async (barcode: string) => {
    try {
        const response = await fetch(`/api/product/${barcode}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data.product);
        return data.product;
    } catch (error) {
        console.log(`Error scanning and saving product: ${error}`);
        throw new Error(`Error scanning and saving product: ${error}`);
    }
}

export const createProduct = async (product: Product) => {
    try {
        const response = await axiosInstance.post('/products', product);
        return response.data;
    } catch (error) {
        console.log(`Error creating product: ${error}`);
        throw new Error(`Error creating product: ${error}`);
    }
}