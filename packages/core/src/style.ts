
import { Dom } from './element';
import { isReactiveLike, type IReactive } from 'link-dom-reactive';
import { type Join } from './join';
import { LinkDomType, useReactive, isJoin } from './utils';
import type { IStyleKey } from './type.d';
import type { IStyle } from './type.d';
import type { ITagCreator } from './short';
import { mount } from './mount';
import { KEY_LD_TYPE } from 'link-dom-shared';


type IGlobalStyle = {
    [prop in string]: IStyle|string|number|IReactive<string|number>|IGlobalStyle|Join;
}

export function createStyles (data: Record<string, IStyle|IGlobalStyle>|string|IReactive<string>): Dom<HTMLStyleElement>[] {
    const isReact = isReactiveLike(data);
    const addStyle = (v = '') => {
        return new Dom<HTMLStyleElement>('style').text(v);
    };
    if (isReact || typeof data === 'string') {
        const el = addStyle();
        useReactive(data, v => { el.text(v); });
        return [ el ];
    } else {
        const doms: Dom<HTMLStyleElement>[] = [];
        let reactiveStyle: Dom<HTMLStyleElement>;
        // @ts-ignore
        styleStr({ data, onStyle (r, s) {
            if (r) {
                if (!reactiveStyle) {
                    reactiveStyle = addStyle();
                    doms.push(reactiveStyle);
                };
                reactiveStyle.text(r);
            }
            if (s) { doms.push(addStyle(s)); }
        } });
        return doms;
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
const NumberKeyReg = /(width$)|(height$)|(top$)|(bottom$)|(left$)|(right$)|(^margin)|(^padding)|(font-?size)|(gap$)/i;
const ImportantReg = /!important$/;
const NumberReg = /^[0-9]+$/;

export function formatCssKV (k: string, v: any, imp?: boolean) {
    k = transformCssKey(k);
    let important = imp ? 'important' : '';
    if (ImportantReg.test(v)) {
        important = 'important';
        v = v.replace(ImportantReg, '');
    }
    // 对数字类型错处理
    if (NumberReg.test(v) && NumberKeyReg.test(k)) {
        v = `${v}px`;
    }
    return { cssKey: k, cssValue: v, important };
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

export type IStyleLink<T extends Dom> = {
    [key in IStyleKey]: (v: IStyle[key], important?: boolean) => (IStyleLink<T> & T);
}

export interface IStyleBuilder<T extends Dom, S = (ITagCreator<HTMLStyleElement>)> extends IStyleLink<T> {
    (this: T, name: IStyle|Record<string, any>|null): T & S
    <T extends IStyleKey>(this: T, name: T, value: IStyle[T], important?: boolean): T & S
    (this: T, name: IStyleKey|IStyle|string, value?: any, imp?: boolean): T & S
}

function initPseudoId (dom: Dom) {
    let id = dom.id();
    if (!id) {
        id = `_ld_id_${Date.now().toString(36)}_${Math.random().toString(36).substring(2)}`;
        dom.id(id);
    }
    return id;
}
function handlePseudoStyle (dom: Dom, name: IStyleKey|IStyle|string, value?: any) {
    const id = initPseudoId(dom);
    mount(createStyles({ [`#${id}${name}`]: value }), 'head');
}

// let styleBuilder: IStyleBuilder<Dom>;

function originStyle (this: Dom, name: IStyleKey|IStyle|string, value?: any, imp?: boolean): Dom {
    if (typeof value !== 'undefined') {
        if (!name) return this;
        if (name[0] === ':') {
            // 伪属性
            handlePseudoStyle(this, name, value);
        } else {
            // @ts-ignore
            this._useR(value, (v) => {
                if (typeof v === 'object') {
                    originStyle.call(this, v);
                } else {
                    // @ts-ignore
                    const { important, cssValue, cssKey } = formatCssKV(name, v, imp);
                    this.el.style.setProperty(cssKey, cssValue, important);
                }
            });
        }

        return this;
    }
    if (typeof name === 'string' || isJoin(value) || isReactiveLike(value)) {
        return this.attr('style', name);
    }
    const map: any = {};
    let _id = '';
    const initId = () => {
        if (!_id) return (_id = initPseudoId(this));
        return _id;
    };
    // @ts-ignore
    for (const k in name) {
        if (typeof name[k] === 'undefined' || name[k] === null) continue;
        if (k[0] === ':') {
            map[`#${initId()}${k}`] = name[k];
        } else {
        // @ts-ignore
            this.style(k, name[k]);
        }
    }
    if (_id) {
        mount(createStyles(map), 'head');
    }
    return this;
};

function initStyleBuilder (dom: Dom) {
    const fn = originStyle.bind(dom);
    const proxy = new Proxy(fn, {
        get (_, name) {
            if (name === KEY_LD_TYPE) return LinkDomType.StyleBuilder;
            if (name === 'dom') return dom;
            if (name in dom) {
                const value = dom[name];
                if (typeof value === 'function') return value.bind(dom);
                return value;
            }
            if (name in fn) return fn[name]; // 对于apply、call方法 使用fn自带的
            return (v: any, imp?: boolean) => {
                dom.style(name as any, v, imp);
                return proxy;
            };
        }
    });
    return proxy;
}

export function getStyleBuilder<T extends Dom> (dom: T): IStyleBuilder<T> {
    return initStyleBuilder(dom);
}