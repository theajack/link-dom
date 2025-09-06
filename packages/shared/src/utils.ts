/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-13 11:33:49
 * @Description: Coding something
 */
export function isArrayOrJson (o: any) {
    const data = o?.constructor.name;
    if (data === 'Object' || data === 'Array') return true;
    return false;
}

export const OriginTarget = Symbol('OriginTarget');
export const ProxyTarget = Symbol('ProxyTarget');

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
    if (!data[OriginTarget]) return data;
    return deepClone(data);
}
