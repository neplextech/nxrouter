import { createRouter } from '../dist/index.mjs';

const BASE = 'https://my-json-server.typicode.com/typicode';

// Create router instance
const client = createRouter(BASE, {
    interceptResponse: async (res) => {
        if (!res.ok) throw new Error(`Failed with status code ${res.status}`);
        return res.json();
    }
});

// Test API calls
async function runTest() {
    // Log request path for demo posts
    console.log('Request path for posts: /demo/posts');

    // GET /demo/posts
    console.log('Getting all posts:');
    console.log(await client.demo.posts.$get());

    // GET /demo/posts/1
    console.log('Getting post with id 1:');
    console.log(await client.demo.posts(1).$get());

    // testing string
    console.log('Testing string:');
    console.log(client.demo.posts('1').toString());
}

runTest().catch(console.error);
