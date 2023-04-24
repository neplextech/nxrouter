# nxrouter

Simple, functional http-client router for JavaScript/TypeScript

# Features

* Easy to setup
* Functional API
* Works with any http client
* Simple API
* Zero dependencies
* TypeScript support

# Installation

```sh
$ npm install --save nxrouter
```

# Example

```ts
import { NxRouter, MethodImplementor, ParamArgs } from 'nxrouter';

// optional API routes definition
interface ApiRoutes {
    demo: {
        posts: MethodImplementor<{
            (id: ParamArgs): MethodImplementor;
        }>;
    }
}

// base url endpoint
const BASE = 'https://my-json-server.typicode.com/typicode';

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

// log the value
console.log(client.api.demo.posts(5).toString());
// -> /demo/posts/5
```

## Request Methods

```js
const client = new NxRouter<OptionalRouteDefinition>(...);

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

## Reflection Methods

```js
const client = new NxRouter<OptionalRouteDefinition>(...);

// path result
client.api.toString();
client.api.toJSON();
client.api.valueOf();
```