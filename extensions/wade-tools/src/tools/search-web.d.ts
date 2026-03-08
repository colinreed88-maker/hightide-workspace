import { type ToolResult } from "../types.js";
export declare const definition: {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            query: {
                type: string;
                description: string;
            };
            max_results: {
                type: string;
                description: string;
            };
            search_depth: {
                type: string;
                enum: string[];
                description: string;
            };
            topic: {
                type: string;
                enum: string[];
                description: string;
            };
            include_domains: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            exclude_domains: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
        };
        required: string[];
    };
};
export declare function execute(_id: string, params: Record<string, unknown>): Promise<ToolResult>;
