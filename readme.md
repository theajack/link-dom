
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
function Reactive () {
    const name = ref('');
    return dom.div.children(
        dom.div.text(() => `Hello World! ${name.value}`),
        // Or use join
        dom.div.text(join`Hello World! ${name}`),
        dom.input.attr('placeholder', 'Input your name').bind(name)
    );
}
mount(Reactive, '#jx-app');
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
mount(Style, '#jx-app');
```

#### StyleLink

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
mount(Style, '#jx-app');
```

#### Global Style

```js
import { dom, ref, mount, join } from 'link-dom';
function GlobalStyle () {
    const font = ref(12);
    const color = ref('red');
    const colorB = ref('green');
    mount(dom.style({
        '.parent': {
            fontWeight: 'bold',
            color: color,
            fontSize: font,
            '.child': {
                color: colorB,
            }
        }
    }), 'head');
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
mount(GlobalStyle, '#jx-app');
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
mount(Counter, '#jx-app');
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
mount(CollectRef, '#jx-app');
```

### Controller

#### For (Reactive List)

```js
import { dom, ref, mount, join, ctrl, link } from 'link-dom';
function For () {
    const list = ref([] as {id: string, label: string}[]);
    let id = 0;
    return dom.div.children(
        dom.div.children(
            dom.button.text('Add Item').click(() => {
                id ++;
                list.value.push({ id: `id-${id}`, label: `label-${id}` });
            }),
            dom.button.text('Reverse').click(() => list.value.reverse()),
            dom.button.text('Clear').click(() => list.value = []),
        ),
        ctrl.for(list, (item, index) =>
            dom.div.children(
                dom.span.text(join`${index}: ${link(item.id)}: ${link(item.label)}`),
                dom.button.text('Remove').click(() => { list.value.splice(index.value, 1); }),
                dom.button.text('Update').click(() => { item.label += '!'; }),
            )
        ),
    );
}
mount(For, '#jx-app');
```

#### ForRef

```js
import { dom, ref, mount, join, ctrl, link } from 'link-dom';
function ForRef () {
    const list = ref([] as string[]);
    let id = 0;
    return dom.div.children(
        dom.div.children(
            dom.button.text('Add Item').click(() => {
                id ++;
                list.value.push(`label-${id}`);
            }),
            dom.button.text('Reverse').click(() => list.value.reverse()),
            dom.button.text('Clear').click(() => list.value = []),
        ),
        ctrl.forRef(list, (item, index) =>
            dom.div.children(
                dom.span.text(join`${index}: ${item};(or use link:${link(item.value)})`),
                dom.button.text('Remove').click(() => { list.value.splice(index.value, 1); }),
                dom.button.text('Update').click(() => { item.value += '!'; }),
            )
        ),
    );
}
mount(ForRef, '#jx-app');
```

#### If

```js
import { dom, ref, mount, join, ctrl } from 'link-dom';
function If () {
    const num = ref(0);
    return dom.div.children(
        dom.div.children(
            dom.span.text(join`num = ${num}`),
            dom.input.bind(num),
            dom.button.text('Increase').click(() => { num.value++; }),
        ),
        ctrl.if(() => num.value < 2, () => dom.span.text('num < 2'))
            .elif(() => num.value < 5, () => dom.span.text('num < 5'))
            .else(() => dom.span.text('num >= 5')),
    );
}
mount(If, '#jx-app');
```

如果追求if表达式简洁，generator参数也可以直接使用元素，如下：

```js
ctrl.if(() => num.value < 2, dom.span.text('num < 2'))
    .elif(() => num.value < 5, dom.span.text('num < 5'))
    .else(dom.span.text('num >= 5')),
```

这样做的坏处是，所有分支都会在第一时间被初始化，而不是在需要切换的时候按需初始化，所以在性能要求较高的场景，我们推荐generator参数使用箭头函数

#### Switch

```js
import { dom, ref, mount, join, ctrl } from 'link-dom';
function Switch () {
    const num = ref(0);
    return dom.div.children(
        dom.div.children(
            dom.span.text(join`num = ${num}`),
            dom.input.bind(num),
            dom.button.text('Increase').click(() => { num.value++; }),
        ),
        ctrl.switch(num)
            .case([ 0, 1 ], () => dom.span.text('num < 2'))
            .case([ 2, 3, 4 ], () => dom.span.text('num < 5'))
            .case(5, () => dom.span.text('num = 5'))
            .default(() => dom.span.text(join`num = ${num}`)),
    );
}
mount(Switch, '#jx-app');
```

