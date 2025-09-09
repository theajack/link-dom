/*
 * @Author: chenzhongsheng
 * @Date: 2025-09-06 14:41:28
 * @Description: Coding something
 */
// import { ssrdom } from './ssr-dom';

// useSSR();

// const {
//     html,
//     hydration,
// } = dom.div.class();

/**
 * 1. 首先声明公共组件
 * const Comp = () => dom.div.text('Common Component)
 *
 * 2. 声明服务端组件
 * useSSR();
 * const str = renderToString('Comp', Comp()) + renderToString('Comp', Comp());
 *
 *
 * const strB = renderToString(Comp());
 *
 * ! str = `<div hyd='1'>Common Component</div>`
 *
 * 3. 客户端水合
 * const A = hydration('Comp', Comp2());
 * const B = hydration(Comp());
 *
 *
 * hydration(Comp());
 *
 * 难点1：如何将服务端组件生成的html内容与客户端水合过程相关联
 *  通过顺序和节点校验来确认
 * // 函数tostring 会因为打包方式不同大致不具有唯一性
 * 难点2：如何保证服务端客户端组件状态、逻辑一致
 *  水合过程中 直接对旧节点进行绑定状态和事件 不引起浏览器重绘
 */

let ssr: any, Comp: any, Comp2: any, hydration: any;

function comp () {
    useServer(() => {

    });
    useClient(() => {

    });
}

function servePart (data) {

    return `
        <div>${ssr(Comp(data))}</div>
        <div>${ssr(Comp).render(data)}</div>
        <div>${ssr(Comp2(data))}</div>
    `;
}


function clientPart (data: any) {
    hydration(Comp2(data));
    hydration(Comp2).render(data);
    hydration(Comp(data));
}