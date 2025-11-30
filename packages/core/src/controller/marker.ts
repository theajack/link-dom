/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 20:06:25
 * @Description: Coding something
 */
import { checkHydrateMarker, KEY_LD_TYPE, SharedStatus } from 'link-dom-shared';
import { LinkDomType } from '../utils';

let id = 0;
export class Marker {

    // static GlobalMarkerMap = new WeakMap<any, Set<Marker>>();
    [KEY_LD_TYPE] = LinkDomType.Marker;

    start: Node;

    end: Node;


    get parentNode () {
        return this.start.parentNode;
    }

    initEnd (endText = '') {
        if (!this.end)
            this.end = createMarkerNode(endText);
    }

    constructor (start: Node|string = '', end: Node|string = '') {
        this.start = typeof start === 'string' ? createMarkerNode(start) : start;
        this.end = typeof end === 'string' ? createMarkerNode(end) : end;
        checkHydrateMarker(this);
    }

    destroy () {
        // @ts-ignore
        this.start.remove();
        // @ts-ignore
        this.start = null;
        // @ts-ignore
        this.end.remove();
    }

    pick (includeMark = false, onlyElement = false): HTMLElement[] {
        if (!this.start.parentNode) {
            return [];
        }
        let next = includeMark ? this.start : this.start.nextSibling;
        const list: Node[] = [];
        while (next) {
            if (next === this.end) {
                if (includeMark) {
                    list.push(this.end);
                }
                break;
            }
            if (!onlyElement || next.nodeType === Node.ELEMENT_NODE) {
                list.push(next);
            }
            next = next.nextSibling;
        }
        return list as HTMLElement[];
    }

    // 清除marker中间的内容
    clear (includeMark = false): HTMLElement[] {
        if (!this.start.parentNode) {
            throw new Error('parent is null');
        }
        let next = includeMark ? this.start : this.start.nextSibling;
        const list: Node[] = [];
        // @ts-ignore
        while (next) {
            if (next as Element === this.end) {
                if (includeMark) {
                    // @ts-ignore
                    this.end.remove();
                    list.push(this.end);
                }
                break;
            }
            if (!includeMark) {
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
        }
        return list as HTMLElement[];
    }

    replace (frag: DocumentFragment) {
        const parent = this.start.parentNode;
        if (!parent) {
            throw new Error('parent is null');
        }
        parent.insertBefore(frag, this.end);
        // const next = this.start.nextSibling;
        // if (!next) {
        //     parent.appendChild(frag);
        // } else {
        //     parent.insertBefore(frag, next);
        // }
    }

    wrapContent (args: any) {
        const list: any[] = [ this.start ];
        if (Array.isArray(args)) {
            list.push(...args);
        } else {
            list.push(args);
        }
        list.push(this.end);
        return list;
    }
}

export function createMarkerNode (text = ''): Comment {
    return SharedStatus.Renderer.createComment(text + (id++)) as any;
    // const node = SharedStatus.Renderer.createComment(text + (id++)) as any;
    // // @ts-ignore
    // node.__marker = true;
    // return node;
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