generator参数也可以直接使用元素，同If

#### Show

```js
import { dom, ref, mount, ctrl } from 'link-dom';
function Show () {
    const bool = ref(true);
    return dom.div.children(
        dom.button.text('Toggle').click(() => { bool.value = !bool.value; }),
        ctrl.show(bool, dom.span.text('Hello World!'))
    );
}
mount(Show, '#jx-app');
```

因为 show 的元素一开始肯定会被初始化，所以generator使用函数和元素效果相同

#### Await

```js
function Await () {
    const mockFetch = () => {
        return new Promise<{id: number, name: string}>((resolve) => {
            setTimeout(() => {
                resolve({ id: 1, name: 'Tack' });
            }, 1000);
        });
    };
    return dom.div.children(
        ctrl.await(mockFetch(), data =>
            dom.div.children(
                dom.span.text(`id = ${data.id}; name = ${data.name}`),
            )
        )
    );
}
mount(Await, '#jx-app');
```

### Custom Renderer

#### Console.log

```js
import { dom, ref, computed, mount, join, collectRef } from 'link-dom';
import { type CustomElement, useRenderer } from 'link-dom-render';
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

    return dom.div.children(
        dom.span.text(join`count = ${count}`),
        dom.div.text(join`count + 2 = ${countAdd2}`),
    );
};
mount(App, root);
```

#### Canvas 

```js
import { dom, ref, mount, join } from 'link-dom';
import { useRenderer } from 'link-dom-render';
interface ICustomEle extends CustomElement {
    textLeft: number;
    deep: number;
    parentElement: ICustomEle|null;
}
const { ctx, msg } = (function initEnv () {
    const refs = collectRef('canvas');
    const msg = ref('Hello');
    mount(dom.div.children(
        dom.canvas.ref(refs.canvas).style('border', '1px solid red'),
        dom.div.children(
            dom.span.text(join`msg = ${msg}`),
            dom.button.text('Add !').click(() => msg.value += '!'),
        )
    ), '#jx-app');
    const size = 300;
    const canvas = refs.canvas.el as HTMLCanvasElement;
    const scale = window.devicePixelRatio;
    canvas.width = canvas.height = size * scale;
    canvas.style.width = canvas.style.height = `${size}px`;
    canvas.style.backgroundColor = '#333';
    const ctx = canvas.getContext('2d')!;
    ctx.font = `${15 * scale}px Microsoft Sans Serif`;
    ctx.fillStyle = '#eee';
    ctx.textBaseline = 'top';
    function loopRender () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        root.render();
        requestAnimationFrame(loopRender);
    }
    setTimeout(loopRender);
    return { ctx, msg };
})();

const root = useRenderer<ICustomEle>({
    render (element) {
        const parent: ICustomEle = element.parentElement || { deep: 0, textLeft: 0 } as ICustomEle;
        if (!parent.textLeft) parent.textLeft = 10;
        ctx.fillText(element.textContent, parent.textLeft, (parent.deep - 1)  * 15 + 10);
        parent.textLeft += (ctx.measureText(element.textContent).width);
        return el => {el.textLeft = 0;};
    },
});

const App = () => {
    return dom.div.text(() => `msg = ${msg.value}`);
};

mount(App, root);
```

#### Full Custom

