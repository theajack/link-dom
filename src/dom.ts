import {Dom} from './element';
import type {IComputedLike} from './reactive/computed';
import {Frag} from './text';
import {Text} from './text';
import type {IStyle} from './type';
import {formatCssKV} from './utils';

export function collectRef <T extends string[]> (...list: T): {
    [k in T[number]]: Dom
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
    'title', 'var', 'style', 'meta', 'head', 'link', 'svg', 'script',
] as const;

type TDomName = (typeof DomNames)[number];

interface IDom {
    // eslint-disable-next-line no-undef
    (name: keyof HTMLElementTagNameMap): Dom;
    (name: HTMLElement): Dom;
    (name: TDomName): Dom;
    (name: string): Dom;
}

type IDoms = {
    [tagName in TDomName]: Dom;
}

interface IEle {
    text: Text & {
        (v: string|number|IComputedLike): Text;
    },
    frag: Frag,
}

export function query (selector: string, one: true): Dom;
export function query (selector: string, one?: false): Dom[];
export function query (selector: string, one = false): Dom|Dom[] {
    return queryBase(selector, one, document);
}

export function queryBase (selector: string, one = false, parent: any = document) {
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
        frag: {get: () => new Frag()},
        text: {
            get: () => {
                const fn = (v: any) => new Text(v);
                fn.text = fn;
                return fn;
            }
        }
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
    [prop in string]: IStyle|string|IGlobalStyle;
}
export function style (data: Record<string, IStyle|IGlobalStyle>) {
    const dom = new Dom('style').text(styleStr(data)).el;
    return document.head.appendChild(dom);
}

function styleStr (data: Record<string, IStyle|IGlobalStyle>, prefix = ''): string {
    let cssStr = prefix ? `${prefix}{` : '';
    const sub: string[] = [];
    for (const key in data) {
        const value = data[key];
        if (typeof value === 'object') {

            let keyStr = '';
            if (key[0] === '&') {
                keyStr = key.substring(1);
            } else if (key[0] === ':') {
                keyStr = key;
            } else {
                keyStr = ` ${key}`;
            }

            sub.push(styleStr(value as any, `${prefix}${keyStr}`));
            continue;
        } else {
            const {important, cssValue, cssKey} = formatCssKV(key, value);
            cssStr += `${cssKey}:${cssValue}${important ? `!${important}` : ''};`;
        }
    }
    cssStr += (prefix ? `}` : '');
    return cssStr + sub.join('');
}

export function mount (node: Dom|Dom[], parent: string|HTMLElement|Dom) {
    let el: any = parent;
    if (typeof parent === 'string') {
        el = queryBase(parent, true);
    } else if (parent instanceof HTMLElement) {
        el = new Dom(parent);
    }
    Array.isArray(node) ? el.append(...node) : el.append(node);
}