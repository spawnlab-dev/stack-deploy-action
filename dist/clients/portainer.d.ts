/**
 * Portainer http client wrapper for docker swarm
 * stack management.
 */
import { Headers } from 'node-fetch';
import { Client } from './client.js';
export declare class PortainerClient extends Client {
    private stackBasePath;
    private stack;
    host: string;
    api_token: string;
    endPointId: string;
    swarmId: string;
    constructor(host: string, api_token: string, endPointId: string, swarmId: string);
    deploy(stack_name: string, compose_file: string): Promise<void>;
    delete(stack_name: string): Promise<void>;
    isPresent(stack_name: string): Promise<boolean>;
    getRequestHeader(): Headers;
    private getAllStacks;
}
