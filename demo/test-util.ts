/*
 * @Author: tackchen
 * @Date: 2025-12-02 22:42:06
 * @Description: Coding something
 */
import { watiNextFrame, withResolve } from 'link-dom-shared';

export type PromiseMaybe<T> = Promise<T> | T;

export function createUt <T extends Record<string, any> = Record<string, any>> () {
    const ctx = {} as T;
    let _curValue: any, _curExpect: any;
    return {
        ctx,
        // 初始化ctx
        setUp (fn: (ctx: Partial<T>)=>PromiseMaybe<Partial<T>|void>) {
            return wrap(async () => Object.assign(ctx, await fn(ctx)));
        },
        // 单击一组
        click (...items: (string|Element)[]) {
            return wrap(() => clickItems(items));
        },
        run (fn: (ctx: T)=>PromiseMaybe<void>) {
            return wrap(fn);
        },
        /**
         * 1. select 为选择器或dom节点：取dom与 v 比对，select不传，时默认为 #result 选择器
         * 2. select 为函数：取函数返回值与 v 比对
         */
        expect (
            select: string|Element|((ctx: T)=>PromiseMaybe<any>),
            v?: string|((ctx: T)=>PromiseMaybe<any>
        )) {
            return async () => {
                if (typeof v === 'undefined') {
                    v = select as string;
                    select = '#result';
                }
                let value: any = '';
                if (typeof select === 'function') {
                    value = await select(ctx);
                } else {
                    const node: Node = queryElement(select);
                    value = node.textContent;
                }

                if (typeof v === 'function')
                    v = await v(ctx);
                const expect: any = v;
                return { expect, value };
            };
        },
        wait (time = 0) {
            if (time) {
                return new Promise(resolve => setTimeout(resolve, time));
            }
            return new Promise(resolve => requestAnimationFrame(resolve));
        },
        // 判断一个结果是否为true
        true (v: boolean|((ctx: T)=>(PromiseMaybe<boolean>))) {
            return wrap(async () => {
                return typeof v === 'function' ? await v(ctx) : !!v;
            }, '__true');
        },
        /**
         * 对一些必须使用回调函数的场景使用resolve处理
         * 可以设置超时时间
         * ut.resolve((resolve, ctx) => {
         *     document.getElementById('btn')!.click(() => {
         *         resolve(true);
         *     }, 100);
         * });
         */
        resolve (fn: (resolve: (v: boolean)=>void, ctx: T) => void, timeout = 50) {
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
        test (...args: ((ctx?: any)=>any)[]) {
            return runTest(args, ctx);
        },
    };
}

export const ut = createUt();

async function runTest (args: ((ctx?: any)=>any)[], ctx: any) {
    await watiNextFrame();
    const startTime = Date.now();
    let count = 0;
    let success = 0;
    const failItems: {index: number, expect: any, value: any}[] = [];
    for (const item of args) {
        // @ts-ignore
        if (item.__exe) {
            // 执行函数
            await item(ctx);
        } else {
            // 测试函数
            count ++;
            const { expect, value } = await item(ctx);
            const bool = expect === value;
            if (bool) {
                success ++;
            }
            console.log(
                bool ? '\x1b[32m%s\x1b[0m' : '\x1b[31m%s\x1b[0m',
                `[test_info] ${count}: ${bool ? 'success' : 'fail'} ( value=${value};${!bool ? `expect=${expect}` : ''} )`
            );
            if (!bool) {
                failItems.push({
                    index: count,
                    expect,
                    value,
                });
            }
        }
    }
    const totalSuccess = success === count;
    const elapse = Date.now() - startTime;
    console.log(
        totalSuccess ? '\x1b[32m%s\x1b[0m' : '\x1b[31m%s\x1b[0m',
        `[test_info] summary: ${success}/${count} ${totalSuccess ? 'success' : 'fail'}; elapse: ${elapse}ms;`
    );
    return {
        success: totalSuccess,
        count,
        successCount: count,
        failItems,
        elapse,
    };
}

async function clickItems (items: (string|Element)|(string|Element)[]) {
    if (!Array.isArray(items)) items = [ items ];
    const elements = items.map(item => queryElement(item));
    for (const element of elements) {
        // @ts-ignore
        element!.click();
        await Promise.resolve();
    }
}

function wrap<T> (fn: T, key = '__exe'): T {
    // @ts-ignore
    fn[key] = true;
    return fn;
}

function queryElement (select: string|Element) {
    if (typeof select === 'string') {
        return document.querySelector(select)!;
    }
    return select;
}