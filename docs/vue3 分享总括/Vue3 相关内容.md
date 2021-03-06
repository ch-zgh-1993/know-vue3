/*
* @Author: Zhang Guohua
* @Date:   2020-09-15 20:40:26
* @Last Modified by:   zgh
* @Last Modified time: 2020-09-18 15:48:38
* @Description: create by zgh
* @GitHub: Savour Humor
*/

# Vue3 相关内容

## 目录总括

1. 整体概括
2. Composition 设计背后的思考。意见征求稿
3. Composition API
4. 过一下 Vue3 的文档，看看有没有什么可以补充的。
5. 留有问题

## 整体概括

- 设计目标
    + 更小 
        * 全局 API 和 内置组件/功能支持 tree-shaking: 将我们用不到的代码摇掉，是性能优化的一个范畴。 在 webpack 项目中，入口文件，依赖很多模块，相当于树枝。实际情况是我们依赖了某个某块，但是只用到了其中的部分功能，方法。通过 tree-shaking，将没有使用的模块摇掉，这样来达到删除无用代码的目的。是 DCE 的一种实现。
        * 常驻代码控制在 10kb (gzipped) 上下
    + 更快
        * 数据侦测的变化，有 Object.defineProperty 升级到了 Proxy. 顺应 js 引擎升级。 解决新增属性的检测问题。
        * Virtual DOM 重构， 更新速度/ 内存占用均有提升。  传统的 virtual DOM patch 时颗粒度是组件，所以当观测到变化时，组件内部的 DOM 树仍然需要进行完全遍历。所以性能跟模版大小正相关，跟动态节点数量无关。动静结合，patch 时只对比可能变化的部分，减少性能损耗。组件里的组件如果有变化也会更新。 简单介绍，内部还有更多实现，比如对模版进行分析，v-if/v-for, 生成带有线索/key 的代码，运行时获取线索并选择最快路径。
        * 更多的编译时优化: slot 编译时统一为函数，父子组件渲染分离。 静态内容提取。 静态属性提取。

    + 编译器架构重构: 利用新语言的特性，解决架构问题： 模板编译器的写法很难实现良好的源映射支持， 虽然支持非 DOM 平台的渲染器，但为了实现需要 fork 代码库，复制一大堆代码。
        * 编译器将 template 转为 AST ， 通过 generate 得到 render 函数，返回 VNode 值。
    + 加强 API 设计的一致性
        * 
    + 加强 TypeScript 的支持
    + 提高自身的可维护性
        * 代码采用 monorepo 结构，内部分层更清晰； 代码管理方式，所有的库都在一个仓库中。
        * 使用 TypeScript 重写，内置 typing, 支持 Typescript: Vue2 使用原生的 ES 编写，对于大型项目，使用类型系统会减少重构引入意外 bug 的几率，对于贡献者来说也更友好。而且越来越多的用户在 Vue 中使用 Ts, 为了支持还需要在源码外再维护一套 Ts 声明。降低为维护成本。
    + 开放更多底层的功能
        * Custom Render


1. 运行时 + 编译时 vs 运行时
    1. 是否具有对动态编译模板能力。 vue.global.js
    2. 如果使用 vue-loader, .vue 中的模板会在生成时预编译为js, 所以打包器不需要编译器，可以只使用运行时构建。 vue.runtime.global.js

2. vite:  web开发构建工具


## Composition API 




## 可演示 api

- shallowRef: 


## 其他待了解的内容

1. 从 Vue2 迁移到 Vue3 需要做哪些工作？会有什么可能踩坑的地方？

2. v-model， v-for 中的 ref, v-bind obj, 


## 没有准备充足的点

1. 时间不足够去详细理解： 对每一个点都会进行阅读，也会结合自己的理解，积累下来的一些知识去进行碰撞。也会想一些点，去尝试。这次其实比较少去做，只是简单过了一遍。

2. 你觉得不好的地方？ 如果我们能想到的话，说明我们也看到了一些困境。如果不能看到缺点的还，我们就加入他的改进点。最好还是有些一些不同，放进我们的思想里。如果一切都能达到一致，说明改进是好的，如果能看到一些缺点，说明你是牛逼的。

3. 调试时： 时刻保持冷静，这个应该是句废话。但是，确实是，无论什么时候，错误的结果，都是由于错误的程序。所有的问题都是有原因的。

4. 不过度使用任何属性，方法，便利点。恰好是比较好的层次。