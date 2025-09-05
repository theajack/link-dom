import {LinkDomType} from '../utils';

export class Marker {

    static GlobalMarkerMap = new WeakMap<any, Set<Marker>>();
    __ld_type = LinkDomType.Marker;

    start: Node;

    end: Node|null = null;

    cacheFrag: DocumentFragment|null = null;

    private _clearSelf = false;

    get parentElement () {
        return this.start.parentElement;
    }

    constructor ({
        start, end = true, clearSelf = false,
    }: {
        start?: Node|null, end?: true, clearSelf?: boolean
    } = {}) {
        this.start = start || createMarkerNode();
        if (end) {
            this.end = createMarkerNode();
        }
        this._clearSelf = clearSelf;
    }

    // 清除marker中间的内容
    clear () {
        if (!this.start.parentElement) {
            this.addCache();
            return false;
        }
        this.clearCache();

        let next = this._clearSelf ? this.start : this.start.nextSibling;
        while (next) {
            if (next.nodeType === Node.COMMENT_NODE) {
                const comment = next as Element;
                // @ts-ignore
                if (comment.__marker) {
                    return comment;
                }
            }
            // @ts-ignore
            next.remove();
            next = this.start.nextSibling;
        }
    }

    replace (frag: DocumentFragment) {
        const parent = this.start.parentElement;
        if (!parent) {
            // todo 需要保存状态后续显示出来之后再处理
            this.addCache(frag);
            return false;
        }
        this.clear();
        const next = this.start.nextSibling;
        if (!next) {
            parent.appendChild(frag);
        } else {
            parent.insertBefore(frag, next);
        }
    }

    private addCache (frag: DocumentFragment = document.createDocumentFragment()) {
        this.cacheFrag = frag;
        const Map = Marker.GlobalMarkerMap;
        if (Map.has(this.parentElement)) {
            Map.get(this.parentElement)!.add(this);
        } else {
            Map.set(this.parentElement, new Set([this]));
        }
    }

    private clearCache () {
        this.cacheFrag = null;
        const Map = Marker.GlobalMarkerMap;
        if (Map.has(this.parentElement)) {
            const set = Map.get(this.parentElement)!;
            set.delete(this);
            if (set.size === 0) {
                Map.delete(this.parentElement);
            }
        }
    }

}

export function createMarkerNode (text = '') {
    const node = document.createComment(text);
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