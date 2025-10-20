
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
import { div, input, ref, mount, join, computed } from 'link-dom';
function Ref () {
    const name = ref('');
    const name2 = computed(() => `【name】 ${name.value}`);
    return div(
        div(() => `Hello World! ${name.value}`),
        // Or use join
        div(join`Hello World! ${name}`),
        div(join`Computed: ${name2}`),
        input.bind(name).placeholder('Input your name')
    );
}
mount(Ref, '#jx-app');

```

#### Style

```js
import { div, ref, input, button, mount, join } from 'link-dom';
function Style () {
    const font = ref(12);
    const color = ref('red');
    return div(
        div(join`Color = ${color}; FontSize = ${font}`).style({
            fontWeight: 'bold',
            color: color,
            fontSize: font,
        }),
        div('color: ', input.bind(color)),
        div(
            'font: ',
            input.bind(font),
            button('Increase').click(() => font.value++)
        )
    );
}
mount(Style, '#jx-app');
```

#### StyleLink

```js
import { div, reactive, input, button, mount, join, link } from 'link-dom';
function Style () {
    const data = reactive({
        color: 'red',
        font: 12,
    });
    return div(
        div(join`Color = ${link(data.color)}; FontSize = ${link(data.font)}`).style({
            fontWeight: 'bold',
            color: link(data.color),
            fontSize: link(data.font),
        }),
        div('color: ', input.bind(link(data.color))),
        div(
            'font: ',
            input.bind(link(data.font)),
            button('Increase').click(() => data.font++)
        )
    );
}
mount(Style, '#jx-app');
```

#### Global Style

```js
import { style, div, input, ref, mount, join, button } from 'link-dom';
function GlobalStyle () {
    const font = ref(12);
    const color = ref('red');
    const colorB = ref('green');
    mount(style({
        '.parent': {
            fontWeight: 'bold',
            color: color,
            fontSize: font,
            '.child': {
                color: colorB,
            }
        }
    }), 'head');
    return div(
        div.class('parent')(
            div(join`Color = ${color}; FontSize = ${font}`),
            div.class('child')(join`Child Color = ${colorB}`),
        ),
        div('color: ', input.bind(color)),
        div('child color: ', input.bind(colorB)),
        div(
            'font: ',
            input.bind(font),
            button('Increase').click(() => font.value++)
        )
    );
}
mount(GlobalStyle, '#jx-app');
```

#### Counter

```js
import { div, input, button, ref, mount, join } from 'link-dom';
function Counter () {
    const count = ref(0);
    return div(
        div(join`Count = ${count}`),
        input.bind(count),
        button('Increase').click(() => {
            count.value++;
        }),
    );
}
mount(Counter, '#jx-app');
```

#### Collect Ref

```js
import { mount, collectRef, div, span, button } from 'link-dom';
function CollectRef () {
    const refs = collectRef('hello');
    return div(
        span('Hello World!').ref(refs.hello),
        button('Log Ref').click(() => {
            console.log(refs.hello);
            const text = refs.hello.text();
            refs.hello.text(text + '!');
        }),
    );
}
mount(CollectRef, '#jx-app');
```

### Controller

#### For (Reactive List)

```js
import { div, button, ref, mount, join, For, link, span } from 'link-dom';
function ForApp () {
    const list = ref([]);
    let id = 0;
    return div(
        div(
            button('Add Item').click(() => {
                id ++;
                list.value.push({ id: `id-${id}`, label: `label-${id}` });
            }),
            button('Reverse').click(() => list.value.reverse()),
            button('Clear').click(() => list.value = []),
        ),
        For(list, (item, index) =>
            div(
                span(join`${index}: ${link(item.id)}: ${link(item.label)}`),
                button('Remove').click(() => { list.value.splice(index.value, 1); }),
                button('Update').click(() => { item.label += '!'; }),
            )
        ),
    );
}
mount(ForApp, '#jx-app');
```

#### ForRef

```js
import { div, button, span, ref, mount, join, link, ForRef } from 'link-dom';
function ForRefApp () {
    const list = ref([]);
    let id = 0;
    return div(
        div(
            button('Add Item').click(() => {
                id ++;
                list.value.push(`label-${id}`);
            }),
            button('Reverse').click(() => list.value.reverse()),
            button('Clear').click(() => list.value = []),
        ),
        ForRef(list, (item, index) =>
            div(
                span(join`${index}: ${item};(or use link:${link(item.value)})`),
                button('Remove').click(() => { list.value.splice(index.value, 1); }),
                button('Update').click(() => { item.value += '!'; }),
            )
        ),
    );
}
mount(ForRefApp, '#jx-app');
```

#### If

```js
import { div, span, button, input, ref, mount, join, If } from 'link-dom';
function IfApp () {
    const num = ref(0);
    return div(
        div(
            span(join`num = ${num}`),
            input.bind(num),
            button('Increase').click(() => { num.value++; }),
        ),
        If(() => num.value < 2, () => span('num < 2'))
            .elif(() => num.value < 5, () => span('num < 5'))
            .else(() => span('num >= 5')),
    );
}
mount(IfApp, '#jx-app');
```

如果追求if表达式简洁，generator参数也可以直接使用元素，如下：

```js
If(() => num.value < 2, dom.span.text('num < 2'))
    .elif(() => num.value < 5, dom.span.text('num < 5'))
    .else(dom.span.text('num >= 5')),
