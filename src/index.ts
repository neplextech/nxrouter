export * from './executor';

function $version(): string {
    'use macro';

    const { readFileSync } = require('node:fs');
    const data = readFileSync('./package.json', 'utf8');
    const json = JSON.parse(data);

    return json.version;
}

/**
 * The version of the package.
 */
export const version: string = $version();
