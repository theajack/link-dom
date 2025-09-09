
/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-08 19:55:58
 * @Description: Coding something
 */

import { dom, type Dom } from 'link-dom';
import { SSR_ATTR, getSSRId } from './utils';

// 水合过程 此部分在客户端运行
export function hydration (node: any, id?: string): Dom {
    id = getSSRId(id);

    const parent = document.querySelector(`[${SSR_ATTR}="${id}"]`);

    if (!parent) {
        throw new Error('[SSR] hydration error: Element not found');
    }

    // todo 水合过程

    return dom(parent as HTMLElement);
}