

/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 21:28:27
 * @Description: Coding something
 */
import { isArrayOrJson } from 'link-dom-shared';
import { DepUtil } from './dep';
import { OriginTarget, ProxyTarget, deepAssign } from 'link-dom-shared';

export function observe (
    exp: ()=>any,
    fn: (newValue: any, oldValue: any)=>void,
    onvalue?: (value: any)=>void,
) {
    if (typeof exp !== 'function') return () => {};
    // console.log('debug observe', fn);
    DepUtil.inCollecting = true;
    // debugger;
    const value = exp();
    onvalue?.(value);
    DepUtil.inCollecting = false;
    let deps = Array.from(DepUtil.Temp);
    DepUtil.Temp.clear();
    for (const dep of deps) {
        // dep.collect(exp, { fn, value, exp });
        dep.collect(exp, { fn, value });
    }
    return () => {
        for (const dep of deps) {
            dep.remove(exp);
        }
        // @ts-ignore
        deps = null; exp = null;
    };
}

export const listener = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    clearEmpty (target: any, length: number) {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    newItem (target: any, index: number, value: any) {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    deleteIndex (target: any, index: number) {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    updateItem (target: any, index: number, value: any) {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    isForArray (target: any[]) {return false;},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    useArrayMethod (target: any[], key: string|symbol) {return null as any;},
};

export function replaceArray (target: any[], data: any[]) {
    // todo
    const fn = listener.useArrayMethod(target, 'splice');
    fn?.call(target, 0, target.length, ...data);
}

export function setArrayListeners (lns: typeof listener) {
    Object.assign(listener, lns);
}
export function reactive<T extends object = any> (data: T): T {
    if (data[OriginTarget]) return data;
    if (data[ProxyTarget]) return data[ProxyTarget];
    if (!isArrayOrJson(data)) return data;
    const proxy = new Proxy(data, {
        get (target, key) {
            if (key === OriginTarget) return target;
            if (key === ProxyTarget || key === 'constructor') return target[key];
            const value = target[key];
            DepUtil.add(target, key);
            if (Array.isArray(target)) {
                const result = listener.useArrayMethod(target, key);
                if (result) {
                    return result;
                }
            }
            if (isArrayOrJson(value) && !value[ProxyTarget]) {
                target[key] = reactive(value);
            }
            return Reflect.get(target, key, target);
        },
        set (target, key, value, receiver) {
            // console.log('Proxy Set', target, key, value);
            const origin = target[key];
            const isArrayLength = Array.isArray(target) && key === 'length';
            if (isArrayLength) {
                if (origin !== value) {
                    DepUtil.trigger(target, key);
                    listener.clearEmpty(target, value);
                }
                return Reflect.set(target, key, value, receiver);
            }
            if (value === origin) return true;
            const isArrayIndex = isArrayItem(target, key);
            if (isArrayIndex && typeof origin === 'undefined') {
                // value = reactive(deepClone(value));
                value = reactive(value);
                (listener.newItem(target, parseInt(key as string), value));
            } else if (isArrayOrJson(origin) && isArrayOrJson(value)) {
                if (listener.isForArray(origin[OriginTarget])) {
                    origin[ProxyTarget].splice(0, origin.length, ...value);
                } else {
                    deepAssign(origin, value);
                }
                // console.log('deepAssign', key);
                // const result = Reflect.set(target, key, value, receiver);
                DepUtil.trigger(target, key);
                return true;
            } else {
                (listener.updateItem(target, parseInt(key as string), value));
            }
            const result = Reflect.set(target, key, value, receiver);
            DepUtil.trigger(target, key);
            return result;
        },
        deleteProperty (target, key) {
            // console.log('Proxy Delete', target, key);
            if (!(key in target)) true;
            if (isArrayItem(target, key)) {
                const i = parseInt(key as string);
                listener.deleteIndex(target, i);
            }
            const result = Reflect.deleteProperty(target, key);
            DepUtil.trigger(target, key);
            return result;
        },
    });
    data[ProxyTarget] = proxy;
    return proxy;
}

function isArrayItem (target: any, key: string|symbol): target is any[] {
    return (Array.isArray(target) && (typeof key === 'string') && parseInt(key).toString() === key);
}

export function getTarget <T> (v: T): T {
    return v?.[OriginTarget] || v;
}

export function isDeepReactive (v: any) {
    return !!(v?.[OriginTarget]);
}