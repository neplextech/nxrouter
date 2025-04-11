import { createRouter } from '../src/index';

// base url endpoint
const BASE = 'https://my-json-server.typicode.com/typicode';

// Define API types
interface Post {
    id: number;
    title: string;
}

// Define route structure with response types
interface ApiRoutes {
    demo: {
        posts: {
            (id: string | number): { $get: Post };
            $get: Post[]; // Return type definition, not the actual method
        };
        $get: { name: string; description: string }; // Method on the demo node itself
    };
}

// Create router instance
const client = createRouter<ApiRoutes>(BASE, {
    // Optional response interceptor
    interceptResponse: async (res) => {
        if (!res.ok) throw new Error(`Failed with status code ${res.status}`);
        return res.json();
    }
});

// Test API calls
async function runTest() {
    // Log request path
    console.log('Request path for posts:', client.demo.posts);

    // initiate GET /demo/posts
    console.log('Getting all posts:');
    console.log(await client.demo.posts.$get());

    // initiate GET /demo/posts/1
    console.log('Getting post with id 1:');
    console.log(await client.demo.posts(1).$get());

    // Testing method on a node that also has child routes
    // initiate GET /demo
    console.log('Getting demo info:');
    console.log(await client.demo.$get());

    // testing string
    console.log('Testing string:');
    console.log(client.demo.posts('1').toString());
}

runTest().catch(console.error);