```

这样做的坏处是，所有分支都会在第一时间被初始化，而不是在需要切换的时候按需初始化，所以在性能要求较高的场景，我们推荐generator参数使用箭头函数

#### Switch

```js
import { div, span, button, input, ref, mount, join, Switch } from 'link-dom';
function SwitchApp () {
    const num = ref(0);
    return div(
        div(
            span(join`num = ${num}`),
            input.bind(num),
            button('Increase').click(() => { num.value++; }),
        ),
        Switch(num)
            .case([ 0, 1 ], () => span('num < 2'))
            .case([ 2, 3, 4 ], () => span('num < 5'))
            .case(5, () => span('num = 5'))
            .default(() => span(join`num = ${num}`)),
    );
}
mount(SwitchApp, '#jx-app');
```

generator参数也可以直接使用元素，同If

#### Show

```js
import { div, button, ref, mount, Show, span } from 'link-dom';
function ShowApp () {
    const bool = ref(true);
    return div(
        button('Toggle').click(() => { bool.value = !bool.value; }),
        Show(bool, span('Hello World!'))
    );
}
mount(ShowApp, '#jx-app');
```

因为 show 的元素一开始肯定会被初始化，所以generator使用函数和元素效果相同

#### Await

```js
import { div, Await, mount } from 'link-dom';

function AwaitApp () {
    const mockFetch = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ id: 1, name: 'Tack' });
            }, 1000);
        });
    };
    return div(
        Await(mockFetch(), data =>
            div(`id = ${data.id}; name = ${data.name}`)
        )
    );
}
mount(AwaitApp, '#jx-app');
```

### Custom Renderer

#### Console.log

```js
import { div, ref, computed, mount, join, span } from 'link-dom';
import { useRenderer } from 'link-dom-render';
const root = useRenderer({
    render (node) {
        const prefix = new Array(node.deep).fill('  ').join('');
        const text = `${node.innerText}`;
        console.log(`${prefix}${node.tagName || 'text'}: ${text.trim()}`);
    }
});
const App = () => {
    const count = ref(0);
    const countAdd2 = computed(() => count.value + 2);

    setInterval(() => {
        count.value ++;
        console.clear();
        root.render();
    }, 1000);

    return div(
        span(join`count = ${count}`),
        div(join`count + 2 = ${countAdd2}`),
    );
};
mount(App, root);
```

#### Canvas 

```js
import { div, ref, mount, join, canvas, collectRef, span, button } from 'link-dom';
import { useRenderer } from 'link-dom-render';

const { ctx, msg } = (function initEnv () {
    const refs = collectRef('canvas');
    const msg = ref('Hello');
    mount(div(
        canvas.ref(refs.canvas).style('border', '1px solid red'),
        div(
            span(join`msg = ${msg}`),
            button('Add !').click(() => msg.value += '!'),
        )
    ), '#jx-app');
    const size = 300;
    const canvasEl = refs.canvas.el;
    const scale = window.devicePixelRatio;
    canvasEl.width = canvasEl.height = size * scale;
    canvasEl.style.width = canvasEl.style.height = `${size}px`;
    canvasEl.style.backgroundColor = '#333';
    const ctx = canvasEl.getContext('2d');
    ctx.font = `${15 * scale}px Microsoft Sans Serif`;
    ctx.fillStyle = '#eee';
    ctx.textBaseline = 'top';
    function loopRender () {
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        root.render();
        requestAnimationFrame(loopRender);
    }
    setTimeout(loopRender);
    return { ctx, msg };
})();

