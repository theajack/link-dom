<!--
 * @Author: chenzhongsheng
 * @Date: 2024-11-09 23:04:10
 * @Description: Coding something
-->

# [Link Dom](https://github.com/theajack/link-dom)

Super concise chained call UI library

## Introduction

Link-dom is an extremely concise imperative UI library with chained call features and no third-party dependencies. Its minimum size is only 7.7kb.

Link-dom provides the createStore method for simple state management.

In tool library projects that require UI development, if native js is used to write UI, it will be difficult to manage and maintain, and the code volume will be large. And introducing UI libraries such as Vue and React will greatly increase the package size and even be a bit of overkill. The birth of link-dom is precisely to meet such scenarios of small-scale UI usage. UI is described by JS imperative and componentized UI management is achieved.

## Feature

1. Imperative UI, supports chained calls and has no third-party dependencies.
2. Has friendly type declaration support, covering attributes, styles, Dom tags, etc.
3. Has good css-in-js support and supports nested rules similar to less.
4. Supports state management.

## Install

```
npm i link-dom
```

## Usage

### Dom

Dom is a layer of encapsulation of dom elements, and all operations on the dom are handled inside IUIEle. Chaining and friendly type hints are also implemented in 
Dom

Generate an Dom element with dom.xxx

```js
import {mount, dom} from 'link-dom';

const hello = dom.div.text('Hello');
mount(hello, 'body');
```

Dom declaration

```ts
export declare class Dom {
	el: HTMLElement;
	constructor(key: (keyof HTMLElementTagNameMap) | HTMLElement);
	private _ur;
	class(): string;
	class(val: string): this;
	id(): string;
	id(val: string): this;
	addClass(name: string): this;
	removeClass(name: string): this;
	hasClass(name: string): boolean;
	toggleClass(name: string, force?: boolean): boolean;
	remove(): this;
	text(): string;
	text(val: string | number | IReactive): this;
	private __mounted?;
	mounted(v: (el: Dom) => void): this;
	attr(name: {
		[prop in IAttrKey]?: any;
	} | Record<string, any>): this;
	attr(name: IAttrKey): string;
	attr(name: string): string;
	attr(name: IAttrKey, value: any): this;
	attr(name: string, value: any): this;
	removeAttr(key: string): this;
	private __xr_funcs;
	func(k: string): (...args: any[]) => any;
	func(k: string, v: (...args: any[]) => any): this;
	data(name: Record<string, any>): this;
	data(name: string): any | null;
	data(name: string, value: any): this;
	style(name: IStyle | Record<string, any>): this;
	style(name: IStyleKey | string): string;
	style<T extends IStyleKey>(name: T, value: IStyle[T]): this;
	value(): string;
	value(val: string | number): this;
	html(): string;
	html(val: string | number): this;
	outerHtml(): string;
	outerHtml(val: string | number): this;
	child(i: number): Dom | null;
	children(): Dom[];
	click(value: IEventObject): this;
	event(name: Partial<Record<IEventKey, IEventObject>>): this;
	event(name: IEventKey, value?: IEventObject): this;
	append(...doms: IChild[]): this;
	ref(v: Dom): this;
	hide(): this;
	show(display?: string): this;
	setVisible(visible?: boolean, display?: string): this;
	query(selector: string, one: true): Dom;
	query(selector: string, one?: false): Dom[];
	src(): string;
	src(v: string): this;
	parent(): HTMLElement | null;
	empty(): this;
	name(): string;
	name(v: string): this;
	find(name: string): Dom;
	type(name: "text" | "number" | "password" | "checkbox" | "radio" | "color" | "range" | "submit" | "reset" | "input" | "date" | "email" | "tel"): this;
	bind(v: any): this;
}
```

### style

```js
import {style} from 'link-dom';

style({
    '.parent': {
        fontSize: '12px',
        '*': {color: '#000'},
        '.child': {
            color: '#444',
            '&.active': {color: '#f44'}
        },
    }
})
```

### event

