/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-25 16:06:00
 * @Description: Coding something
 */

import { dom, ref, mount, join, collectRef, computed, Dom } from 'link-dom';

import type { CustomElement, IElement } from 'link-dom-render';
import { defineRenderer, useRenderer, RendererType } from 'link-dom-render';

function Basic () {

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
}

function Canvas () {
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
        ), '#app');
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
            const parent: ICustomEle = element.parentElement || { deep: 0, textLeft: 0 } as ICustomEle; // @static
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
}

function CustomRender () {

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
}

// CustomRender();