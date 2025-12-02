/*
 * @Author: tackchen
 * @Date: 2025-12-02 22:42:06
 * @Description: Coding something
 */
import { watiNextFrame, withResolve } from 'link-dom-shared';

export const utils = (() => {
    const ctx = {};
    let valueGet: ()=>any = () => undefined;
    let _curValue: any, _curExpect: any;
    return {
        setUp (fn: (ctx: any)=>void) {
            return wrap(async () => Object.assign(ctx, await fn(ctx)));
        },
        setUpValue (fn: (ctx: any)=>(()=>void)) {
            return wrap(async () => (valueGet = await fn(ctx)));
        },
        click (item: string|string[]) {
            return wrap(() => clickItems(item));
        },
        run (fn: ()=>void) {
            return wrap(fn);
        },
        expect (v: any) {
            return async () => {
                if (typeof v === 'function')
                    v = await v(ctx);
                _curExpect = v;
                _curValue = valueGet();
                return _curValue === _curExpect;
            };
        },
        true (v: boolean|((ctx: any)=>(boolean|Promise<boolean>))) {
            return wrap(async () => {
                return typeof v === 'function' ? await v(ctx) : !!v;
            }, '__true');
        },
        resolve (fn: (resolve: (v: any)=>void, ctx: any) => void, timeout = 50) {
            return this.true(() => {
                const { ready, resolve } = withResolve();
                fn(resolve, ctx);
                setTimeout(() => {
                    resolve(false);
                }, timeout);
                return ready;
            });
        },
        __getValue () {
            return [ _curValue, _curExpect ];
        },
        runTest,
        test: runTest,
    };
})();

export const ut = utils;

async function runTest (
    ...args: (()=>any)[]
) {
    await watiNextFrame();

    let count = 0;
    let success = 0;
    for (const item of args) {
        // @ts-ignore
        if (item.__exe) {
            await item();
        } else {
            count ++;
            const bool = await item();
            if (bool) {
                success ++;
            }
            const [ value, expect ] = (item as any).__true ? [ bool, true ] : utils.__getValue();
            console.log(
                bool ? '\x1b[32m%s\x1b[0m' : '\x1b[31m%s\x1b[0m',
                `[test_info] ${count}: ${bool ? 'success' : 'fail'} ( value=${value};${!bool ? `expect=${expect}` : ''} )`
            );
        }
    }
    const totalSuccess = success === count;
    console.log(
        totalSuccess ? '\x1b[32m%s\x1b[0m' : '\x1b[31m%s\x1b[0m',
        `[test_info] total: ${success}/${count} ${totalSuccess ? 'success' : 'fail'}`
    );
}

async function clickItems (item: string|string[]) {
    if (typeof item === 'string') item = [ item ];

    for (const id of item) {
        document.getElementById(id)!.click();
        await Promise.resolve();
    }
}

function wrap<T> (fn: T, key = '__exe'): T {
    // @ts-ignore
    fn[key] = true;
    return fn;
}