window.jsboxConfig = {
    "libs": {
        "link-dom": "https://cdn.jsdelivr.net/npm/link-dom",
        "link-dom-reactive": "https://cdn.jsdelivr.net/npm/link-dom-reactive",
        "link-dom-ssr": "https://cdn.jsdelivr.net/npm/link-dom-ssr",
        "link-dom-router": "https://cdn.jsdelivr.net/npm/link-dom-router",
        "link-dom-render": "https://cdn.jsdelivr.net/npm/link-dom-render"
    },
    "iifeMap": {
        "link-dom": "LinkDom",
        "link-dom-reactive": "LinkDomReactive",
        "link-dom-ssr": "LinkDomSsr",
        "link-dom-router": "LinkDomRouter",
        "link-dom-render": "LinkDomRender"
    },
    "codes": {
        "Reactive": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "desc": "Reactive Data",
            "title": "Basic Usage",
            "code": "import { dom, ref, mount, join } from 'link-dom';\nfunction Reactive () {\n    const name = ref('');\n    return dom.div.children(\n        dom.div.text(() => `Hello World! ${name.value}`),\n        // Or use join\n        dom.div.text(join`Hello World! ${name}`),\n        dom.input.attr('placeholder', 'Input your name').bind(name)\n    );\n}\nmount(Reactive, '#jx-app');"
        },
        "CollectRef": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "code": "import { dom, mount, collectRef } from 'link-dom';\nfunction CollectRef () {\n    const refs = collectRef('hello');\n    return dom.div.children(\n        dom.span.ref(refs.hello).text('Hello World!'),\n        dom.button.text('Log Ref').click(() => {\n            console.log(refs.hello);\n            const text = refs.hello.text();\n            refs.hello.text(text + '!');\n        }),\n    );\n}\nmount(CollectRef, '#jx-app');"
        },
        "Counter": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "desc": "Counter Demo",
            "code": "import { dom, ref, mount, join } from 'link-dom';\nfunction Counter () {\n    const count = ref(0);\n    return dom.div.children(\n        dom.div.text(join`Count = ${count}`),\n        dom.input.bind(count),\n        dom.button.text('Increase').click(() => {\n            count.value++;\n        }),\n    );\n}\nmount(Counter, '#jx-app');"
        },
        "Style": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "desc": "Basic Style",
            "title": "Style",
            "code": "import { dom, ref, mount, join } from 'link-dom';\nfunction Style () {\n    const font = ref(12);\n    const color = ref('red');\n    return dom.div.children(\n        dom.div.style({\n            fontWeight: 'bold',\n            color: color,\n            fontSize: font,\n        }).text(join`Color = ${color}; FontSize = ${font}`),\n        dom.div.children(\n            dom.text('color: '),\n            dom.input.bind(color),\n        ),\n        dom.div.children(\n            dom.text('font: '),\n            dom.input.bind(font),\n            dom.button.text('Increase').click(() => font.value++)\n        )\n    );\n}\nmount(Style, '#jx-app');"
        },
        "Style Link": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "desc": "Style Link Usage",
            "code": "import { dom, ref, mount, join } from 'link-dom';\nfunction Style () {\n    const font = ref(12);\n    const color = ref('red');\n    return dom.div.children(\n        dom.div.style({\n            fontWeight: 'bold',\n            color: color,\n            fontSize: font,\n        }).text(join`Color = ${color}; FontSize = ${font}`),\n        dom.div.children(\n            dom.text('color: '),\n            dom.input.bind(color),\n        ),\n        dom.div.children(\n            dom.text('font: '),\n            dom.input.bind(font),\n            dom.button.text('Increase').click(() => font.value++)\n        )\n    );\n}\nmount(Style, '#jx-app');"
        },
        "Global Style": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "code": "import { dom, ref, mount, join } from 'link-dom';\nfunction GlobalStyle () {\n    const font = ref(12);\n    const color = ref('red');\n    const colorB = ref('green');\n    mount(dom.style({\n        '.parent': {\n            fontWeight: 'bold',\n            color: color,\n            fontSize: font,\n            '.child': {\n                color: colorB,\n            }\n        }\n    }), 'head');\n    return dom.div.children(\n        dom.div.class('parent').children(\n            dom.div.text(join`Color = ${color}; FontSize = ${font}`),\n            dom.div.class('child').text(join`Child Color = ${colorB}`),\n        ),\n        dom.div.children(\n            dom.text('color: '),\n            dom.input.bind(color),\n        ),\n        dom.div.children(\n            dom.text('child color: '),\n            dom.input.bind(colorB),\n        ),\n        dom.div.children(\n            dom.text('font: '),\n            dom.input.bind(font),\n            dom.button.text('Increase').click(() => font.value++)\n        )\n    );\n}\nmount(GlobalStyle, '#jx-app');"
        },
        "For": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "desc": "Reactive Array",
            "title": "Controller",
            "code": "import { dom, ref, mount, join, ctrl, link } from 'link-dom';\nfunction For () {\n    const list = ref([]);\n    let id = 0;\n    return dom.div.children(\n        dom.div.children(\n            dom.button.text('Add Item').click(() => {\n                id ++;\n                list.value.push({ id: `id-${id}`, label: `label-${id}` });\n            }),\n            dom.button.text('Reverse').click(() => list.value.reverse()),\n            dom.button.text('Clear').click(() => list.value = []),\n        ),\n        ctrl.for(list, (item, index) =>\n            dom.div.children(\n                dom.span.text(join`${index}: ${link(item.id)}: ${link(item.label)}`),\n                dom.button.text('Remove').click(() => { list.value.splice(index.value, 1); }),\n                dom.button.text('Update').click(() => { item.label += '!'; }),\n            )\n        ),\n    );\n}\nmount(For, '#jx-app');"
        },
        "ForRef": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "desc": "Reactive Array For Simple Value",
            "code": "import { dom, ref, mount, join, ctrl, link } from 'link-dom';\nfunction ForRef () {\n    const list = ref([]);\n    let id = 0;\n    return dom.div.children(\n        dom.div.children(\n            dom.button.text('Add Item').click(() => {\n                id ++;\n                list.value.push(`label-${id}`);\n            }),\n            dom.button.text('Reverse').click(() => list.value.reverse()),\n            dom.button.text('Clear').click(() => list.value = []),\n        ),\n        ctrl.forRef(list, (item, index) =>\n            dom.div.children(\n                dom.span.text(join`${index}: ${item};(or use link:${link(item.value)})`),\n                dom.button.text('Remove').click(() => { list.value.splice(index.value, 1); }),\n                dom.button.text('Update').click(() => { item.value += '!'; }),\n            )\n        ),\n    );\n}\nmount(ForRef, '#jx-app');"
        },
        "If": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "code": "import { dom, ref, mount, join, ctrl } from 'link-dom';\nfunction If () {\n    const num = ref(0);\n    return dom.div.children(\n        dom.div.children(\n            dom.span.text(join`num = ${num}`),\n            dom.input.bind(num),\n            dom.button.text('Increase').click(() => { num.value++; }),\n        ),\n        ctrl.if(() => num.value < 2, () => dom.span.text('num < 2'))\n            .elif(() => num.value < 5, () => dom.span.text('num < 5'))\n            .else(() => dom.span.text('num >= 5')),\n    );\n}\nmount(If, '#jx-app');"
        },
        "Switch": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "code": "import { dom, ref, mount, join, ctrl } from 'link-dom';\nfunction Switch () {\n    const num = ref(0);\n    return dom.div.children(\n        dom.div.children(\n            dom.span.text(join`num = ${num}`),\n            dom.input.bind(num),\n            dom.button.text('Increase').click(() => { num.value++; }),\n        ),\n        ctrl.switch(num)\n            .case([ 0, 1 ], () => dom.span.text('num < 2'))\n            .case([ 2, 3, 4 ], () => dom.span.text('num < 5'))\n            .case(5, () => dom.span.text('num = 5'))\n            .default(() => dom.span.text(join`num = ${num}`)),\n    );\n}\nmount(Switch, '#jx-app');"
        },
        "Show": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "code": "import { dom, ref, mount, ctrl } from 'link-dom';\nfunction Show () {\n    const bool = ref(true);\n    return dom.div.children(\n        dom.button.text('Toggle').click(() => { bool.value = !bool.value; }),\n        ctrl.show(bool, dom.span.text('Hello World!'))\n    );\n}\nmount(Show, '#jx-app');"
        },
        "Await": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "code": "import { dom, mount, ctrl } from 'link-dom';\nfunction Await () {\n    const mockFetch = () => {\n        return new Promise((resolve) => {\n            setTimeout(() => {\n                resolve({ id: 1, name: 'Tack' });\n            }, 1000);\n        });\n    };\n    return dom.div.children(\n        ctrl.await(mockFetch(), data =>\n            dom.div.children(\n                dom.span.text(`id = ${data.id}; name = ${data.name}`),\n            )\n        )\n    );\n}\nmount(Await, '#jx-app');"
        },
        "Log Render": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom",
                "link-dom-render"
            ],
            "title": "Custom Renderer",
            "code": "import { dom, ref, computed, mount, join } from 'link-dom';\nimport { useRenderer } from 'link-dom-render';\nconst root = useRenderer({\n    render (node) {\n        const prefix = new Array(node.deep).fill('  ').join('');\n        const text = `${node.innerText}`;\n        console.log(`${prefix}${node.tagName || 'text'}: ${text.trim()}`);\n    }\n});\nconst App = () => {\n    const count = ref(0);\n    const countAdd2 = computed(() => count.value + 2);\n\n    setInterval(() => {\n        count.value ++;\n        console.clear();\n        root.render();\n    }, 1000);\n\n    return dom.div.children(\n        dom.span.text(join`count = ${count}`),\n        dom.div.text(join`count + 2 = ${countAdd2}`),\n    );\n};\nmount(App, root);"
        },
        "Canvas Render": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom",
                "link-dom-render"
            ],
            "code": "/*\n * @Author: chenzhongsheng\n * @Date: 2025-09-27 10:02:55\n * @Description: Coding something\n */\n\nimport { dom, ref, mount, join, collectRef  } from 'link-dom';\nimport { useRenderer } from 'link-dom-render';\n\nconst { ctx, msg } = (function initEnv () {\n    const refs = collectRef('canvas');\n    const msg = ref('Hello');\n    mount(dom.div.children(\n        dom.canvas.ref(refs.canvas).style('border', '1px solid red'),\n        dom.div.children(\n            dom.span.text(join`msg = ${msg}`),\n            dom.button.text('Add !').click(() => msg.value += '!'),\n        )\n    ), '#jx-app');\n    const size = 300;\n    const canvas = refs.canvas.el;\n    const scale = window.devicePixelRatio;\n    canvas.width = canvas.height = size * scale;\n    canvas.style.width = canvas.style.height = `${size}px`;\n    canvas.style.backgroundColor = '#333';\n    const ctx = canvas.getContext('2d');\n    ctx.font = `${15 * scale}px Microsoft Sans Serif`;\n    ctx.fillStyle = '#eee';\n    ctx.textBaseline = 'top';\n    function loopRender () {\n        ctx.clearRect(0, 0, canvas.width, canvas.height);\n        root.render();\n        requestAnimationFrame(loopRender);\n    }\n    setTimeout(loopRender);\n    return { ctx, msg };\n})();\n\nconst root = useRenderer({\n    render (element) {\n        // 此处仅为一个简单的例子，如果需要更复杂的渲染，需要自己实现CustomElement计算布局\n        ctx.fillText(element.textContent, 0, 0);\n    },\n});\n\nconst App = () => {\n    return dom.div.text(() => `msg = ${msg.value}`);\n};\n\nmount(App, root);"
        },
        "Full Custom": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom",
                "link-dom-render"
            ],
            "code": "import { dom, ref, mount, computed } from 'link-dom';\nimport { defineRenderer, RendererType } from 'link-dom-render';\n\ndefineRenderer({\n    type: RendererType.Custom,\n    querySelector (selector) {return selector === '#Root' ? LogElement.Root : null;},\n    createElement (tag = '') {\n        return new LogElement('element', tag);\n    },\n    createTextNode (text) {\n        return new LogElement('text', text);\n    },\n    createComment () {\n        return new LogElement('comment');\n    },\n    createFragment () {\n        return new LogElement('frag');\n    },\n    querySelectorAll: function () {return [];},\n});\n\nclass LogElement {\n    static Root = null;\n    type = 'element';\n    style = {}; // mock\n    tagName = '';\n    className = '';\n    innerText = '';\n    get textContent () {return this.innerText;};\n    set textContent (v) {this.innerText = v;}\n    deep = 0;\n    get prefix () {\n        return new Array(this.deep).fill('--').join('');\n    }\n    addEventListener () {};\n    removeEventListener () {};\n    setAttribute () {};\n    removeAttribute () {};\n    getAttribute () {return '';};\n    classList = {};\n    constructor (type, tag = '') {\n        this.type = type;\n        this.tagName = tag;\n        this.innerText = '';\n        if (tag === 'Root') LogElement.Root = this;\n    }\n    parentElement = null;\n    get parentNode () {return this.parentElement;};\n    removeCallList = [];\n    remove () {\n        const children = this.parentElement?.children;\n        if (children) {\n            children.splice(children.indexOf(this), 1);\n            this.removeCallList.forEach(call => call(this));\n        }\n    }\n    get innerHTML () {return this.innerText;}\n    get outerHTML () {return this.innerText;}\n    children = [];\n    get childNodes () {\n        return this.children;\n    }\n    mountCallList = [];\n    appendChild (child) {\n        this.children.push(child);\n        child.mountCallList.forEach(call => call(child));\n    }\n    get nextSibling () {\n        return this.parentElement?.children[this.index + 1] || null;\n    }\n    insertBefore (node, child) {\n        if (child.parentElement !== this) {\n            throw new Error('insertBefore error');\n        }\n        this.parentElement?.children.splice(child.index - 1, 0, node);\n        child.mountCallList.forEach(call => call(child));\n        return node;\n    }\n    get index () {\n        const parent = this.parentElement;\n        return !parent ? -1 : parent.children.indexOf(this);\n    }\n    render () {\n        const text = `${this.innerText}`;\n        if (this.type === 'text') {\n            text && console.log(`${this.prefix}text: ${text.trim()}`);\n        } else if (this.type === 'element') {\n            console.log(`${this.prefix}${this.tagName}: ${text.trim()}`);\n            this.children.forEach(item => {\n                item.deep = this.deep + 1;\n                item.render();\n            });\n        }\n    }\n}\n\nconst Root = new LogElement('element', 'Root');\n\nconst App = () => {\n    const count = ref(0);\n    const countAdd2 = computed(() => count.value + 2);\n\n    setInterval(() => {\n        count.value ++;\n        console.clear();\n        Root.render();\n    }, 1000);\n    return dom.div.children(\n        dom.span.text(() => `count = ${count.value}`),\n        dom.div.text(() => `count + 2 = ${countAdd2.value}`)\n    );\n};\n\nmount(App, Root);"
        },
        "Router": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom",
                "link-dom-router"
            ],
            "title": "Router",
            "code": "import { createRouter, routerLink, routerView } from 'link-dom-router';\nimport { dom, mount, watch } from 'link-dom';\n\nconst PageSub = () => {\n    return [\n        dom.div.text('Sub Start'),\n        routerView(),\n        dom.div.text('Sub End'),\n    ];\n};\nconst PageSub1 = () => dom.div.text('Sub Page1');\nconst PageA = () => {\n    return dom.div.text('PageA');\n};\nconst router = createRouter({\n    routes: [\n        {\n            path: '/',\n            component: () => dom.div.text('Page Index'),\n        },\n        {\n            path: '/sub',\n            component: PageSub,\n            children: [\n                {\n                    path: '/sub',\n                    component: () => dom.div.text('Sub Index')\n                },\n                {\n                    path: '/sub/s1',\n                    component: PageSub1,\n                },\n                {\n                    path: '/sub/s1/s1',\n                    component: () => dom.div.text('Sub Page1/s1')\n                },\n                {\n                    path: '/sub/s2/s2',\n                    component: () => dom.div.text('Sub Page2/s2')\n                },\n                {\n                    path: '/sub/404',\n                    component: () => dom.div.text('Sub 404'),\n                },\n            ]\n        },\n        {\n            path: '/a',\n            component: PageA,\n        },\n        {\n            path: '/b',\n            component: () => dom.div.text('PageB')\n        },\n        {\n            path: '/c',\n            component: () => dom.div.text('CompC'),\n        },\n        {\n            path: '/x/:name/:#age/:!male',\n            meta: { test: 'x' },\n            component: (data) => {\n                console.log(`test:query`, data.query);\n                console.log(`test:param`, data.param);\n                console.log(`test:meta`, data.meta);\n                console.log(`test:route`, data.route);\n                console.log(`test:path`, data.path);\n                return dom.div.text('CompX').children(\n                    dom.div.text(() => `query: ${JSON.stringify(data.query)}`),\n                    dom.div.text(() => `param: ${JSON.stringify(data.param)}`),\n                    dom.div.text(() => `meta: ${JSON.stringify(data.meta)}`),\n                    dom.div.text(() => `query.a: ${JSON.stringify(data.query.a)}`),\n                );\n            },\n        },\n        {\n            path: '/404',\n            component: () => dom.div.text('404'),\n        },\n    ]\n});\n\nconst App = () => {\n    return dom.div.children(\n        dom.div.style({ display: 'flex', gap: '10px' }).children(\n            routerLink('/'),\n            routerLink('/sub/s1'),\n            routerLink('/sub/s1/s1'),\n            routerLink('/sub/s2/s2'),\n            routerLink('/sub/s3'),\n            routerLink('/a'),\n            routerLink('/b'),\n            routerLink('/c'),\n            routerLink('/x/tack/31/true?a=1'),\n            routerLink('/x/123/456/false?name=zs&age=18&male=true'),\n            routerLink.back(),\n            routerLink.forward(),\n            routerLink.go(-2),\n        ),\n        dom.div.children(\n            dom.button.text('Js Call1').click(() => {\n                router.route({\n                    path: '/x/:name/:#age/:!male',\n                    param: { name: 'tack', age: 18, male: true },\n                    query: { a: 1 },\n                });\n            }),\n            dom.button.text('Js Call2').click(() => {\n                router.route({\n                    path: '/x/alice/12/false',\n                    query: { a: 2 },\n                });\n            }),\n            dom.button.text('Js Call3').click(() => {\n                router.route('/x/alice/18/true?a=3');\n            })\n        ),\n        routerView(),\n    );\n};\n\nmount(App, '#jx-app');\n\n// window.router = router;\n\nwatch(() => router.path, (val) => {\n    console.log('router.currentPath', val);\n});\nwatch(() => router.query, (val) => {\n    console.log('router.query', val);\n});"
        },
        "SSR": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom",
                "link-dom-ssr"
            ],
            "title": "SSR",
            "code": "import { ssr, hydrate } from 'link-dom-ssr';\nimport { ref, dom, ctrl, join, collectRef, mount, link } from 'link-dom';\n\nfunction CommonComponent (data) {\n    const list = ref(data);\n    const selected = ref('label2');\n    let id = 0;\n    return dom.div.style('borderBottom', '2px solid #000').children(\n        dom.button.text('clear').click(() => {\n            list.value = [];\n        }),\n        dom.button.text('init').click(() => {\n            console.time();\n            for (let i = 0; i < 10000; i++) {\n                list.value.push({ label: `item${i}` });\n            }\n            console.timeEnd();\n        }),\n        dom.button.text('reset').click(() => {\n            list.value = [ { label: 'test' }, { label: 'test2' } ];\n        }),\n        dom.button.text('reverse').click(() => {\n            list.value.reverse();\n        }),\n        dom.button.text('sort').click(() => {\n            list.value.sort((a, b) => a.label.localeCompare(b.label));\n        }),\n        dom.button.text('add').click(() => {\n            list.value.push({ label: `item${id++}` });\n        }),\n        dom.span.text(join`selected:${selected}`),\n        ctrl.for(list, (item, index) => {\n            return dom.div.style('color', () => selected.value === item.label ? 'red' : 'green')\n                .children(\n                    ctrl.if(() => selected.value === item.label, () => dom.span.text('selected'))\n                        .else(() => dom.span.text('unselected')),\n                    dom.span.text(join`: index = ${index}; label = ${link(item.label)}`).click(() => {\n                        selected.value = item.label;\n                    }),\n                    dom.button.text('×').click(() => {\n                        list.value.splice(index.value, 1);\n                    })\n                );\n        }),\n    );\n}\n\nfunction SSRContainer () {\n    const data = [ { label: 'label1' }, { label: 'label2' } ];\n    const refs = collectRef('container');\n    return dom.div.children(\n        dom.button.text('Start SSR Render').click(() => {\n            const html = ssr(CommonComponent)(data);\n            console.log('html', html);\n            refs.container.html(html);\n        }),\n        dom.button.text('Start Hydrate').click(() => {\n            hydrate(CommonComponent)(data);\n        }),\n        dom.div.style('fontWeight', 'bold').text('SSR Container:'),\n        dom.div.ref(refs.container),\n    );\n}\nmount(SSRContainer, '#jx-app');"
        }
    }
}