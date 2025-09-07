/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 15:57:40
 * @Description: Coding something
 */
import { reader } from 'link-dom-reactive';

export function flow<T = any> (value: T): T {

    if (!value) return value;
    if (typeof value === 'function') {
        // 对组件进行单项数据流wrap
        return ((...args: any[]) => {
            return value(...args.map(item => reader(item)));
        }) as T;
    } else {
        return reader(value);
    }
}