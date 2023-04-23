import { createRouter } from "./executor";

export type NxRequestImplementor = <O = unknown, T = unknown>(router: NxRouter, options: NxRequestInit<O>) => Promise<T>;

export interface NxRequestInit<T = unknown> {
    path: string;
    method: NxRequestMethod;
    data: T;
}

export type NxRequestMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'CONNECT' | 'TRACE';

export interface NxRouterInit {
    onRequest: NxRequestImplementor;
}

export class NxRouter {
    /**
     * Create NxRouter client
     * @param options Options to initialize NxRouter
     */
    public constructor(public options: NxRouterInit) { }

    /**
     * NxRouter executor
     */
    public get api() {
        return createRouter(this);
    }

    /**
     * Simulate api request
     * @param options Options to execute this method
     * @returns req implementor's response
     */
    public dispatchRequest<O = unknown, T = unknown>(options: NxRequestInit<O>) {
        const fn = this.options.onRequest;

        if (typeof fn !== 'function') {
            throw new Error('request implementor not found');
        }

        return fn<O, T>(this, options);
    }
}
