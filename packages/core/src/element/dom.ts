/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-25 10:46:55
 * @Description: Coding something
 */
import { Dom } from './element';
import { type IComputedLike } from 'link-dom-reactive';
import { Comment, Frag } from './text';
import { Text } from './text';
import { createStyles } from './style';
import type { IStyleLink } from './style';
import type { TDomName } from './mount';
import { find, query } from './mount';
// import { style } from './short';

export const dom: {
    [prop in TDomName]: Dom<HTMLElementTagNameMap[prop]> & IStyleLink<Dom<HTMLElementTagNameMap[prop]>>;
} & {
    text: (v: string|number|IComputedLike) => Text,
    comment:(v: string|number|IComputedLike) => Comment,
    style: typeof createStyles,
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
            case 'style': return createStyles;
            case 'script': return (v: string) => new Dom('script').html(v);
            default: {
                return new Dom(key as TDomName);
            }
        }
        return target[key];
    },
}) as any;