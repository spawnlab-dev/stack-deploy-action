/**
 * Custom client exceptions
 */
export declare class ClientError extends Error {
    clientType: string;
    constructor(message: string, clientType: string);
}
