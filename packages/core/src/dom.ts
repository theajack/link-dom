/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-25 10:46:55
 * @Description: Coding something
 */
import type { IController } from './controller';
import type { IChild } from './element';
import { Dom } from './element';
import { type IComputedLike } from 'link-dom-reactive';
import { Comment, Frag } from './text';
import { Text } from './text';
import type { IElement } from 'link-dom-shared';
import { SharedStatus } from 'link-dom-shared';
import type { IStyleLink } from './style';
import { style } from './style';
import { LinkDomType } from './utils';

export function collectRef <E extends HTMLElement = HTMLElement, T extends string[] = string[]> (...list: T): {
    [k in T[number]]: Dom<E>
} {
    const refs: any = {};
    list.forEach(name => {
        refs[name] = (ele: Dom) => { refs[name] = ele; };
    });
    return refs;
}

type TDomName = keyof HTMLElementTagNameMap;

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

export const dom: {
    [prop in TDomName]: Dom<HTMLElementTagNameMap[prop]> & IStyleLink<Dom<HTMLElementTagNameMap[prop]>>;
} & {
    text: (v: string|number|IComputedLike) => Text,
    comment:(v: string|number|IComputedLike) => Comment,
    style: typeof style,
    script: (v: string) => Dom<HTMLScriptElement>,
    frag: Frag,
    fromHTML: <T extends HTMLElement = HTMLElement>(v: string)=>Dom<T>,
    query: typeof query,
    find: <T extends HTMLElement = HTMLElement> (selector: string)=>Dom<T>,
} = new Proxy({}, {
    get (target, key) {
        if (target[key]) return target[key];
        switch (key) {
            case 'text': target[key] = (v: any) => new Text(v); break;
            case 'comment': target[key] = (v: any) => new Comment(v); break;
            case 'frag': return new Frag();
            case 'fromHTML': target[key] = (v: string) => new Dom('div').html(v).firstChild(); break;
            case 'query': return query;
            case 'find': return find;
            case 'style': return style;
            case 'script': return (v: string) => new Dom('script').html(v);
            default: {
                return new Dom(key as TDomName);
            }
        }
        return target[key];
    },
}) as any;

export type IMountDom = Dom|Frag|Text|Comment|IController;

export function mount (node: IMountDom|IMountDom[]|IChild, parent: string|HTMLElement|Dom|Frag|IElement) {
    let el: any = parent;
    if (typeof parent === 'string') {
        el = queryBase(parent, true);
    } else {
        el = new Dom(el);
    }
    node = parseNode(node);
    Array.isArray(node) ? el.append(...node) : el.append(node);
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

export function childToFrag (node: IChild) {
    const frag = new Frag().append(node);
    return frag.el;
}