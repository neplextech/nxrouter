// todo: allow typed routes

import type { NxRouter, NxRequestMethod } from './index';

const REFLECTORS = ["toJSON", "toString", "valueOf"] as const;
const METHODS: Array<Lowercase<NxRequestMethod>> = ["get", "put", "post", "patch", "delete", "connect", "head", "trace", "options"];
const noop = () => undefined;

type ParamArgs = string | number | boolean;

export type ProxyHandlerReq = {
    [prop in Lowercase<NxRequestMethod>]: <T = unknown>(data?: unknown) => Promise<T>;
};

export type ProxyReflectorHandler = {
    [prop in (typeof REFLECTORS)[number]]: (data?: { query: Record<string, string> }) => string;
};

export type NestedRouteCalls = {
    (...args: ParamArgs[]): NxRouterExecutor;
    [prop: string]: NxRouterExecutor;
};

export type PathRegisterFunc = NestedRouteCalls & NxRouterExecutor;

export type ProxyHandlerPath = {
    [prop: string]: PathRegisterFunc;
};

export type NxRouterExecutor = ProxyHandlerReq & ProxyReflectorHandler & ProxyHandlerPath & NestedRouteCalls;

export function createRouter(nx: NxRouter): NxRouterExecutor {
    const params: string[] = [];

    const handler = {
        get(_target, p: string, _receiver) {
            if (METHODS.indexOf(p as typeof METHODS[number]) !== -1) {
                return (data?: object & { query?: Record<string, string> }) => {
                    const queryParams = data?.query
                        ? Object.entries(data.query)
                            .map(([m, n]) => `${m}=${n}`)
                            .join("&")
                        : null;
                    return nx.dispatchRequest({
                        path: `/${params.join("/")}${queryParams ? "?" + queryParams : ""}`,
                        data: data || {},
                        method: p.toUpperCase() as NxRequestMethod
                    });
                };
            } else if (REFLECTORS.includes(p as (typeof REFLECTORS)[number])) {
                return (data?: { query?: Record<string, string> }) => {
                    const queryParams = data?.query
                        ? Object.entries(data.query)
                            .map(([m, n]) => `${m}=${n}`)
                            .join("&")
                        : null;
                    return `/${params.join("/")}${queryParams ? "?" + queryParams : ""}`;
                };
            }

            params.push(p);
            return new Proxy(noop, handler);
        },
        apply(_target, _thisArg, argArray) {
            params.push(...argArray.filter((x) => x != null));
            return new Proxy(noop, handler);
        }
    } as ProxyHandler<typeof noop>;

    return new Proxy(noop, handler) as unknown as NxRouterExecutor;
}