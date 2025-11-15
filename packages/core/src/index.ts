
/*
 * @Author: chenzhongsheng
 * @Date: 2024-04-08 11:50:47
 * @Description: Coding something
 */
export * from './element';
export * from './dom';
export { Text, Frag, Comment } from './text';
export * from './type.d';

export { ctrl, type IController } from './controller';

export { join } from './join';

export * from 'link-dom-reactive';

export { flow } from './flow';
export { type IfClass } from './controller/if';
export { LinkDomType, getReactiveValue as read, toggle, isJoin, toLinkDomLink } from './utils';

export { createStyles } from './style';

export { onEnterScope, onExitScope } from './lifes';

export * from './short';
export * from './mount';

export * from './component';