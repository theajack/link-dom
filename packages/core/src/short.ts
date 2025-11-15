/*
 * @Author: chenzhongsheng
 * @Date: 2025-10-08 23:39:36
 * @Description: Coding something
 */

import type { IChild } from './element';
import { DKeys, Dom, TextTagKeys } from './element';
import { Comment, Frag, Text } from './text';
import { LinkDomType } from './utils';
import { createStyles } from './style';
import { ctrl } from './controller';
import type { IReactiveLike } from './type';
import { BaseNode } from './node';
import type { TDomName } from './mount';

export const EventAttrs = new Set([ 'click', 'on' ] as const);

export type ITagCreator<T extends HTMLElement> = (
    ...doms: IChild[]
) => Dom<T>

export type ITagCreatorProxy<prop extends TDomName> = ITagCreator<HTMLElementTagNameMap[prop]> & Dom<HTMLElementTagNameMap[prop]>

const attrs = new Set([
    ...Object.getOwnPropertyNames(Dom.prototype),
    ...Object.getOwnPropertyNames(BaseNode.prototype),
    ...EventAttrs, // ! 需要单独处理
]);
const Map: any = {};

// // const FirstCallApi = [ 'classPrefix', 'if', 'elif', 'else', 'case', 'default' ] as const;
const FirstCallApi = [ 'if', 'elif', 'else', 'case', 'default' ] as const;
const FirstCallApiSet = new Set(FirstCallApi);

const Short: {
    [prop in TDomName]: ITagCreatorProxy<prop> & {
        // 这里是只有首次可以调用到的方法
        // classPrefix: (...prefixs: string[]) => ITagCreatorProxy<prop>;
        if: (ref: IReactiveLike) => ITagCreatorProxy<prop>;
        elif: (ref: IReactiveLike) => ITagCreatorProxy<prop>;
        else: (...args: IChild[]) => ITagCreatorProxy<prop>;
        case: (cond: any|(any[])|(()=>any)) => ITagCreatorProxy<prop>;
        default: (...args: IChild[]) => ITagCreatorProxy<prop>;
    };
} = {} as any;

(() => {
    const tags = [ 'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tbody', 'tr', 'td', 'form', 'input', 'button', 'select', 'option', 'textarea', 'label', 'audio', 'video', 'canvas', 'code', 'pre', 'iframe', 'br' ];
    for (const name of tags) {
        (Short as any)[name] = _tag(name as TDomName);
    }
})();

function createTagProxy <T extends HTMLElement> (tag: TDomName|HTMLElement|Dom): ITagCreator<T> & Dom<T> {
    const isTextNode = TextTagKeys.has(tag as any);
    const initEl = () => createProxyEl(isTextNode, tag);
    const fn = (...doms: IChild[]) => {
        const el = initEl();
        if (doms.length) {
            if (isTextNode) {
                if (tag === 'style') {
                    // ! style返回值是数组 所以还需要解一层
                    doms.forEach((v: any) => el.append(...createStyles(v)));
                } else el.append(...(doms.map((v: any) => new Dom('script').text(v))));
            } else {
                el.append(...doms);
            }
        }
        return el;
    };
    return new Proxy(fn, {
        get (_, key) {
            if (key === '__ld_type') return LinkDomType.Short;
            if (key === 'el') return initEl().el;
            if (typeof key !== 'string') return undefined;
            // if (typeof key !== 'string') return initEl().el[key];
            if (attrs.has(key as string) || FirstCallApiSet.has(key as any)) {
                return createFnObject(tag, key as string, isTextNode);
            }
            if (key in fn) return fn[key]; // 对于apply、call方法 使用fn自带的
            return undefined;
        }
    }) as any;
}

function _tag <T extends HTMLElement> (tag: TDomName|T|Dom): ITagCreator<T> & Dom<T> {
    if (typeof tag !== 'string') {
        return createTagProxy(tag);
    }
    if (!Map[tag]) {
        Map[tag] = createTagProxy(tag);
    }
    return Map[tag];
}

type ITag = {
    <T extends HTMLElement>(tag: T): ITagCreator<T> & Dom<T>
} & {
   <T extends TDomName>(tag: T): ITagCreator<HTMLElementTagNameMap[T]> & Dom<HTMLElementTagNameMap[T]>
} & {
   (tag: string|Dom|HTMLElement): ITagCreator<HTMLElement> & Dom<HTMLElement>
};

