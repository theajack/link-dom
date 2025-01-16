/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-13 11:33:49
 * @Description: Coding something
 */
import {type IChild} from './element';
import {isComputedLike} from './reactive/computed';
import {Text} from './text';

export enum LinkDomType {
    Dom,
    Text,
    Frag,
    Comment,
}

export function traverseChildren (doms: IChild[], onChild: (child: Node, origin: IChild) => void) {
    doms.forEach(dom => {
        if (Array.isArray(dom)) {
            traverseChildren(dom, onChild);
            return;
        }
        let el: any = dom;
        if (isComputedLike(el)) {
            el = new Text(el);
            el = el.el;
        } else if (typeof el.__ld_type === 'number') {
            el = el.el;
        } else if (!(dom instanceof Node)) {
            // @ts-ignore
            el = document.createTextNode(`${dom}`);
        }
        
        onChild(el, dom);
        // @ts-ignore
        dom.__mounted?.(dom);
    });
}
const NumberKeyReg = /(width$)|(height$)|(top$)|(bottom$)|(left$)|(right$)|(^margin)|(^padding)|(font-?size)/i;
const ImportantReg = /!important$/;
const NumberReg = /^[0-9]+$/;

export function formatCssKV (k: string, v: any) {
    k = transformCssKey(k);
    let important = '';
    if (ImportantReg.test(v)) {
        important = 'important';
        v = v.replace(ImportantReg, '');
    }
    // 对数字类型错处理
    if (NumberReg.test(v) && NumberKeyReg.test(k)) {
        v = `${v}px`;
    }
    return {cssKey: k, cssValue: v, important};
}

// 替换replaceAll
// backgroundColor => 'background-color'
function transformCssKey (str: string) {
    const n = str.length;
    let result = '';
    for (let i = 0; i < n; i++) {
        const s = str[i];
        const code = s.charCodeAt(0);
        if (code >= 65 && code <= 90) {
            result += `-${s.toLowerCase()}`;
        } else {
            result += s;
        }
    }
    return result;
}
