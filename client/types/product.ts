export interface Product {
    id?: string;
    name: string;
    barcode: string;
    description: string;
    stock: number;
    price: number;
    createdAt?: Date;
    updatedAt?: Date;
}