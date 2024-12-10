export interface Product {
    _id?: string;
    name: string;
    barcode: string;
    description: string;
    category?: string;
    stock?: number;
    price?: number;
    createdAt?: Date;
    updatedAt?: Date;
}