const root = useRenderer({
    render (element) {
        const parent = element.parentElement || { deep: 0, textLeft: 0 };
        if (!parent.textLeft) parent.textLeft = 10;
        ctx.fillText(element.textContent, parent.textLeft, (parent.deep - 1)  * 15 + 10);
        parent.textLeft += (ctx.measureText(element.textContent).width);
        return el => {el.textLeft = 0;};
    },
});

const App = () => {
    return div(() => `msg = ${msg.value}`);
};

mount(App, root);
```

#### Full Custom

```js
import { div, ref, mount, text, computed } from 'link-dom';
import { defineRenderer, RendererType } from 'link-dom-render';

defineRenderer({
    type: RendererType.Custom,
    querySelector (selector) {return selector === '#Root' ? LogElement.Root : null;},
    createElement (tag = '') {
        return new LogElement('element', tag);
    },
    createTextNode (text) {
        return new LogElement('text', text);
    },
    createComment () {
        return new LogElement('comment');
    },
    createFragment () {
        return new LogElement('frag');
    },
    querySelectorAll: function () {return [];},
    addStyle: function () {}
});

class LogElement {
    static Root = null;
    type = 'element';
    style = {}; // mock
    tagName = '';
    className = '';
    innerText = '';
    get textContent () {return this.innerText;};
    set textContent (v) {this.innerText = v;}
    deep = 0;
    get prefix () {
        return new Array(this.deep).fill('--').join('');
    }
    addEventListener () {};
    removeEventListener () {};
    setAttribute () {};
    removeAttribute () {};
    getAttribute () {return '';};
    classList = {};
    constructor (type, tag = '') {
        this.type = type;
        this.tagName = tag;
        this.innerText = '';
        if (tag === 'Root') LogElement.Root = this;
    }
    parentElement = null;
    get parentNode () {return this.parentElement;};
    removeCallList = [];
    remove () {
        const children = this.parentElement?.children;
        if (children) {
            children.splice(children.indexOf(this), 1);
            this.removeCallList.forEach(call => call(this));
        }
    }
    get innerHTML () {return this.innerText;}
    get outerHTML () {return this.innerText;}
    children = [];
    get childNodes () {
        return this.children;
    }
    mountCallList = [];
    appendChild (child) {
        this.children.push(child);
        child.mountCallList.forEach(call => call(child));
    }
    get nextSibling () {
        return this.parentElement?.children[this.index + 1] || null;
    }
    insertBefore (node, child) {
        if (child.parentElement !== this) {
            throw new Error('insertBefore error');
        }
        this.parentElement?.children.splice(child.index - 1, 0, node);
        child.mountCallList.forEach(call => call(child));
        return node;
    }
    get index () {
        const parent = this.parentElement;
        return !parent ? -1 : parent.children.indexOf(this);
    }
    render () {
        const text = `${this.innerText}`;
        if (this.type === 'text') {
            text && console.log(`${this.prefix}text: ${text.trim()}`);
        } else if (this.type === 'element') {
            console.log(`${this.prefix}${this.tagName}: ${text.trim()}`);
            this.children.forEach(item => {
                item.deep = this.deep + 1;
                item.render();
            });
        }
    }
}

const Root = new LogElement('element', 'Root');

const App = () => {
    const count = ref(0);
    const countAdd2 = computed(() => count.value + 2);

    setInterval(() => {
        count.value ++;
        console.clear();
        Root.render();
    }, 1000);
    return div(
        text(() => `count = ${count.value}`),
        div(() => `count + 2 = ${countAdd2.value}`)
    );
};

mount(App, Root);
```

### Router

```
npm i link-dom-router
```

```js
import { createRouter, routerLink, routerView } from 'link-dom-router';
import { button, div, mount, watch } from 'link-dom';

