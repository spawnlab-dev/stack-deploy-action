/**
 * A simple abstract base client implementation
 */
export declare abstract class Client {
    abstract host: string;
    abstract api_token: string;
    abstract deploy(stack_name: string, compose_file: string): Promise<void>;
    abstract delete(stack_name: string): Promise<void>;
    abstract isPresent(stack_name: string): Promise<boolean>;
}
