export interface PaymentIntentResponse {
    sessionId: string;
    success: boolean;
    message: string;
    url: string;
}


export interface CreateSessionResponse {
    sessionId: string;
}