const PageSub = () => {
    return [
        div('Sub Start'),
        routerView(),
        div('Sub End'),
    ];
};
const PageSub1 = () => div('Sub Page1');
const PageA = () => {
    return div('PageA');
};
const router = createRouter({
    routes: [
        {
            path: '/',
            component: () => div('Page Index'),
        },
        {
            path: '/sub',
            component: PageSub,
            children: [
                {
                    path: '/sub',
                    component: () => div('Sub Index')
                },
                {
                    path: '/sub/s1',
                    component: PageSub1,
                },
                {
                    path: '/sub/s1/s1',
                    component: () => div('Sub Page1/s1')
                },
                {
                    path: '/sub/s2/s2',
                    component: () => div('Sub Page2/s2')
                },
                {
                    path: '/sub/404',
                    component: () => div('Sub 404'),
                },
            ]
        },
        {
            path: '/a',
            component: PageA,
        },
        {
            path: '/b',
            component: () => div('PageB')
        },
        {
            path: '/c',
            component: () => div('CompC'),
        },
        {
            path: '/x/:name/:#age/:!male',
            meta: { test: 'x' },
            component: (data) => {
                console.log(`test:query`, data.query);
                console.log(`test:param`, data.param);
                console.log(`test:meta`, data.meta);
                console.log(`test:route`, data.route);
                console.log(`test:path`, data.path);
                return div('CompX').children(
                    div(() => `query: ${JSON.stringify(data.query)}`),
                    div(() => `param: ${JSON.stringify(data.param)}`),
                    div(() => `meta: ${JSON.stringify(data.meta)}`),
                    div(() => `query.a: ${JSON.stringify(data.query.a)}`),
                );
            },
        },
        {
            path: '/404',
            component: () => div('404'),
        },
    ]
});

const App = () => {
    return div(
        div.class('')(),
        div.style({ display: 'flex', gap: '10px' })(
            routerLink('/'),
            routerLink('/sub/s1'),
            routerLink('/sub/s1/s1'),
            routerLink('/sub/s2/s2'),
            routerLink('/sub/s3'),
            routerLink('/a'),
            routerLink('/b'),
            routerLink('/c'),
            routerLink('/x/tack/31/true?a=1'),
            routerLink('/x/123/456/false?name=zs&age=18&male=true'),
            routerLink.back(),
            routerLink.forward(),
            routerLink.go(-2),
        ),
        div(
            button('Js Call1').click(() => {
                router.route({
                    path: '/x/:name/:#age/:!male',
                    param: { name: 'tack', age: 18, male: true },
                    query: { a: 1 },
                });
            }),
            button('Js Call2').click(() => {
                router.route({
                    path: '/x/alice/12/false',
                    query: { a: 2 },
                });
            }),
            button('Js Call3').click(() => {
                router.route('/x/alice/18/true?a=3');
            })
        ),
        routerView(),
    );
};

mount(App, '#jx-app');

// window.router = router;

watch(() => router.path, (val) => {
    console.log('router.currentPath', val);
});
watch(() => router.query, (val) => {
    console.log('router.query', val);
});
```

### SSR

```
npm i link-dom-ssr
```

```js
import { ssr, hydrate } from 'link-dom-ssr';
import { ref, div, button, join, collectRef, mount, link, For, If, span } from 'link-dom';

function CommonComponent (data) {
    const list = ref(data);
    const selected = ref('label2');
    let id = 0;
    return div.style('borderBottom', '2px solid #000')(
        button('clear').click(() => {
            list.value = [];
        }),
        button('init').click(() => {
            console.time();
            for (let i = 0; i < 10000; i++) {
                list.value.push({ label: `item${i}` });
            }
            console.timeEnd();
        }),
        button('reset').click(() => {
            list.value = [ { label: 'test' }, { label: 'test2' } ];
        }),
        button('reverse').click(() => {
            list.value.reverse();
        }),
        button('sort').click(() => {
            list.value.sort((a, b) => a.label.localeCompare(b.label));
        }),
        button('add').click(() => {
            list.value.push({ label: `item${id++}` });
        }),
        span(join`selected:${selected}`),
        For(list, (item, index) => {
            return div.style('color', () => selected.value === item.label ? 'red' : 'green')(
                If(() => selected.value === item.label, () => span('selected'))
                    .else(() => span('unselected')),
                span(join`: index = ${index}; label = ${link(item.label)}`).click(() => {
                    selected.value = item.label;
                }),
                button('×').click(() => {
                    list.value.splice(index.value, 1);
                })
            );
        }),
    );
}

function SSRContainer () {
    const data = [ { label: 'label1' }, { label: 'label2' } ];
    const refs = collectRef('container');
    return div(
        button('Start SSR Render').click(() => {
            const html = ssr(CommonComponent)(data);
            console.log('html', html);
            refs.container.html(html);
        }),
        button('Start Hydrate').click(() => {
            hydrate(CommonComponent)(data);
        }),
        div.style('fontWeight', 'bold')('SSR Container:'),
        div.ref(refs.container),
    );
}
mount(SSRContainer, '#jx-app');
```