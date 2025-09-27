/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 18:22:04
 * @Description: Coding something
 */
import { isArrayOrJson, getTarget } from 'link-dom-shared';
import { DepUtil } from './dep';

export function reader <T> (v: T): T {
    if (!isArrayOrJson(v)) return v;
    return new Proxy(getTarget(v) as any, {
        get (target, key) {
            const value = Reflect.get(target, key, target);
            DepUtil.add(target, key);
            return reader(value);
        },
        set (_, key) {
            console.warn('Set is not supported:', `key=${key.toString()}`);
            return false;
        },
        deleteProperty (_, key) {
            console.warn('Delete is not supported:', `key=${key.toString()}`);
            return false;
        }
    });
}
