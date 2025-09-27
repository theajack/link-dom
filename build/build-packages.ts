/*
 * @Author: chenzhongsheng
 * @Date: 2024-10-10 19:56:55
 * @Description: Coding something
 */
import fs from 'fs-extra';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { version } from '../package.json';

let packages: string[] = [];

function resolve (v: string) {
    return path.resolve(__dirname, v);
}

if (process.argv[2]) {
    packages = process.argv[2].split(',');
} else {
    packages = fs.readdirSync(
        resolve('../packages')
    );
}

console.log(packages);
for (const name of packages) {
    const data = execSync(`npx vite build -m=sdk_${name}`);
    console.log(data.toString());
    const data2 = execSync(`npx vite build -m=iife_${name}`);
    console.log(data2.toString());
    execSync(concatDts([
        `packages/${name}/dist/index.d.ts`,
        `packages/${name}/src/index.ts`,
    ]));
    fs.writeFileSync(
        resolve(`../packages/${name}/dist/package.json`),
        genePkgJson(name),
    );
    fs.copySync(
        resolve(`../packages/${name}/dist/iife/${name}.iife.min.js`),
        resolve(`../packages/${name}/dist/${name}.iife.min.js`),
    );
    fs.removeSync(resolve(`../packages/${name}/dist/iife`));
    fs.copySync(
        resolve(`../LICENSE`),
        resolve(`../packages/${name}/dist/LICENSE`),
    );
    fs.copySync(
        resolve(`../README.md`),
        resolve(`../packages/${name}/dist/README.md`),
    );
}

function genePkgJson (name: string) {

    const pkg = require(resolve(`../packages/${name}/package.json`));

    const deps = pkg.dependencies || {};

    for (const k in deps) {
        deps[k] = version;
    }

    return JSON.stringify({
        'name': `link-dom${name === 'core' ? '' : `-${name}`}`,
        'version': version,
        'description': 'Compilation-free Reactive Chainable Call UI Library',
        'repository': 'https://github.com/theajack/link-dom',
        'keywords': [
            'UI library',
            'Link-Dom',
            'Compilation-free'
        ],
        'author': 'theajack',
        'license': 'MIT',
        'bugs': {
            'url': 'https://github.com/theajack/link-dom/issues/new'
        },
        'homepage': 'https://theajack.github.io/jsbox?config=theajack.link-dom',
        'publishConfig': {
            'registry': 'https://registry.npmjs.org/',
            'tag': 'latest'
        },
        'dependencies': deps,
        'main': `${name}.cjs.min.js`,
        'module': `${name}.es.min.js`,
        'unpkg': `${name}.iife.min.js`,
        'jsdelivr': `${name}.iife.min.js`,
        'typings': 'index.d.ts'
    }, null, 4);
}

function concatDts (io) {
    return [
        'npx dts-bundle-generator -o',
        ...io,
        '--no-check',
        '--no-banner',
        '--external-inlines',
        '', // 合并第三方包的dts信息
    ].join(' ');
}