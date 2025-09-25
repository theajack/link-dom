<!--
 * @Author: chenzhongsheng
 * @Date: 2025-09-25 08:08:14
 * @Description: Coding something
-->

# [Link-dom](https://github.com/theajack/link-dom) - Compilation-free Reactive Chainable Call UI Library

[Playground](https://theajack.github.io/jsbox/?config=theajack.link-dom)

link-dom is a UI library that supports reactive data. It can run without compilation, fully complies with JavaScript/TypeScript language specifications, and at the same time has extremely high performance. In benchmark performance tests, its performance is close to that of Vue3 and far better than that of React. Additionally, it supports Router and SSR capabilities.

## Install

```
npm i link-dom
```

CDN

```html
<script src="https://unpkg.com/link-dom"></script>
<!-- or use jsdelivr -->
<!-- <script src="https://cdn.jsdelivr.net/npm/link-dom"></script> -->
<script>
    window.LinkDom
</script>
```

## Usage

### Basic

#### Reactive

```js
import { dom, ref, mount, join } from 'link-dom';
function App () {
    const name = ref('');
    return dom.div.children(
        dom.div.text(() => `Hello World! ${name.value}`),
        // Or use join
        dom.div.text(join`Hello World! ${name}`),
        dom.input.attr('placeholder', 'Input your name').bind(name)
    );
}
mount(App, 'body');
```

#### Style

```js
import { dom, ref, mount, join } from 'link-dom';
function Style () {
    const font = ref(12);
    const color = ref('red');
    return dom.div.children(
        dom.div.style({
            fontWeight: 'bold',
            color: color,
            fontSize: font,
        }).text(join`Color = ${color}; FontSize = ${font}`),
        dom.div.children(
            dom.text('color: '),
            dom.input.bind(color),
        ),
        dom.div.children(
            dom.text('font: '),
            dom.input.bind(font),
            dom.button.text('Increase').click(() => font.value++)
        )
    );
}
mount(Style, '#app');
```

#### Global Style

```js
import { dom, ref, mount, join, style } from 'link-dom';
function GlobalStyle () {
    const font = ref(12);
    const color = ref('red');
    const colorB = ref('green');
    style({
        '.parent': {
            fontWeight: 'bold',
            color: color,
            fontSize: font,
            '.child': {
                color: colorB,
            }
        }
    });
    return dom.div.children(
        dom.div.class('parent').children(
            dom.div.text(join`Color = ${color}; FontSize = ${font}`),
            dom.div.class('child').text(join`Child Color = ${colorB}`),
        ),
        dom.div.children(
            dom.text('color: '),
            dom.input.bind(color),
        ),
        dom.div.children(
            dom.text('child color: '),
            dom.input.bind(colorB),
        ),
        dom.div.children(
            dom.text('font: '),
            dom.input.bind(font),
            dom.button.text('Increase').click(() => font.value++)
        )
    );
}
mount(GlobalStyle, '#app');
```

#### Counter

```js
import { dom, ref, mount, join } from 'link-dom';
function Counter () {
    const count = ref(0);
    return dom.div.children(
        dom.div.text(join`Count = ${count}`),
        dom.input.bind(count),
        dom.button.text('Increase').click(() => {
            count.value++;
        }),
    );
}
mount(Counter, '#app');
```

#### Collect Ref

```js
import { dom, mount, collectRef } from 'link-dom';
function CollectRef () {
    const refs = collectRef('hello');
    return dom.div.children(
        dom.span.ref(refs.hello).text('Hello World!'),
        dom.button.text('Log Ref').click(() => {
            console.log(refs.hello);
            const text = refs.hello.text();
            refs.hello.text(text + '!');
        }),
    );
}
mount(CollectRef, '#app');
```

### Controller

#### For (Reactive List)

#### ForRef

#### If

#### Switch

#### Show

#### Await

### Custom Renderer

### Router

```
npm i link-dom-router
```

### SSR

```
npm i link-dom-ssr
```
