
// @needUI=true
// @hideLog=false
// @dep=link-dom,link-dom-render
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