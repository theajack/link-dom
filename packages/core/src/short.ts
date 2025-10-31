/*
 * @Author: chenzhongsheng
 * @Date: 2025-10-08 23:39:36
 * @Description: Coding something
 */

import { type TDomName } from './dom';
import type { IChild } from './element';
import { Dom } from './element';
import { Comment, Frag, Text } from './text';
import { LinkDomType } from './utils';
import { style } from './style';
import { ctrl } from './controller';
import type { IReactiveLike } from './type';
import { BaseNode } from './node';

export type ITagCreator<T extends HTMLElement> = (
    ...doms: IChild[]
) => Dom<T>

const attrs = new Set([
    ...Object.getOwnPropertyNames(Dom.prototype),
    ...Object.getOwnPropertyNames(BaseNode.prototype),
]);
const Map: any = {};

const Short: {
    [prop in TDomName]: ITagCreator<HTMLElementTagNameMap[prop]> & Dom<HTMLElementTagNameMap[prop]>;
} = {} as any;

(() => {
    const tags = [ 'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tbody', 'tr', 'td', 'form', 'input', 'button', 'select', 'option', 'textarea', 'label', 'audio', 'video', 'canvas', 'code', 'pre', 'iframe', 'br' ];
    for (const name of tags) {
        (Short as any)[name] = _tag(name as TDomName);
    }
})();

function _tag <T extends HTMLElement> (tag: TDomName): ITagCreator<T> & Dom<T> {
    if (!Map[tag]) {
        const fn = (...doms: IChild[]) => {
            const el = new Dom(tag) as any;
            if (doms.length) {
                el.append(...doms);
            }
            return el;
        };
        Map[tag] = new Proxy(fn, {
            get (_, key) {
                if (key === '__ld_type') return LinkDomType.Short;
                if (key === 'el') return new Dom(tag).el;
                if (attrs.has(key as string)) {
                    return createFnObject(tag, key as string);
                }
                if (key in fn) return fn[key]; // 对于apply、call方法 使用fn自带的
                return undefined;
            }
        });
    }
    return Map[tag];
}

export const tag: (tag: string) => ITagCreator<HTMLElement> & Dom<HTMLElement> = _tag;

function createFnObject (tag: TDomName, key: string) {
    let p: any = null;
    let el: any = null;
    const fn = (...args: any[]) => {
        if (!el) {
            el = new Dom(tag) as any;
            el[key](...args);
        } else {
            if (args.length) el.append(...args);
        }
        return p;
    };
    p = new Proxy(fn, {
        get (_, key) {
            if (key === '__ld_type') return LinkDomType.Short;
            if (key === 'el') return el.el;
            if (attrs.has(key as string)) {
                return (...args: any[]) => {
                    el[key](...args);
                    return p;
                };
            }
            if (key in fn) return fn[key]; // 对于apply、call方法 使用fn自带的
            return undefined;
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
export const script: (v: string) => Dom<HTMLScriptElement> =
    (v) => new Dom<HTMLScriptElement>('script').html(v);
export const frag: (...doms: IChild[]) => Frag = (...doms) => new Frag().append(...doms);
export const fromHTML: <T extends HTMLElement = HTMLElement>(v: string)=>Dom<T> =
    (v: string) => new Dom('div').html(v).firstChild() as any;

export const d = {
    ...Short,
    text,
    comment,
    style,
    script,
    frag,
};

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