```js
import {mount, dom} from 'link-dom';
function Main(){
    return dom.div.text('Hello World!')
        .event('click', ()=>{
            console.log('Hello')
        });
}
mount(Main(), 'body');
```

Use a decorator

```js
import {mount, dom} from 'link-dom';
function Main(){
    return dom.div.text('Hello World!')
        .event('click', {
            stop: true,
            listener: ()=>{
                console.log('Hello')
            }
        });
}
mount(Main(), 'body');
```

### mounted

```js
import {mount, dom} from 'link-dom';
mount(dom.div.mounted(el=>{
    console.log('mounted', el);
}), 'body');
```

### collectRef

```js
import {collectRef, mount, dom} from 'link-dom';
function Main(){
    const refs = collectRef('hello');
    return dom.div.ref(refs.hello)
        .click(()=>{console.log(refs.hello.text())})
        .text('Hello World!');
}
mount(Main(), 'body');
```

### State management

A simple state management and related APIs to use

```js
import {createStore, react, mount} from 'link-dom';
function Counter () {
    const store = createStore({
        count: 0,
    });
    const increase = () => {
        store.count += 1;
    };
    const unsub = store.$sub('count', (v, pv) => {
        console.log(`Subscribe Count Change value=,`, v, `; prevValue=`, pv);
    });
    return dom.div.append(
        dom.input.type('number').bind(store.count),
        dom.span.text(react`count=${store.count}`),
        dom.button.text('addCount').click(increase),
        dom.button.text('UnSubscribe').click(unsub)
    );
}

mount(Counter(), 'body');
```

#### createStore

Create a state store

```js
const store = createStore({
    count: 0,
});
```

#### react

The react method is used to concatenate a piece of responsive data

```js
import {react} from 'link-dom';

const reactive = react`count=${store.count}`;
// You can also just pass one piece of data, you don't need to use a template string, you can just call the function
const reactive = react(store.count);
```

#### raw

The raw method is used to annotate a static data in React

```js
import {react, raw} from 'link-dom';
const StaticName = 'count';
const reactive = react`${raw(StaticName)}=${store.count}`;
```

#### Dom.bind

Used for bidirectional binding of input type elements, the data inside the bind method does not need to be wrapped using react

```js
const input = dom.input.bind(store.count)
```

#### Store.$sub

Subscribe to reactive data changes, which returns an unsubscribe

```js
const unsub = store.$sub('count', (value, prevValue)=>{
    console.log(value, prevValue);
});
// Call unsub can unsubscribe
```

#### Store.$unsub

Cancel Subscribe

```js
let handler = (value, prevValue)=>{
    console.log(value, prevValue);
}
store.$sub('count', handler);
store.$unsub('count', handler);
store.$unsub('count'); // 不传入第二个参数可以取消指定状态的所有订阅
```

### Samples

#### List

```js
import {dom, collectRef, UIEle, mount} from 'link-dom';

function List () {
    const refs = collectRef('list');
    const list = ['1', '2', '3'];

    const SingleChild = (children: UIEle|string|number) => {
        return dom.span.append(children);
    };
    let index = 0;
    return dom.div.ref(refs.list).append(
        dom.button.text('add').click(() => {
            index ++;
            list.push(`${index}`);
            refs.list.append(SingleChild(index));
        }),
        list.map(item => SingleChild(item))
    );
}

mount(List(), 'body');
```

#### Counter

```js
import {createStore, react, mount} from 'link-dom';
function Counter () {
    const store = createStore({
        count: 0,
    });
    const increase = () => {
        store.count += 1;
    };
    const unsub = store.$sub('count', (v, pv) => {
        console.log(`Subscribe Count Change value=,`, v, `; prevValue=`, pv);
    });
    return dom.div.append(
        dom.input.type('number').bind(store.count),
        dom.span.text(react`count=${store.count}`),
        dom.button.text('addCount').click(increase),
        dom.button.text('UnSubscribe').click(unsub)
    );
}

mount(Counter(), 'body');
```