export const tag: ITag = _tag as any;

function createProxyEl (isTextNode: boolean, tag: any) {
    const el = isTextNode ? new Frag() : new Dom(tag);
    if (!isTextNode) return el;
    const p = new Proxy(el, {
        get (_, key) {
            if (key === '__ld_type') return LinkDomType.Short;
            if (key === 'el') return el.el;
            if (typeof key !== 'string') return el[key];
            if (key in el) {
                const v = el[key];
                return typeof v === 'function' ? v.bind(el) : v;
            }
            if (attrs.has(key)) {
                return (...args: any) => {
                    // @ts-ignore
                    for (const child of Array.from(el.children)) {
                        child[key](...args);
                    }
                    return p;
                };
            }
            return el[key];
        }
    });
    return p;
}

function createFnObject (tag: TDomName|HTMLElement|Dom, key: string, isTextNode: boolean) {
    let p: any = null;
    let el: any = null;

    let callMap: any[] = [];

    const initEl = () => createProxyEl(isTextNode, tag);

    const callAttr = (k: string, args: any[]) => {
        if (FirstCallApiSet.has(k as any)) {
            el.__fc_api_link = k;
            el.__fc_api_value = args[0];
            if (k === 'default' || k === 'else') {
                if (args.length) fn(...args);
            }
            return;
        }
        if (isTextNode) {
            if (k === 'text') {
                // ! 如果是文本比较特殊，得生成对应的文本元素
                el.append(new Dom(tag).text(args[0]));
            } else {
                // ! 如果先调用属性的话，frag里面还没有元素，所以必须先存储下来
                callMap.push({ k, args });
            }
        } else {
            el[k](...args);
        }
    };

    const fn = (...args: any[]) => {
        if (!el) {
            el = initEl();
            callAttr(key, args);
        } else {
            if (args.length) {
                if (isTextNode) {
                    if (tag === 'style') {
                    // ! style返回值是数组 所以还需要解一层
                        args.forEach((v: any) => el.append(...createStyles(v)));
                    } else el.append(...(args.map((v: any) => script(v))));
                } else {
                    el.append(...args);
                }
            }
        }
        return p;
    };
    p = new Proxy(fn, {
        get (_, key) {
            if (key === '__ld_type') return LinkDomType.Short;
            if (key === 'el') {
                if (isTextNode) {
                    callMap.forEach(({ k, args }) => {
                        for (const child of Array.from((el as Frag).children)) {
                            child[k](...args);
                        }
                    });
                    callMap = [];
                }
                return el.el;
            }
            if (typeof key !== 'string') return fn[key];
            if (attrs.has(key as string)) {
                const fn = (...args: any[]) => {
                    callAttr(key, args);
                    return p;
                };
                if (EventAttrs.has(key as any) && !isTextNode) {
                    for (const k of DKeys) {
                        fn[k] = (...args: any[]) => {
                            el[key][k](...args);
                            return p;
                        };
                    }
                }
                return fn;
            }
            if (key in fn) return fn[key]; // 对于apply、call方法 使用fn自带的
            return el[key];
        }
    });
    return p;
}

export const {
    div, span, p, h1, h2, h3, h4, h5, h6, a, img, ul, ol,
    li, table, tbody, tr, td, form, input, button, select, option, textarea,
    label, audio, video, canvas, code, pre, iframe, br
} = Short;

export const text: (v: IReactiveLike<string|number|boolean>) => Text =
    (v) => new Text(v);
export const comment:(v: IReactiveLike<string|number|boolean>) => Comment =
    (v) => new Comment(v);
// export const script: (v: string) => Dom<HTMLScriptElement> =
//     (v) => new Dom<HTMLScriptElement>('script').text(v);
export const frag: (...doms: IChild[]) => Frag = (...doms) => new Frag().append(...doms);
export const fromHTML: <T extends HTMLElement = HTMLElement>(v: string)=>Dom<T> =
    (v: string) => new Dom('div').html(v).firstChild() as any;

export const style = tag('style');
export const script = tag('script');

// window.ss = style;
// window.tt = tag;

export const d = {
    ...Short,
    text,
    comment,
    style,
    script,
    frag,
};
// window.d = d;

export const {
    switch: Switch,
    if: If,
    for: For,
    forRef: ForRef,
    forStatic: ForStatic,
    scope: Scope,
    await: Await,
    show: Show,
} = ctrl;
