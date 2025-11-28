/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 19:39:21
 * @Description: Coding something
 */
import type { IChild } from '../element';
import { Frag } from '../text';
import type { IOptionStyle, IReactiveLike } from '../type.d';
import { LinkDomType, parseFuncWrap } from '../utils';
import { watch } from 'link-dom-reactive';
import { read } from '../utils';
import { createMarkerNode } from './marker';
import { KEY_LD_TYPE, SharedStatus } from 'link-dom-shared';
import { traverseChildren } from '../mount';

function getDefaultStyle (el: HTMLElement, def?: any) {
    if (def) return def;
    let display = el.style?.display;
    if (!display) {
        if (typeof document === 'undefined') return 'block';
        const temp = el.cloneNode() as HTMLElement;
        document.head.appendChild(temp);
        display = getComputedStyle(temp).display;
        temp.remove();
    }
    return display;
}

export class ShowClass {
    [KEY_LD_TYPE] = LinkDomType.Show;
    private frag: Frag;
    get el () {
        return this.frag.el;
    }
    _marker: Node;
    getMarker () {
        return this._marker;
    }
    private _clearWatch: ()=>void;
    constructor (
        ref: IReactiveLike<any>,
        gene: (()=>IChild)|IChild,
        showDisplay?: IOptionStyle['display'],
    ) {
        this.frag = new Frag();
        const nodes: [HTMLElement, any][] = [];
        traverseChildren([ parseFuncWrap(gene) ], (dom: HTMLElement) => {
            if (!this._marker) this._marker = dom;
            let helper: any;
            if (dom.nodeType === Node.TEXT_NODE) {
                helper = createMarkerNode('');
                this.frag.append(dom, helper);
            } else {
                helper = getDefaultStyle(dom, showDisplay);
                this.frag.append(dom);
            }
            nodes.push([ dom, helper ]);
        });

        const change = (v) => {
            nodes.forEach(([ node, helper ]) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // @ts-ignore
                    if (node.style) {
                        // @ts-ignore
                        node.style.display = v ? helper : 'none';
                    }
                } else if (node.nodeType === Node.TEXT_NODE) {
                    if (v) {
                        const parent = helper.parentNode!;
                        parent.insertBefore(node, helper);
                    } else {
                        // @ts-ignore
                        node.remove();
                    }
                }
            });
        };
        if (!SharedStatus.isSSR) {
            // todo static 像if一样如果是静态元素就去掉comment
            this._clearWatch = watch(() => read(ref), change);
        }
        if (!read(ref)) {
            change(false);
        }
    }
    mounted (v: (el: Frag)=>void) {
        this.frag.mounted(v);
        return this;
    }
    destroy () {
        this._clearWatch?.();
    }
}