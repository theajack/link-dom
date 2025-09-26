/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-26 23:49:08
 * @Description: Coding something
 */

import fs from 'fs-extra';
import { execSync } from 'node:child_process';
import path from 'node:path';


function resolve (v: string) {
    return path.resolve(__dirname, v);
}
const packages = fs.readdirSync(
    resolve('../packages')
);


for (const name of packages) {
    console.log(`publish ${name}`);
    execSync(`cd ${resolve(`../packages/${name}/dist`)} && npm publish`);
}