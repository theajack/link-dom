/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 00:18:52
 * @Description: Coding something
 */

export const SSR_ATTR = 'ssr-id';

let ssrId = 0;

export function getSSRId (id?: string) {
    if (!id) id = `ssr-${ssrId++}`;
    return id;
}
