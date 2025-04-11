# nxrouter

Simple, functional http-client router for JavaScript/TypeScript built on top of the Fetch API. It allows you to define a router with type-safe endpoints and methods, making it easy to work with APIs in a structured way.

## Features

-   Easy to setup
-   Functional API
-   Type-safe endpoints with TypeScript
-   Zero dependencies
-   Tiny footprint
-   Flexible routing with methods on any node level

## Installation

```sh
$ npm install --save nxrouter
```

## Example

```ts
import { createRouter } from 'nxrouter';

// Define response types
type UserProfile = { id: string; name: string };
type UserPost = { id: number; title: string };
type SearchResult = { id: number; type: 'user' | 'post'; match: string };
type UserList = { users: { id: string; name: string }[] };

// Define a callable users node with its own methods
interface UsersNode {
    (id: string): {
        profile: {
            $get: UserProfile;
            $put: void;
        };
        posts: {
            $get: UserPost[];
            $post: void;
        };
    };
    $get: UserList; // Method on the users node itself
}

// Define route structure with response types
interface Routes {
    users: UsersNode;
    search: {
        $get: SearchResult[];
    };
}

// Create router instance
const api = createRouter<Routes>('https://api.example.com', {
    // Optional response interceptor
    interceptResponse: async (res) => {
        if (!res.ok) throw new Error(`Failed with status code ${res.status}`);
        return res.json();
    }
});

// Use the API with full type safety
async function main() {
    // GET /users
    const userList = await api.users.$get();
    // userList is typed as UserList

    // GET /users/abc/profile
    const profile = await api.users('abc').profile.$get();
    // profile is typed as UserProfile

    // GET /users/abc/posts
    const posts = await api.users('abc').posts.$get();
    // posts is typed as UserPost[]

    // GET /search?q=dogs
    const results = await api.search.$get({ query: { q: 'dogs' } });
    // results is typed as SearchResult[]

    // log the generated path
    console.log(api.users('abc').profile.toString()); // /users/abc/profile
}
```

## HTTP Methods

The router supports all standard HTTP methods with the `$method` pattern:

```ts
// GET request
await api.endpoint.$get();

// POST request with body
await api.endpoint.$post({
    body: JSON.stringify({ data: 'value' }),
    headers: { 'Content-Type': 'application/json' }
});

// PUT request
await api.endpoint.$put();

// DELETE request
await api.endpoint.$delete();

// PATCH request
await api.endpoint.$patch();

// OPTIONS request
await api.endpoint.$options();

// HEAD request
await api.endpoint.$head();

// TRACE request
await api.endpoint.$trace();

// CONNECT request
await api.endpoint.$connect();
```

## Query Parameters

You can pass query parameters using the `query` property:

```ts
// GET /search?q=term&page=2
const results = await api.search.$get({
    query: {
        q: 'term',
        page: 2
    }
});
```

## Request Interceptors

You can intercept requests before they're sent:

```ts
const api = createRouter('https://api.example.com', {
    interceptRequest: (url, init) => {
        // Add headers, modify URL, etc.
        return [
            url,
            {
                ...init,
                headers: {
                    ...init.headers,
                    Authorization: 'Bearer token'
                }
            }
        ];
    }
});
```

## Response Interceptors

Transform responses before they're returned:

```ts
const api = createRouter('https://api.example.com', {
    interceptResponse: async (res) => {
        if (!res.ok) {
            // Handle error responses
            const error = await res.json();
            throw new Error(error.message);
        }
        return res.json();
    }
});
```
