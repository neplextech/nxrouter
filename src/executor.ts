/**
 * HTTP method types supported by the router
 */
export type HttpMethod = (typeof HTTP_METHODS)[number];

/**
 * Extended RequestInit interface with query parameter support
 */
export type ApiRequestInit = RequestInit & {
    /** Query parameters to append to the URL */
    query?: Record<string, string | number>;
};

/**
 * Utility type to extract response types from route definitions
 * This transforms route definitions with $method properties into callable methods
 */
export type ExtractResponse<T> = T extends {
    $get?: infer R1;
    $post?: infer R2;
    $put?: infer R3;
    $delete?: infer R4;
    $patch?: infer R5;
    $head?: infer R6;
    $options?: infer R7;
    $connect?: infer R8;
    $trace?: infer R9;
    toString?: infer R10;
    toJSON?: infer R11;
    valueOf?: infer R12;
}
    ? {
          $get(init?: ApiRequestInit): Promise<R1>;
          $post(init?: ApiRequestInit): Promise<R2>;
          $put(init?: ApiRequestInit): Promise<R3>;
          $delete(init?: ApiRequestInit): Promise<R4>;
          $patch(init?: ApiRequestInit): Promise<R5>;
          $head(init?: ApiRequestInit): Promise<R6>;
          $options(init?: ApiRequestInit): Promise<R7>;
          $connect(init?: ApiRequestInit): Promise<R8>;
          $trace(init?: ApiRequestInit): Promise<R9>;
          toString(): string;
          toJSON(): string;
          valueOf(): string;
      }
    : {};

/**
 * Recursive type to expand route definitions
 * This transforms the route definition into a callable API with method implementations
 */
export type Expand<T> = T extends (...args: infer A) => infer R
    ? ((...args: A) => Expand<R>) & ExtractResponse<T>
    : T extends object
    ? {
          [K in keyof T]: Expand<T[K]>;
      } & ExtractResponse<T>
    : never;

/**
 * Supported HTTP methods
 */
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE'] as const;

// reflectors
const REFLECTORS = ['toString', 'toJSON', 'valueOf'] as const;

/**
 * Creates a router instance for making API calls based on your route definitions
 *
 * @template T - The route definition type that describes the API structure
 * @param baseUrl - The base URL for all API requests
 * @param options - Configuration options for the router
 * @param options.interceptRequest - Optional function to intercept and modify requests before they are sent
 * @param options.interceptResponse - Optional function to intercept and transform responses
 * @returns A proxy object that implements the route definition
 *
 * @example
 * ```typescript
 * interface Routes {
 *   users: (id: string) => {
 *     profile: {
 *       $get: UserProfile
 *     }
 *   }
 * }
 *
 * const api = createRouter<Routes>('https://api.example.com')
 * const profile = await api.users('123').profile.$get()
 * // You can also call methods on intermediate nodes
 * const users = await api.users.$get()
 * ```
 */
export function createRouter<T>(
    baseUrl: string,
    options?: {
        interceptRequest?: (url: string, init: RequestInit) => [string, RequestInit];
        interceptResponse?: (res: Response) => Promise<any>;
    }
): Expand<T> {
    /**
     * Builds a URL from path segments and optional query parameters
     *
     * @param path - Array of path segments
     * @param query - Optional query parameters
     * @returns The complete URL
     */
    const buildUrl = (path: string[], query?: Record<string, string | number>) => {
        let url = `${baseUrl}/${path.map(encodeURIComponent).join('/')}`;
        if (query) {
            const params = new URLSearchParams();
            for (const [k, v] of Object.entries(query)) {
                params.append(k, String(v));
            }
            url += '?' + params.toString();
        }
        return url;
    };

    /**
     * Creates a method handler function for a specific HTTP method
     *
     * @param path - Array of path segments
     * @param method - HTTP method to use
     * @returns Function that makes the HTTP request
     */
    const createMethodHandler = (path: string[], method: HttpMethod) => {
        return async (init: ApiRequestInit = {}) => {
            const { query, ...restInit } = init;
            let url = buildUrl(path, query);
            let finalInit: RequestInit = { ...restInit, method };

            if (options?.interceptRequest) {
                [url, finalInit] = options.interceptRequest(url, finalInit);
            }

            const res = await fetch(url, finalInit);
            return options?.interceptResponse ? options.interceptResponse(res) : res.json();
        };
    };

    /**
     * Builds a proxy object that constructs API paths and handles method calls
     *
     * @param path - Array of path segments accumulated so far
     * @returns A proxy object that handles property access and function calls
     */
    const buildProxy = (path: string[]): any => {
        // Create a base function with HTTP method handlers
        const proxyTarget = function () {} as any;

        // Add HTTP method handlers directly to the target object
        for (const method of HTTP_METHODS) {
            const key = '$' + method.toLowerCase();
            proxyTarget[key] = createMethodHandler(path, method);
        }

        const handler: ProxyHandler<any> = {
            /**
             * Handles property access on the proxy
             * If the property starts with $, it's treated as an HTTP method
             * Otherwise, it's treated as a path segment
             */
            get(target, key: string) {
                // Check if the key is a reflector method
                if (REFLECTORS.includes(key as (typeof REFLECTORS)[number])) {
                    return () => buildUrl(path);
                }

                // If the property is already defined on the target (like an HTTP method handler)
                // return it directly
                if (key in target) {
                    return target[key];
                }

                // Otherwise treat it as a path segment
                return buildProxy([...path, key]);
            },
            /**
             * Handles function calls on the proxy
             * Parameters are converted to string and added to the path
             */
            apply(_, __, args: any[]) {
                return buildProxy([...path, ...args.map((arg) => String(arg))]);
            }
        };

        return new Proxy(proxyTarget, handler);
    };

    return buildProxy([]) as Expand<T>;
}
