export interface Item  {
    _id: string;
    title: string;
    price: number;
    qty: number;
}


export interface CreateOrderResponse { 
    orderId: string;
    items: {
        _id: string;
        title: string;
        price: number;
        qty: number;
    }[];
    totalPrice: number;
    shippingAddress: string;
    status: string;
    paymentSessionId: string;
}