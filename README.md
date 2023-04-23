# nxrouter

Simple, functional http-client router for JavaScript/TypeScript

# Features

* Easy to setup
* Functional API
* Works with any http client
* Simple API
* Zero dependencies

# Installation

```sh
$ npm install --save nxrouter
```

# Example

```ts
import { NxRouter } from 'nxrouter';

// base url endpoint
const BASE = 'https://my-json-server.typicode.com/typicode';

// nxrouter
const client = new NxRouter({
    // request implementor
    async onRequest(router, options) {
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
```

## Request Methods

```js
const client = new NxRouter(...);

// GET
client.api.get();

// PUT
client.api.put();

// POST
client.api.post();

// PATCH
client.api.patch();

// DELETE
client.api.delete();

// OPTIONS
client.api.options();

// HEAD
client.api.head();

// TRACE
client.api.trace();
```