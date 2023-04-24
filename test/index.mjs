import { NxRouter } from '../dist/index.mjs';

const BASE = 'https://my-json-server.typicode.com/typicode';

const client = new NxRouter({
    async onRequest(options) {
        console.log(`Requesting ${options.path}`);
        const res = await fetch(`${BASE}${options.path}`, {
            method: options.method,
            ...options.data
        });

        if (!res.ok) throw new Error(`Failed with status code ${res.status}`);

        return await res.json();
    }
});

// get /demo/posts
console.log(await client.api.demo.posts.get());

// get /demo/posts/1
console.log(await client.api.demo.posts(1).get());
