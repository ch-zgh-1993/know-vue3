/*
* @Author: Zhang Guohua
* @Date:   2020-09-15 20:40:26
* @Last Modified by:   zgh
* @Last Modified time: 2020-09-18 15:48:38
* @Description: create by zgh
* @GitHub: Savour Humor
*/

# Vue3 相关内容

- 设计目标
    + 更小 
        * 全局 API 和 内置组件/功能支持 tree-shaking
        * 常驻代码控制在 10kb (gzipped) 上下
    + 更快
        * 数据侦测的变化，有 Object.defineProperty 升级到了 Proxy. 顺应 js 引擎升级。
        * Virtual DOM 重构， 更新速度/ 内存占用均有提升。
        * 编译器架构重构，更多的编译时优化
    + 加强 API 设计的一致性
        * 
    + 加强 TypeScript 的支持
    + 提高自身的可维护性
        * 代码采用 monorepo 结构，内部分层更清晰
        * 使用 TypeScript 重写，内置 typing, 支持 Typescript
    + 开放更多底层的功能
        * Custom Render


## Composition API
