import type { IController } from './controller';
import type { IChild } from './element';
import { Dom } from './element';
import { isReactiveLike, type IComputedLike, type IReactive } from 'link-dom-reactive';
import { isJoin, type Join } from './join';
import { useReactive } from './utils';
import { Comment, Frag } from './text';
import { Text } from './text';
import type { IStyle } from './type.d';
import { formatCssKV } from './utils';
import type { IElement } from 'link-dom-shared';
import { Renderer } from 'link-dom-shared';

export function collectRef <E extends HTMLElement = HTMLElement, T extends string[] = string[]> (...list: T): {
    [k in T[number]]: Dom<E>
} {
    const refs: any = {};
    list.forEach(name => {
        refs[name] = (ele: Dom) => { refs[name] = ele; };
    });
    return refs;
}

const DomNames = [
    'a', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'canvas', 'code', 'pre', 'table', 'th', 'td', 'tr', 'video', 'audio',
    'ol', 'select', 'option', 'p', 'i', 'iframe', 'img', 'input', 'label', 'ul', 'li', 'span', 'textarea', 'form', 'br', 'tbody',
    'object', 'progress', 'section', 'slot', 'small', 'strong', 'sub', 'summary', 'sup', 'template',
    'title', 'var', 'style', 'meta', 'head', 'link', 'svg', 'script', 'svg',
] as const;

// eslint-disable-next-line no-undef
type HTMLMap = HTMLElementTagNameMap & {
    svg: HTMLElement, // SVGElement
};

type TDomName = keyof HTMLMap;

interface IDom {
    <T extends TDomName>(name: T): Dom<HTMLMap[T]>;
    (name: HTMLElement): Dom;
    <T extends TDomName>(name: T): Dom<HTMLMap[T]>;
    (name: string): Dom;
}

type IDoms = {
    [tagName in TDomName]: Dom<HTMLMap[tagName]>;
}

interface IEle {
    text: Text & {
        (v: string|number|IComputedLike): Text;
    },
    frag: Frag,
    comment: Comment & {
        (v: string|number|IComputedLike): Comment;
    },
    fromHTML: <T extends HTMLElement = HTMLElement>(v: string)=>Dom<T>,
    query: typeof query,
    find: <T extends HTMLElement = HTMLElement> (selector: string)=>Dom<T>,
}

export function query <T extends HTMLElement = HTMLElement>(selector: string, one: true): Dom<T>;
export function query <T extends HTMLElement = HTMLElement>(selector: string, one?: false): Dom<T>[];
export function query <T extends HTMLElement = HTMLElement> (selector: string, one = false): Dom<T>|Dom<T>[] {
    return queryBase(selector, one, Renderer);
}

export function find <T extends HTMLElement = HTMLElement> (selector: string): Dom<T> {
    return queryBase(selector, true, Renderer);
}


export function queryBase (selector: string, one = false, parent: any = Renderer): any {
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

// @ts-ignore
export const dom: IDom & IDoms & IEle = (() => {
    const builder = (name: any) => new Dom(name);
    const pps: any = {
        frag: { get: () => new Frag() },
        text: {
            get: () => {
                const fn = (v: any) => new Text(v);
                fn.text = fn;
                return fn;
            }
        },
        comment: {
            get: () => {
                const fn = (v: any) => new Comment(v);
                fn.text = fn;
                return fn;
            }
        },
        fromHTML: {
            get: () => {
                return (v: string) => dom.div.html(v).firstChild();
            }
        },
        query: { get: () => query },
        find: { get: () => {
            return (v: string) => query(v, true);
        } }
    };
    DomNames.forEach(name => {
        pps[name] = {
            get: () => builder(name)
        };
    });
    Object.defineProperties(builder, pps);
    return builder;
})();

type IGlobalStyle = {
    [prop in string]: IStyle|string|number|IReactive<string|number>|IGlobalStyle|Join;
}
export function style (data: Record<string, IStyle|IGlobalStyle>|string|IReactive<string>) {
    const isReact = isReactiveLike(data);
    const addStyle = (v = '') => {
        const dom = new Dom('style').text(v);
        Renderer.addStyle(dom.el as any);
        return dom;
    };
    if (isReact || typeof data === 'string') {
        const dom = addStyle();
        useReactive(data, v => { dom.text(v); });
    } else {
        let reactiveStyle: Dom;
        // @ts-ignore
        styleStr({ data, onStyle (r, s) {
            if (r) {
                if (!reactiveStyle) reactiveStyle = addStyle();
                reactiveStyle.text(r);
            }
            if (s) { addStyle(s); }
        } });
    }
}

function styleStr ({
    data,
    reactiveValue = [],
    staticValue = [],
    prefix = '',
    index = 0,
    onStyle,
    first = true,
}:{
    data: Record<string, IStyle|IGlobalStyle|Join>,
    reactiveValue?: string[],
    staticValue?: string[],
    prefix?: string,
    index?: number,
    onStyle: (r: string, s?: string) => void,
    first?: boolean,
}) {
    const cssValue: string[] = [];

    const addCssValue = (v: string) => {
        cssValue.push(v);
        index ++;
    };

    if (prefix) {addCssValue(`${prefix}{`);}

    let isReactiveStyle = false;
    const objects: any[] = [];
    for (const key in data) {
        let value: any = data[key];
        let isReact = true;
        if (isJoin(value)) {
            value = (value as Join).toFn();
        } else {
            isReact = isReactiveLike(value);
        }
        if (isReact) {
            isReactiveStyle = true;
            ((i: number) => {
                useReactive(value, (v, init) => {
                    if (init) {
                        addCssValue(joinCssValue(key, v));
                    } else {
                        // console.log(v, i);
                        reactiveValue[i] = joinCssValue(key, v);
                        onStyle(reactiveValue.join('').trim());
                    }
                });
            })(index);
        } else if (typeof value === 'object') {
            objects.push({ key, value });
            continue;
        } else {
            addCssValue(joinCssValue(key, value));
        }
    }
    if (prefix) {
        addCssValue('}');
    }
    if (cssValue.length) {
        (isReactiveStyle ? reactiveValue : staticValue).push(...cssValue);
    }
    objects.forEach(({ key, value }) => {
        let keyStr = '';
        if (key[0] === '&') {
            keyStr = key.substring(1);
        } else if (key[0] === ':') {
            keyStr = key;
        } else {
            keyStr = ` ${key}`;
        }
        styleStr({
            data: value as any,
            prefix: `${prefix}${keyStr}`,
            index,
            reactiveValue,
            staticValue,
            onStyle,
            first: false,
        });
    });

    if (first) {
        onStyle(reactiveValue.join('').trim(), staticValue.join('').trim());
    }
}

function joinCssValue (key: string, value: any) {
    const { important, cssValue, cssKey } = formatCssKV(key, value);
    return `${cssKey}:${cssValue}${important ? `!${important}` : ''};`;
}

export type IMountDom = Dom|Frag|Text|Comment|IController;

export function mount (node: IMountDom|IMountDom[]|IChild, parent: string|HTMLElement|Dom|Frag|IElement) {
    let el: any = parent;
    if (typeof parent === 'string') {
        el = queryBase(parent, true);
    } else if (parent instanceof HTMLElement) {
        el = new Dom(parent);
    } else if (el.__isCustomEl == true) {
        // ! Custom render 处理
        el = new Dom(el);
    }
    if (typeof node === 'function') node = node();
    Array.isArray(node) ? el.append(...node) : el.append(node);
}

export function childToFrag (node: IChild) {
    const frag = dom.frag.append(node);
    return frag.el;
}