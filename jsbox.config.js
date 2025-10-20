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
        "Ref": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "desc": "Reactive Data",
            "title": "Basic Usage",
            "code": "import { div, input, ref, mount, join, computed } from 'link-dom';\nfunction Ref () {\n    const name = ref('');\n    const name2 = computed(() => `【name】 ${name.value}`);\n    return div(\n        div(() => `Hello World! ${name.value}`),\n        // Or use join\n        div(join`Hello World! ${name}`),\n        div(join`Computed: ${name2}`),\n        input.bind(name).placeholder('Input your name')\n    );\n}\nmount(Ref, '#jx-app');"
        },
        "Reactive Link": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "desc": "Reactive Data",
            "code": "import { div, input, mount, join, reactive, button, link } from 'link-dom';\nfunction Reactive () {\n    const data = reactive({\n        name: 'bob',\n        age: 11\n    });\n    return div(\n        div(join`Hello World! ${() => data.name}`),\n        // Or use link\n        div(join`Hello World! ${link(data.name)}`),\n        input.bind(link(data.name)),\n        div(join`age: ${link(data.age)}`),\n        input.bind(link(data.age)),\n        button('Increase Age').click(() => data.age++ )\n    );\n}\nmount(Reactive, '#jx-app');"
        },
        "CollectRef": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "code": "import { mount, collectRef, div, span, button } from 'link-dom';\nfunction CollectRef () {\n    const refs = collectRef('hello');\n    return div(\n        span('Hello World!').ref(refs.hello),\n        button('Log Ref').click(() => {\n            console.log(refs.hello);\n            const text = refs.hello.text();\n            refs.hello.text(text + '!');\n        }),\n    );\n}\nmount(CollectRef, '#jx-app');"
        },
        "Counter": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "desc": "Counter Demo",
            "code": "/*\n * @Author: chenzhongsheng\n * @Date: 2025-10-02 20:58:47\n * @Description: Coding something\n */\n\nimport { div, input, button, ref, mount, join } from 'link-dom';\nfunction Counter () {\n    const count = ref(0);\n    return div(\n        div(join`Count = ${count}`),\n        input.bind(count),\n        button('Increase').click(() => {\n            count.value++;\n        }),\n    );\n}\nmount(Counter, '#jx-app');"
        },
        "Style": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "desc": "Basic Style",
            "title": "Style",
            "code": "import { div, ref, input, button, mount, join } from 'link-dom';\nfunction Style () {\n    const font = ref(12);\n    const color = ref('red');\n    return div(\n        div(join`Color = ${color}; FontSize = ${font}`).style({\n            fontWeight: 'bold',\n            color: color,\n            fontSize: font,\n        }),\n        div('color: ', input.bind(color)),\n        div(\n            'font: ',\n            input.bind(font),\n            button('Increase').click(() => font.value++)\n        )\n    );\n}\nmount(Style, '#jx-app');"
        },
        "Style Link": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "desc": "Style Link Usage",
            "code": "import { div, reactive, input, button, mount, join, link } from 'link-dom';\nfunction Style () {\n    const data = reactive({\n        color: 'red',\n        font: 12,\n    });\n    return div(\n        div(join`Color = ${link(data.color)}; FontSize = ${link(data.font)}`).style({\n            fontWeight: 'bold',\n            color: link(data.color),\n            fontSize: link(data.font),\n        }),\n        div('color: ', input.bind(link(data.color))),\n        div(\n            'font: ',\n            input.bind(link(data.font)),\n            button('Increase').click(() => data.font++)\n        )\n    );\n}\nmount(Style, '#jx-app');"
        },
        "Global Style": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "code": "import { style, div, input, ref, mount, join, button } from 'link-dom';\nfunction GlobalStyle () {\n    const font = ref(12);\n    const color = ref('red');\n    const colorB = ref('green');\n    mount(style({\n        '.parent': {\n            fontWeight: 'bold',\n            color: color,\n            fontSize: font,\n            '.child': {\n                color: colorB,\n            }\n        }\n    }), 'head');\n    return div(\n        div.class('parent')(\n            div(join`Color = ${color}; FontSize = ${font}`),\n            div.class('child')(join`Child Color = ${colorB}`),\n        ),\n        div('color: ', input.bind(color)),\n        div('child color: ', input.bind(colorB)),\n        div(\n            'font: ',\n            input.bind(font),\n            button('Increase').click(() => font.value++)\n        )\n    );\n}\nmount(GlobalStyle, '#jx-app');"
        },
        "For": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "desc": "Reactive Array",
            "title": "Controller",
            "code": "import { div, button, ref, mount, join, For, link, span } from 'link-dom';\nfunction ForApp () {\n    const list = ref([]);\n    let id = 0;\n    return div(\n        div(\n            button('Add Item').click(() => {\n                id ++;\n                list.value.push({ id: `id-${id}`, label: `label-${id}` });\n            }),\n            button('Reverse').click(() => list.value.reverse()),\n            button('Clear').click(() => list.value = []),\n        ),\n        For(list, (item, index) =>\n            div(\n                span(join`${index}: ${link(item.id)}: ${link(item.label)}`),\n                button('Remove').click(() => { list.value.splice(index.value, 1); }),\n                button('Update').click(() => { item.label += '!'; }),\n            )\n        ),\n    );\n}\nmount(ForApp, '#jx-app');"
        },
        "ForRef": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "desc": "Reactive Array For Simple Value",
            "code": "import { div, button, span, ref, mount, join, link, ForRef } from 'link-dom';\nfunction ForRefApp () {\n    const list = ref([]);\n    let id = 0;\n    return div(\n        div(\n            button('Add Item').click(() => {\n                id ++;\n                list.value.push(`label-${id}`);\n            }),\n            button('Reverse').click(() => list.value.reverse()),\n            button('Clear').click(() => list.value = []),\n        ),\n        ForRef(list, (item, index) =>\n            div(\n                span(join`${index}: ${item};(or use link:${link(item.value)})`),\n                button('Remove').click(() => { list.value.splice(index.value, 1); }),\n                button('Update').click(() => { item.value += '!'; }),\n            )\n        ),\n    );\n}\nmount(ForRefApp, '#jx-app');"
        },
        "If": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "code": "import { div, span, button, input, ref, mount, join, If } from 'link-dom';\nfunction IfApp () {\n    const num = ref(0);\n    return div(\n        div(\n            span(join`num = ${num}`),\n            input.bind(num),\n            button('Increase').click(() => { num.value++; }),\n        ),\n        If(() => num.value < 2, () => span('num < 2'))\n            .elif(() => num.value < 5, () => span('num < 5'))\n            .else(() => span('num >= 5')),\n    );\n}\nmount(IfApp, '#jx-app');"
        },
        "Switch": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "code": "import { div, span, button, input, ref, mount, join, Switch } from 'link-dom';\nfunction SwitchApp () {\n    const num = ref(0);\n    return div(\n        div(\n            span(join`num = ${num}`),\n            input.bind(num),\n            button('Increase').click(() => { num.value++; }),\n        ),\n        Switch(num)\n            .case([ 0, 1 ], () => span('num < 2'))\n            .case([ 2, 3, 4 ], () => span('num < 5'))\n            .case(5, () => span('num = 5'))\n            .default(() => span(join`num = ${num}`)),\n    );\n}\nmount(SwitchApp, '#jx-app');"
        },
        "Show": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "code": "import { div, button, ref, mount, Show, span } from 'link-dom';\nfunction ShowApp () {\n    const bool = ref(true);\n    return div(\n        button('Toggle').click(() => { bool.value = !bool.value; }),\n        Show(bool, span('Hello World!'))\n    );\n}\nmount(ShowApp, '#jx-app');"
        },
        "Await": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom"
            ],
            "code": "import { div, Await, mount } from 'link-dom';\n\nfunction AwaitApp () {\n    const mockFetch = () => {\n        return new Promise((resolve) => {\n            setTimeout(() => {\n                resolve({ id: 1, name: 'Tack' });\n            }, 1000);\n        });\n    };\n    return div(\n        Await(mockFetch(), data =>\n            div(`id = ${data.id}; name = ${data.name}`)\n        )\n    );\n}\nmount(AwaitApp, '#jx-app');"
        },
        "Log Render": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom",
                "link-dom-render"
            ],
            "title": "Custom Renderer",
            "code": "import { div, ref, computed, mount, join, span } from 'link-dom';\nimport { useRenderer } from 'link-dom-render';\nconst root = useRenderer({\n    render (node) {\n        const prefix = new Array(node.deep).fill('  ').join('');\n        const text = `${node.innerText}`;\n        console.log(`${prefix}${node.tagName || 'text'}: ${text.trim()}`);\n    }\n});\nconst App = () => {\n    const count = ref(0);\n    const countAdd2 = computed(() => count.value + 2);\n\n    setInterval(() => {\n        count.value ++;\n        console.clear();\n        root.render();\n    }, 1000);\n\n    return div(\n        span(join`count = ${count}`),\n        div(join`count + 2 = ${countAdd2}`),\n    );\n};\nmount(App, root);"
        },
        "Canvas Render": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom",
                "link-dom-render"
            ],
            "code": "import { div, ref, mount, join, canvas, collectRef, span, button } from 'link-dom';\nimport { useRenderer } from 'link-dom-render';\n\nconst { ctx, msg } = (function initEnv () {\n    const refs = collectRef('canvas');\n    const msg = ref('Hello');\n    mount(div(\n        canvas.ref(refs.canvas).style('border', '1px solid red'),\n        div(\n            span(join`msg = ${msg}`),\n            button('Add !').click(() => msg.value += '!'),\n        )\n    ), '#jx-app');\n    const size = 300;\n    const canvasEl = refs.canvas.el;\n    const scale = window.devicePixelRatio;\n    canvasEl.width = canvasEl.height = size * scale;\n    canvasEl.style.width = canvasEl.style.height = `${size}px`;\n    canvasEl.style.backgroundColor = '#333';\n    const ctx = canvasEl.getContext('2d');\n    ctx.font = `${15 * scale}px Microsoft Sans Serif`;\n    ctx.fillStyle = '#eee';\n    ctx.textBaseline = 'top';\n    function loopRender () {\n        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);\n        root.render();\n        requestAnimationFrame(loopRender);\n    }\n    setTimeout(loopRender);\n    return { ctx, msg };\n})();\n\nconst root = useRenderer({\n    render (element) {\n        const parent = element.parentElement || { deep: 0, textLeft: 0 };\n        if (!parent.textLeft) parent.textLeft = 10;\n        ctx.fillText(element.textContent, parent.textLeft, (parent.deep - 1)  * 15 + 10);\n        parent.textLeft += (ctx.measureText(element.textContent).width);\n        return el => {el.textLeft = 0;};\n    },\n});\n\nconst App = () => {\n    return div(() => `msg = ${msg.value}`);\n};\n\nmount(App, root);"
        },
        "Full Custom": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom",
                "link-dom-render"
            ],
            "code": "import { div, ref, mount, text, computed } from 'link-dom';\nimport { defineRenderer, RendererType } from 'link-dom-render';\n\ndefineRenderer({\n    type: RendererType.Custom,\n    querySelector (selector) {return selector === '#Root' ? LogElement.Root : null;},\n    createElement (tag = '') {\n        return new LogElement('element', tag);\n    },\n    createTextNode (text) {\n        return new LogElement('text', text);\n    },\n    createComment () {\n        return new LogElement('comment');\n    },\n    createFragment () {\n        return new LogElement('frag');\n    },\n    querySelectorAll: function () {return [];},\n    addStyle: function () {}\n});\n\nclass LogElement {\n    static Root = null;\n    type = 'element';\n    style = {}; // mock\n    tagName = '';\n    className = '';\n    innerText = '';\n    get textContent () {return this.innerText;};\n    set textContent (v) {this.innerText = v;}\n    deep = 0;\n    get prefix () {\n        return new Array(this.deep).fill('--').join('');\n    }\n    addEventListener () {};\n    removeEventListener () {};\n    setAttribute () {};\n    removeAttribute () {};\n    getAttribute () {return '';};\n    classList = {};\n    constructor (type, tag = '') {\n        this.type = type;\n        this.tagName = tag;\n        this.innerText = '';\n        if (tag === 'Root') LogElement.Root = this;\n    }\n    parentElement = null;\n    get parentNode () {return this.parentElement;};\n    removeCallList = [];\n    remove () {\n        const children = this.parentElement?.children;\n        if (children) {\n            children.splice(children.indexOf(this), 1);\n            this.removeCallList.forEach(call => call(this));\n        }\n    }\n    get innerHTML () {return this.innerText;}\n    get outerHTML () {return this.innerText;}\n    children = [];\n    get childNodes () {\n        return this.children;\n    }\n    mountCallList = [];\n    appendChild (child) {\n        this.children.push(child);\n        child.mountCallList.forEach(call => call(child));\n    }\n    get nextSibling () {\n        return this.parentElement?.children[this.index + 1] || null;\n    }\n    insertBefore (node, child) {\n        if (child.parentElement !== this) {\n            throw new Error('insertBefore error');\n        }\n        this.parentElement?.children.splice(child.index - 1, 0, node);\n        child.mountCallList.forEach(call => call(child));\n        return node;\n    }\n    get index () {\n        const parent = this.parentElement;\n        return !parent ? -1 : parent.children.indexOf(this);\n    }\n    render () {\n        const text = `${this.innerText}`;\n        if (this.type === 'text') {\n            text && console.log(`${this.prefix}text: ${text.trim()}`);\n        } else if (this.type === 'element') {\n            console.log(`${this.prefix}${this.tagName}: ${text.trim()}`);\n            this.children.forEach(item => {\n                item.deep = this.deep + 1;\n                item.render();\n            });\n        }\n    }\n}\n\nconst Root = new LogElement('element', 'Root');\n\nconst App = () => {\n    const count = ref(0);\n    const countAdd2 = computed(() => count.value + 2);\n\n    setInterval(() => {\n        count.value ++;\n        console.clear();\n        Root.render();\n    }, 1000);\n    return div(\n        text(() => `count = ${count.value}`),\n        div(() => `count + 2 = ${countAdd2.value}`)\n    );\n};\n\nmount(App, Root);"
        },
        "Router": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom",
                "link-dom-router"
            ],
            "title": "Router",
            "code": "import { createRouter, routerLink, routerView } from 'link-dom-router';\nimport { button, div, mount, watch } from 'link-dom';\n\nconst PageSub = () => {\n    return [\n        div('Sub Start'),\n        routerView(),\n        div('Sub End'),\n    ];\n};\nconst PageSub1 = () => div('Sub Page1');\nconst PageA = () => {\n    return div('PageA');\n};\nconst router = createRouter({\n    routes: [\n        {\n            path: '/',\n            component: () => div('Page Index'),\n        },\n        {\n            path: '/sub',\n            component: PageSub,\n            children: [\n                {\n                    path: '/sub',\n                    component: () => div('Sub Index')\n                },\n                {\n                    path: '/sub/s1',\n                    component: PageSub1,\n                },\n                {\n                    path: '/sub/s1/s1',\n                    component: () => div('Sub Page1/s1')\n                },\n                {\n                    path: '/sub/s2/s2',\n                    component: () => div('Sub Page2/s2')\n                },\n                {\n                    path: '/sub/404',\n                    component: () => div('Sub 404'),\n                },\n            ]\n        },\n        {\n            path: '/a',\n            component: PageA,\n        },\n        {\n            path: '/b',\n            component: () => div('PageB')\n        },\n        {\n            path: '/c',\n            component: () => div('CompC'),\n        },\n        {\n            path: '/x/:name/:#age/:!male',\n            meta: { test: 'x' },\n            component: (data) => {\n                console.log(`test:query`, data.query);\n                console.log(`test:param`, data.param);\n                console.log(`test:meta`, data.meta);\n                console.log(`test:route`, data.route);\n                console.log(`test:path`, data.path);\n                return div('CompX').children(\n                    div(() => `query: ${JSON.stringify(data.query)}`),\n                    div(() => `param: ${JSON.stringify(data.param)}`),\n                    div(() => `meta: ${JSON.stringify(data.meta)}`),\n                    div(() => `query.a: ${JSON.stringify(data.query.a)}`),\n                );\n            },\n        },\n        {\n            path: '/404',\n            component: () => div('404'),\n        },\n    ]\n});\n\nconst App = () => {\n    return div(\n        div.class('')(),\n        div.style({ display: 'flex', gap: '10px' })(\n            routerLink('/'),\n            routerLink('/sub/s1'),\n            routerLink('/sub/s1/s1'),\n            routerLink('/sub/s2/s2'),\n            routerLink('/sub/s3'),\n            routerLink('/a'),\n            routerLink('/b'),\n            routerLink('/c'),\n            routerLink('/x/tack/31/true?a=1'),\n            routerLink('/x/123/456/false?name=zs&age=18&male=true'),\n            routerLink.back(),\n            routerLink.forward(),\n            routerLink.go(-2),\n        ),\n        div(\n            button('Js Call1').click(() => {\n                router.route({\n                    path: '/x/:name/:#age/:!male',\n                    param: { name: 'tack', age: 18, male: true },\n                    query: { a: 1 },\n                });\n            }),\n            button('Js Call2').click(() => {\n                router.route({\n                    path: '/x/alice/12/false',\n                    query: { a: 2 },\n                });\n            }),\n            button('Js Call3').click(() => {\n                router.route('/x/alice/18/true?a=3');\n            })\n        ),\n        routerView(),\n    );\n};\n\nmount(App, '#jx-app');\n\n// window.router = router;\n\nwatch(() => router.path, (val) => {\n    console.log('router.currentPath', val);\n});\nwatch(() => router.query, (val) => {\n    console.log('router.query', val);\n});"
        },
        "SSR": {
            "needUI": true,
            "hideLog": true,
            "dep": [
                "link-dom",
                "link-dom-ssr"
            ],
            "title": "SSR",
            "code": "import { ssr, hydrate } from 'link-dom-ssr';\nimport { ref, div, button, join, collectRef, mount, link, For, If, span } from 'link-dom';\n\nfunction CommonComponent (data) {\n    const list = ref(data);\n    const selected = ref('label2');\n    let id = 0;\n    return div.style('borderBottom', '2px solid #000')(\n        button('clear').click(() => {\n            list.value = [];\n        }),\n        button('init').click(() => {\n            console.time();\n            for (let i = 0; i < 10000; i++) {\n                list.value.push({ label: `item${i}` });\n            }\n            console.timeEnd();\n        }),\n        button('reset').click(() => {\n            list.value = [ { label: 'test' }, { label: 'test2' } ];\n        }),\n        button('reverse').click(() => {\n            list.value.reverse();\n        }),\n        button('sort').click(() => {\n            list.value.sort((a, b) => a.label.localeCompare(b.label));\n        }),\n        button('add').click(() => {\n            list.value.push({ label: `item${id++}` });\n        }),\n        span(join`selected:${selected}`),\n        For(list, (item, index) => {\n            return div.style('color', () => selected.value === item.label ? 'red' : 'green')(\n                If(() => selected.value === item.label, () => span('selected'))\n                    .else(() => span('unselected')),\n                span(join`: index = ${index}; label = ${link(item.label)}`).click(() => {\n                    selected.value = item.label;\n                }),\n                button('×').click(() => {\n                    list.value.splice(index.value, 1);\n                })\n            );\n        }),\n    );\n}\n\nfunction SSRContainer () {\n    const data = [ { label: 'label1' }, { label: 'label2' } ];\n    const refs = collectRef('container');\n    return div(\n        button('Start SSR Render').click(() => {\n            const html = ssr(CommonComponent)(data);\n            console.log('html', html);\n            refs.container.html(html);\n        }),\n        button('Start Hydrate').click(() => {\n            hydrate(CommonComponent)(data);\n        }),\n        div.style('fontWeight', 'bold')('SSR Container:'),\n        div.ref(refs.container),\n    );\n}\nmount(SSRContainer, '#jx-app');"
        }
    }
}