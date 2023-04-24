import { NxRouter, MethodImplementor, ParamArgs } from '../src/index';

// base url endpoint
const BASE = 'https://my-json-server.typicode.com/typicode';

interface ApiRoutes {
    demo: {
        posts: MethodImplementor<{
            (id: ParamArgs): MethodImplementor;
        }>;
    };
}

// nxrouter
const client = new NxRouter<ApiRoutes>({
    // request implementor
    async onRequest(options) {
        console.log(`Requesting ${options.path}`);

        // here we make request using fetch api
        const res = await fetch(`${BASE}${options.path}`, {
            method: options.method,
            ...options.data
        });

        if (!res.ok) throw new Error(`Failed with status code ${res.status}`);

        // and return json response
        return await res.json();
    }
});

interface APIResponse {
    id: number;
    title: string;
}

// initiate GET /demo/posts
console.log(await client.api.demo.posts.get<APIResponse[]>());

// initiate GET /demo/posts/1
console.log(await client.api.demo.posts(1).get<APIResponse>());
