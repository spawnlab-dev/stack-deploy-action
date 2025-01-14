/**
 * Swarmpit http client wrapper for docker swarm
 * stack management.
 */
import { Client } from './client.js';
export declare class SwarmpitClient extends Client {
    private stackBasePath;
    host: string;
    api_token: string;
    constructor(host: string, api_token: string);
    deploy(stack_name: string, compose_file: string): Promise<void>;
    delete(stack_name: string): Promise<void>;
    isPresent(stack_name: string): Promise<boolean>;
}
