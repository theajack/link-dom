import type { IElement } from 'link-dom-shared';
import { SharedStatus } from 'link-dom-shared';
import type { IController } from './controller';
import type { IChild } from './element';
import { Dom } from './element';
import type { Frag } from './text';
import { LinkDomType } from './utils';
import { LifeScope, LifeScopeType } from './lifes';
import { IfClass } from './controller/if';
import { isReactiveLike } from 'link-dom-reactive';

export function refs <E extends HTMLElement = HTMLElement, T extends string[] = string[]> (...list: T): {
    [k in T[number]]: Dom<E>
} {
    const refs: any = {};
    list.forEach(name => {
        refs[name] = (ele: Dom) => { refs[name] = ele; };
    });
    return refs;
}

export const collectRef = refs;

export type TDomName = keyof HTMLElementTagNameMap;

export function query <T extends HTMLElement = HTMLElement>(selector: string, one: true): Dom<T>;
export function query <T extends HTMLElement = HTMLElement>(selector: string, one?: false): Dom<T>[];
export function query <T extends HTMLElement = HTMLElement> (selector: string, one = false): Dom<T>|Dom<T>[] {
    return queryBase(selector, one, SharedStatus.Renderer);
}

export function find <T extends HTMLElement = HTMLElement> (selector: string): Dom<T> {
    return queryBase(selector, true, SharedStatus.Renderer);
}

export function queryBase (selector: string, one = false, parent: any = SharedStatus.Renderer): any {
    if (one) {
        const el = parent.querySelector(selector);
        if (el) return new Dom(el as HTMLElement);
        throw new Error('Element is not exist' + selector);
    }
    const list = parent.querySelectorAll(selector);
    const res: (Dom)[] = [];
    for (let i = 0; i < list.length; i++) {
        res.push(new Dom(list[i] as HTMLElement));
    }
    return res;
}

export type IMountDom = Dom|Frag|Text|Comment|IController;
export type IMountParent = string|HTMLElement|Dom|Frag|IElement;

export function mount (node: IMountDom|IMountDom[]|IChild, parent: IMountParent) {
    const root = new LifeScope(LifeScopeType.Root);
    let el: any = parent;
    if (typeof parent === 'string') {
        el = queryBase(parent, true);
    } else {
        el = new Dom(el);
    }
    node = parseNode(node);
    Array.isArray(node) ? el.append(...node) : el.append(node);
    return root;
}

function parseNode (node: IMountDom|IMountDom[]|IChild) {
    if (Array.isArray(node)) {
        return node.map(item => parseNode(item));
    } else if (node.__ld_type === LinkDomType.StyleBuilder) {
        return node.dom;
    } else if (typeof node === 'function') {
        return node();
    }
    return node;
}

const IsFcApiKeys = new Set([ 'if', 'elif', 'else' ]);

export function traverseChildren (doms: IChild[], onChild: (child: Node, origin: IChild) => void) {
    // console.log('debug', doms);
    doms.forEach((dom, index) => {
        // console.log('debug', dom, index);
        if (typeof dom === 'undefined' || dom === null) return;
        if (Array.isArray(dom)) {
            traverseChildren(dom, onChild);
            return;
        }
        let el: any = dom;
        if (el.__ld_type === LinkDomType.Component) {
            const v = el.el;
            el.__beforMount();
            traverseChildren(Array.isArray(v) ? v : [ v ], onChild);
            el.__mounted();
            console.warn('debug end', 'component');
            return;
        } else if (typeof el.__ld_type === 'number') {
            // ! 处理if链式调用逻辑
            if (el.__fc_api_link && IsFcApiKeys.has(el.__fc_api_link)) {
                if (!el.__if_link_done) {
                    const type = el.__fc_api_link as 'if'|'elif'|'else';
                    if (type === 'if') {
                        const ifEl = new IfClass(el.__fc_api_value, el);
                        let count = 0;
                        for (let i = index + 1; i < doms.length; i++) {
                            const dom = doms[i];
                            if (!dom.__fc_api_link) break;
                            if (dom.__fc_api_link === 'elif') {
                                dom.__if_link_done = true;
                                ifEl.elif(dom.__fc_api_value, dom);
                                count ++;
                            } else if (dom.__fc_api_link === 'else') {
                                dom.__if_link_done = true;
                                ifEl.else(dom);
                                count ++;
                            }
                        }
                        if (count) doms.splice(index + 1, count);
                        dom.__if_link_done = true;
                        // ! 此处要把dom一起改掉
                        dom = el = ifEl;
                    } else {
                        throw new Error(`${type} can not use without if`);
                    }
                }
            }
            // if ([ LinkDomType.For ].includes(el.__ld_type))
            //     console.warn('debug end for', el);
            el = el.el;
        } else if (isReactiveLike(el)) {
            el = new Text(el as any);
            el = el.el;
        } else if (!(dom instanceof Node) && !(dom?.__is_ssr)) {
            el = SharedStatus.Renderer.createTextNode(`${dom}`);
        }
        onChild(el, dom);
        if ([ LinkDomType.If ].includes(dom.__ld_type))
            console.warn('debug end if', el, dom.id);
        // @ts-ignore
        dom.__mounted?.(dom);
        // console.log('__mounted', dom, el.textContent);
    });
}