/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-07 18:22:26
 * @Description: Coding something
 */
import type { IRouteComponentArgs } from 'link-dom-router';
import { createRouter, routerLink, routerView } from 'link-dom-router';
import { dom, mount, reactive, watch } from 'link-dom';
import { ref } from 'link-dom';


const CompMain = () => {
    const a = ref({ a: { b: 1 } });
    return dom.div.text('Main').append(
        dom.button.text(() => a.value.a.b).click(() => a.value = { a: { b: 2 } } ),
    );
};
const CompA = () => {
    return [
        dom.div.text('CompA'),
        routerView(),
        dom.div.text('CompA'),
    ];
};
const CompA1 = () => {
    return dom.div.text('CompA1');
};
const CompA2 = () => {
    return dom.div.text('CompA2');
};

const CompB = () => {
    return dom.div.text('CompB');
};

const router = createRouter({
    routes: [
        {
            path: '/',
            component: CompMain,
        },
        {
            path: '/a',
            component: CompA,
            children: [
                {
                    path: '/a',
                    component: () => dom.div.text('a main'),
                },
                {
                    path: '/a/a1',
                    component: CompA1,
                },
                {
                    path: '/a/a2',
                    component: CompA2,
                },
                {
                    path: '/a/404',
                    component: () => dom.div.text('a404'),
                },
            ]
        },
        {
            path: '/b',
            component: CompB,
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
                    dom.div.text(() => `meta: ${JSON.stringify(data.query.a)}`),
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
        dom.div.style({
            display: 'flex',
            gap: '10px',
        }).children(
            routerLink('/'),
            routerLink('/a'),
            routerLink('/a/a1'),
            routerLink('/a/a2'),
            routerLink('/b'),
            routerLink('/c'),
            routerLink('/x/tack/31/true?a=1'),
            // routerLink('/x/123/456?name=zs&age=18&male=true'),
            routerLink.back(),
            routerLink.forward(),
            routerLink.go(-2)
        ),
        routerView(),
    );
};

mount(App(), 'body');

window.router = router;

watch(router.currentPath, (val) => {
    console.log('router.currentPath', val);
});
watch(() => router.query, (val) => {
    console.log('router.query', val);
});


window._t = () => {
    const a = document.createElement('div');
    const btn = document.createElement('button');
    a.innerText = 'xxx';
    a.appendChild(btn);
    btn.innerText = 'btn';
    btn.onclick = () => console.log('bbb');
    a.onclick = () => console.log('aaa');
    return a;
};