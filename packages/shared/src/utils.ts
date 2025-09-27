/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-24 08:38:31
 * @Description: Coding something
 */

import type { IRenderer } from './type';

function createSharedStatus () {
    return {
        OriginTarget: Symbol('ot'),
        ProxyTarget: Symbol('pt'),
        isSSR: false,
        isHydrating: false,
        // @ts-ignore
        Renderer: null as IRenderer,
    };
}

export let SharedStatus: ReturnType<typeof createSharedStatus>;

export function getTarget <T> (v: T): T {
    return v?.[SharedStatus.OriginTarget] || v;
}

export function getProxy <T> (v: T): T {
    return v?.[SharedStatus.ProxyTarget] || v;
}

if (typeof window !== 'undefined') {
    const win = window as any;
    if (win.__ld_shared) {
        SharedStatus = win.__ld_shared;
    } else {
        SharedStatus = createSharedStatus();
        win.__ld_shared = SharedStatus;
    }
}

export function isArrayOrJson (o: any) {
    const data = o?.constructor.name;
    if (data === 'Object' || data === 'Array') return true;
    return false;
}

export function deepAssign (origin: any, value: any) {
    origin = getProxy(origin);
    value = getTarget(value);
    const originKeys = new Set(Object.keys(origin));
    for (const key in value) {
        if (typeof key === 'symbol') continue;
        originKeys.delete(key);
        const v = value[key];
        if (isArrayOrJson(v) && isArrayOrJson(origin[key])) {
            deepAssign(origin[key], v);
        } else if (isArrayOrJson(v)) {
            origin[key] = deepAssign({}, v);
        } else {
            origin[key] = v;
        }
    }
    for (const key of originKeys) {
        if (typeof key === 'symbol') continue;
        delete origin[key];
    }
    if (Array.isArray(origin)) {
        origin.length = value.length;
    }
    return origin;
}

export function deepClone (data: any) {
    if (!isArrayOrJson(data)) return data;
    return deepAssign(Array.isArray(data) ? [] : {}, data);
}

export function raw (data: any) {
    if (!data[SharedStatus.OriginTarget]) return data;
    return deepClone(data);
}

export const isWeb = typeof document !== 'undefined' && document.head?.constructor.name === 'HTMLHeadElement';

export enum RendererType {
    Web,
    SSR,
    Custom,
}
