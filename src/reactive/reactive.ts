

/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 21:28:27
 * @Description: Coding something
 */
// import {ForGlobal} from '../controller/for';
import {ForGlobal} from '../controller/for';
import {isArrayOrJson} from '../utils';
import {DepUtil} from './dep';
import {OriginTarget, ProxyTarget} from './utils';

export function observe (
    exp: ()=>any,
    fn: (newValue: any, oldValue: any)=>void,
    onvalue?: (value: any)=>void
) {
    if (typeof exp !== 'function') return () => {};
    // console.log('debug observe', fn);
    DepUtil.inCollecting = true;
    const value = exp();
    onvalue?.(value);
    DepUtil.inCollecting = false;
    let deps = Array.from(DepUtil.Temp);
    DepUtil.Temp.clear();
    for (const dep of deps) {
        dep.collect(exp, {fn, value});
    }
    return () => {
        for (const dep of deps) {
            dep.remove(exp);
        }
        // @ts-ignore
        deps = null; exp = null;
    };
}

export function reactive<T extends object = any> (data: T): T {
    if (data[OriginTarget]) return data;
    if (data[ProxyTarget]) return data[ProxyTarget];
    const proxy = new Proxy(data, {
        get (target, key) {
            if (key === OriginTarget) return target;
            if (key === ProxyTarget) return target[key];
            const value = target[key];
            debugger;
            DepUtil.add(target, key);
            if (isArrayOrJson(value) && !value[ProxyTarget]) {
                return reactive(value);
            }
            return Reflect.get(target, key, target);
        },
        set (target, key, value, receiver) {
            if (key === 'length') {
                console.warn('set length', value);
            }
            console.log('Proxy Set', target, key, value);
            const origin = target[key];
            if (value === origin) return true;

            if (Array.isArray(target) && key === 'length') {
                ForGlobal.clearEmpty(target, value);
            }
            if (isArrayItem(target, key)) {
                ForGlobal.setIndex(target, parseInt(key as string), value);
            } else if (isArrayOrJson(origin) && isArrayOrJson(value)) {
                deepAssign(origin, value);
            }
            const result = Reflect.set(target, key, value, receiver);
            DepUtil.trigger(target, key);
            // DepUtil.deliverDeps(origin, value);
            return result;
        },
        deleteProperty (target, key) {
            console.log('Proxy Delete', target, key);
            if (!(key in target)) true;
            if (isArrayItem(target, key)) {
                const i = parseInt(key as string);
                ForGlobal.deleteIndex(target, i);
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

export function deepAssign (origin: any, value: any) {
    origin = origin[ProxyTarget] || origin;
    value = value[OriginTarget] || value;
    const originKeys = new Set(Object.keys(origin));
    for (const key in value) {
        if (typeof key === 'symbol') continue;
        originKeys.delete(key);
        const v = value[key];
        if (isArrayOrJson(v) && isArrayOrJson(origin[key])) {
            deepAssign(origin[key], v);
        }
    }
    for (const key of originKeys) {
        if (typeof key === 'symbol') continue;
        delete origin[key];
    }
    Object.assign(origin, value);
    if (Array.isArray(origin)) {
        origin.length = value.length;
    }
}


export function test<T extends object = any> (data: T): T {
    const proxy = new Proxy(data, {
        get (target, key) {
            // console.log('Proxy Get', target, key);
            return Reflect.get(target, key, target);
        },
        set (target, key, value, receiver) {
            console.log('Proxy Set', target, key, value);
            return Reflect.set(target, key, value, receiver);
        },
        deleteProperty (target, key) {
            console.log('Proxy Delete', target, key);
            return Reflect.deleteProperty(target, key);
        },
    });
    return proxy;
}

window.test = test;
window.a = test([1, 2, 3, 4, 5]);