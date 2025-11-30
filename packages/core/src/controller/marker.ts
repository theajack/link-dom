/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 20:06:25
 * @Description: Coding something
 */
import { checkHydrateMarker, KEY_LD_TYPE, SharedStatus } from 'link-dom-shared';
import { LinkDomType } from '../utils';

export class Marker {

    // static GlobalMarkerMap = new WeakMap<any, Set<Marker>>();
    [KEY_LD_TYPE] = LinkDomType.Marker;

    start: Node;

    end: Node|null = null;

    private _clearSelf = false;

    get parentNode () {
        return this.start.parentNode;
    }

    initEnd (endText = '') {
        if (!this.end)
            this.end = createMarkerNode(endText);
    }

    constructor ({
        start, end = true, clearSelf = false, startText = '', endText = ''
    }: {
        start?: Node|null, end?: boolean, clearSelf?: boolean,
        startText?: string, endText?: string
    } = {}) {
        this.start = start || createMarkerNode(startText);
        if (end) {
            this.initEnd(endText);
        }
        checkHydrateMarker(this);

        this._clearSelf = clearSelf;
    }

    destroy () {
        // @ts-ignore
        this.start.remove();
        // @ts-ignore
        this.end?.remove();
    }

    pick (includeEnd = false, onlyElement = false): HTMLElement[] {
        if (!this.start.parentNode) {
            return [];
        }
        let next = this._clearSelf ? this.start : this.start.nextSibling;
        const list: Node[] = [];
        while (next) {
            if (next.nodeType === Node.COMMENT_NODE) {
                if (next as Element === this.end) break;
            }
            if (!onlyElement || next.nodeType === Node.ELEMENT_NODE) {
                list.push(next);
            }
            next = next.nextSibling;
            // @ts-ignore
            if (next?.__marker) {
                break;
            }
        }
        if (includeEnd && this.end) {
            list.push(this.end);
        }
        return list as HTMLElement[];
    }

    // 清除marker中间的内容
    clear (includeEnd = false): HTMLElement[] {
        if (!this.start.parentNode) {
            throw new Error('parent is null');
        }
        let next = this._clearSelf ? this.start : this.start.nextSibling;
        const list: Node[] = [];
        // @ts-ignore
        while (next) {
            if (next.nodeType === Node.COMMENT_NODE) {
                if (next as Element === this.end) break;
            }
            if (!this._clearSelf) {
                // @ts-ignore
                next.remove();
                list.push(next);
                next = this.start.nextSibling;
            } else {
                const _next = next.nextSibling;
                // @ts-ignore
                next.remove();
                list.push(next);
                next = _next;
            }
            // @ts-ignore
            if (next?.__marker) {
                break;
            }
        }
        if (includeEnd && this.end) {
            // @ts-ignore
            this.end.remove();
            list.push(this.end);
        }
        return list as HTMLElement[];
    }

    replace (frag: DocumentFragment) {
        const parent = this.start.parentNode;
        if (!parent) {
            throw new Error('parent is null');
        }
        const next = this.start.nextSibling;
        if (!next) {
            parent.appendChild(frag);
        } else {
            parent.insertBefore(frag, next);
        }
    }

    wrapContent (args: any) {
        const list: any[] = [ this.start ];
        if (Array.isArray(args)) {
            list.push(...args);
        } else {
            list.push(args);
        }
        if (this.end) {
            list.push(this.end);
        }
        return list;
    }
}

export function createMarkerNode (text = ''): Comment {
    const node = SharedStatus.Renderer.createComment(text) as any;
    // @ts-ignore
    node.__marker = true;
    return node;
}

export function removeBetween (start: Node, end: Node, includeStart = true) {
    let next: any = includeStart ? start : start.nextSibling;
    while (next) {
        if (next === end) {
            break;
        }
        const _next = next.nextSibling;
        next.remove();
        next = _next;
    }
}