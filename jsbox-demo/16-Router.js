
// @needUI=true
// @hideLog=true
// @dep=link-dom,link-dom-router
// @title=Router

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