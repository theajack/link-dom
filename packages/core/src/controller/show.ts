/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-01 19:39:21
 * @Description: Coding something
 */
import type { IChild } from '../element';
import { Frag } from '../text';
import type { IOptionStyle, IReactiveLike } from '../type.d';
import { LinkDomType, traverseChildren } from '../utils';
import { DepUtil, watch } from 'link-dom-reactive';
import { getReactiveValue } from '../utils';
import { createMarkerNode } from './_marker';

function getDefaultStyle (dom: HTMLElement, def?: any) {
    if (def) return def;
    let display = dom.style?.display;
    if (!display) {
        if (typeof document === 'undefined') return 'block';
        const temp = dom.cloneNode() as HTMLElement;
        document.head.appendChild(temp);
        display = getComputedStyle(temp).display;
        temp.remove();
    }
    return display;
}

export class Show {
    __ld_type = LinkDomType.Show;
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
        ref: IReactiveLike<boolean>,
        gene: ()=>IChild,
        showDisplay?: IOptionStyle['display'],
    ) {
        this.frag = new Frag();
        DepUtil.CurForChild?.addForEl(this);
        const nodes: [HTMLElement, any][] = [];
        traverseChildren([ gene() ], (dom: HTMLElement) => {
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
        this._clearWatch = watch(() => getReactiveValue(ref), (v) => {
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
        });
    }
    mounted (v: (el: Frag)=>void) {
        this.frag.mounted(v);
        return this;
    }
    destroy () {
        this._clearWatch?.();
    }
}