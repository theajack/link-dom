import type { IElement } from 'link-dom-shared';
import { KEY_IS_NAME_USE, KEY_LD_TYPE, SharedStatus, isPureFunc } from 'link-dom-shared';
import type { IController } from '../controller';
import type { IChild } from './element';
import { Dom } from './element';
import { Text, type Frag } from './text';
import { LinkDomType } from '../utils';
import { LifeScopeType, onEnterScope, onExitScope, ScopeTypes } from './lifes';
import { handleIfLinkChildren } from '../controller/if';
import { isReactiveLike } from 'link-dom-reactive';
import { addDomsToComponent } from './component';

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
    const root = onEnterScope(LifeScopeType.Root, null);
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
    } else if (node[KEY_LD_TYPE] === LinkDomType.StyleBuilder) {
        return node.dom;
    } else if (isPureFunc(node)) {
        return node();
    }
    return node;
}


export function traverseChildren (doms: IChild[], onChild: (child: Node, origin: IChild) => void) {
    const isSSR = SharedStatus.isSSR;
    // console.log('debug', doms);
    // ! 为了保序 这里必须使用foreach
    doms.forEach((dom, index) => {
        // console.log('debug', dom, index);
        if (typeof dom === 'undefined' || dom === null) return;
        if (Array.isArray(dom)) {
            traverseChildren(dom, onChild);
            return;
        }
        let ldType = dom[KEY_LD_TYPE];
        let isScopeType = ScopeTypes.has(ldType);
        if (ldType === LinkDomType.Component && dom[KEY_IS_NAME_USE]) {
            // ! 如果是直接使用组件名，需要先获取执行，否则scope获取不到
            dom = dom();
        }
        let el: any = dom;

        if (typeof ldType === 'number') {
            const result = handleIfLinkChildren(el, doms, index);
            if (result) {
                dom = el = result; // ! 需要把dom也一起修改
                ldType = dom[KEY_LD_TYPE];
                isScopeType = ScopeTypes.has(ldType);
            }
        }

        if (isScopeType && !isSSR) {
            onEnterScope(ldType, dom);
        }

        if (ldType === LinkDomType.Component) {
            const v = el.el;
            // ! 必须要在el之后 组件才会初始化，才会挂载生命周期函数
            if (!isSSR) {
                dom.__beforeMount();
            }
            traverseChildren(Array.isArray(v) ? v : [ v ], (c, o) => {
                addDomsToComponent(dom, c);
                onChild(c, o);
            });
            // console.warn('debug end', 'component');
            if (!isSSR) {
                onExitScope();
                if (!v.__first_mount) {
                    dom.__mounted();
                    v.__first_mount = true;
                }
            }
            return;
        } else if (typeof ldType === 'number') {
            el = el.el;
        } else if (isReactiveLike(el)) {
            el = new Text(el as any);
            el = el.el;
        } else if (!(dom instanceof Node) && !(dom?.__is_ssr)) {
            el = SharedStatus.Renderer.createTextNode(`${dom}`);
        }
        onChild(el, dom);
        if (isScopeType && !isSSR) {
            onExitScope();
        }
        // if ([ LinkDomType.If ].includes(ldType)) {
        //     console.warn('debug2 end if', el, dom.id);
        //     onExitScope();
        // }
        // if ([ LinkDomType.For ].includes(ldType)) {
        //     console.warn('debug2 end for', el);
        //     onExitScope();
        // }
        // if ([ LinkDomType.Component ].includes(ldType)) {
        //     console.warn('debug2 end component');
        //     onExitScope();
        // }
        // @ts-ignore
        dom.__mounted?.(dom);
        // console.log('__mounted', dom, el.textContent);
    });
}