```js
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
    querySelectorAll: function (): IElement<any>[] {return [];},
    addStyle: function (): void {}
});

class LogElement implements IElement {
    static Root: null|LogElement = null;
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
    classList = {} as any;
    constructor (type, tag = '') {
        this.type = type;
        this.tagName = tag;
        this.innerText = '';
        if (tag === 'Root') LogElement.Root = this;
    }
    parentElement: LogElement|null = null;
    get parentNode () {return this.parentElement;};
    removeCallList: any[] = [];
    remove () {
        const children = this.parentElement?.children;
        if (children) {
            children.splice(children.indexOf(this), 1);
            this.removeCallList.forEach(call => call(this));
        }
    }
    get innerHTML () {return this.innerText;}
    get outerHTML () {return this.innerText;}
    children: LogElement[] = [];
    get childNodes () {
        return this.children;
    }
    mountCallList: any[] = [];
    appendChild (child: LogElement) {
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
    return dom.div.children(
        dom.span.text(() => `count = ${count.value}`),
        dom.div.text(() => `count + 2 = ${countAdd2.value}`)
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
import { dom, mount, watch } from 'link-dom';

const PageSub = () => {
    return [
        dom.div.text('Sub Start'),
        routerView(),
        dom.div.text('Sub End'),
    ];
};
const PageSub1 = () => dom.div.text('Sub Page1');
const PageA = () => {
    return dom.div.text('PageA');
};
const router = createRouter({
    routes: [
        {
            path: '/',
            component: () => dom.div.text('Page Index'),
        },
        {
            path: '/sub',
            component: PageSub,
            children: [
                {
                    path: '/sub',
                    component: () => dom.div.text('Sub Index')
                },
                {
                    path: '/sub/s1',
                    component: PageSub1,
                },
                {
                    path: '/sub/s1/s1',
                    component: () => dom.div.text('Sub Page1/s1')
                },
                {
                    path: '/sub/s2/s2',
                    component: () => dom.div.text('Sub Page2/s2')
                },
                {
                    path: '/sub/404',
                    component: () => dom.div.text('Sub 404'),
                },
            ]
        },
        {
            path: '/a',
            component: PageA,
        },
        {
            path: '/b',
            component: () => dom.div.text('PageB')
        },
        {
            path: '/c',
            component: () => dom.div.text('CompC'),
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
                return dom.div.text('CompX').children(
                    dom.div.text(() => `query: ${JSON.stringify(data.query)}`),
                    dom.div.text(() => `param: ${JSON.stringify(data.param)}`),
                    dom.div.text(() => `meta: ${JSON.stringify(data.meta)}`),
                    dom.div.text(() => `query.a: ${JSON.stringify(data.query.a)}`),
                );
            },
        },
        {
            path: '/404',
            component: () => dom.div.text('404'),
        },
    ]
});

const App = () => {
    return dom.div.children(
        dom.div.style({ display: 'flex', gap: '10px' }).children(
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
        dom.div.children(
            dom.button.text('Js Call1').click(() => {
                router.route({
                    path: '/x/:name/:#age/:!male',
                    param: { name: 'tack', age: 18, male: true },
                    query: { a: 1 },
                });
            }),
            dom.button.text('Js Call2').click(() => {
                router.route({
                    path: '/x/alice/12/false',
                    query: { a: 2 },
                });
            }),
            dom.button.text('Js Call3').click(() => {
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
import { ref, dom, ctrl, join, collectRef, mount, link } from 'link-dom';

function CommonComponent (data: {label: string}[]) {
    const list = ref(data);
    const selected = ref('label2');
    let id = 0;
    return dom.div.style('borderBottom', '2px solid #000').children(
        dom.button.text('clear').click(() => {
            list.value = [];
        }),
        dom.button.text('init').click(() => {
            console.time();
            for (let i = 0; i < 10000; i++) {
                list.value.push({ label: `item${i}` });
            }
            console.timeEnd();
        }),
        dom.button.text('reset').click(() => {
            list.value = [ { label: 'test' }, { label: 'test2' } ];
        }),
        dom.button.text('reverse').click(() => {
            list.value.reverse();
        }),
        dom.button.text('sort').click(() => {
            list.value.sort((a, b) => a.label.localeCompare(b.label));
        }),
        dom.button.text('add').click(() => {
            list.value.push({ label: `item${id++}` });
        }),
        dom.span.text(join`selected:${selected}`),
        ctrl.for(list, (item, index) => {
            return dom.div.style('color', () => selected.value === item.label ? 'red' : 'green')
                .children(
                    ctrl.if(() => selected.value === item.label, () => dom.span.text('selected'))
                        .else(() => dom.span.text('unselected')),
                    dom.span.text(join`: index = ${index}; label = ${link(item.label)}`).click(() => {
                        selected.value = item.label;
                    }),
                    dom.button.text('×').click(() => {
                        list.value.splice(index.value, 1);
                    })
                );
        }),
    );
}

function SSRContainer () {
    const data = [ { label: 'label1' }, { label: 'label2' } ];
    const refs = collectRef('container');
    return dom.div.children(
        dom.button.text('Start SSR Render').click(() => {
            const html = ssr(CommonComponent)(data);
            console.log('html', html);
            refs.container.html(html);
        }),
        dom.button.text('Start Hydrate').click(() => {
            hydrate(CommonComponent)(data);
        }),
        dom.div.style('fontWeight', 'bold').text('SSR Container:'),
        dom.div.ref(refs.container),
    );
}
mount(SSRContainer, '#jx-app');
```