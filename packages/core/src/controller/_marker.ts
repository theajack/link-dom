/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 20:06:25
 * @Description: Coding something
 */
import { Renderer } from 'link-dom-shared';
import { LinkDomType } from '../utils';

export class Marker {

    static GlobalMarkerMap = new WeakMap<any, Set<Marker>>();
    __ld_type = LinkDomType.Marker;

    start: Node;

    end: Node|null = null;

    private _clearSelf = false;

    get parentNode () {
        return this.start.parentNode;
    }

    constructor ({
        start, end = true, clearSelf = false, startText = '', endText = ''
    }: {
        start?: Node|null, end?: true, clearSelf?: boolean,
        startText?: string, endText?: string
    } = {}) {
        this.start = start || createMarkerNode(startText);
        if (end) {
            this.end = createMarkerNode(endText);
        }
        this._clearSelf = clearSelf;
    }

    // 清除marker中间的内容
    clear () {
        if (!this.start.parentNode) {
            throw new Error('parent is null');
        }

        let next = this._clearSelf ? this.start : this.start.nextSibling;
        const list: Node[] = [];
        while (next) {
            if (next.nodeType === Node.COMMENT_NODE) {
                const comment = next as Element;
                // @ts-ignore
                if (comment === this.end) {
                    break;
                }
            }
            // @ts-ignore
            next.remove();
            list.push(next);
            next = this.start.nextSibling;
        }
        return list;
    }

    replace (frag: DocumentFragment) {
        const parent = this.start.parentNode;
        if (!parent) {
            throw new Error('parent is null');
        }
        const list = this.clear();
        const next = this.start.nextSibling;
        if (!next) {
            parent.appendChild(frag);
        } else {
            parent.insertBefore(frag, next);
        }
        return list;
    }
}

export function createMarkerNode (text = ''): Comment {
    const node = Renderer.createComment(text) as any;
    // @ts-ignore
    node.__marker = true;
    return node;
}

export function removeBetween (start: Node, end: Node) {
    let next: any = start;
    while (next) {
        if (next === end) {
            break;
        }
        const _next = next.nextSibling;
        next.remove();
        next = _next;
    }
}