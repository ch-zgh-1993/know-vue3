/*
* @Author: Zhang Guohua
* @Date:   2020-10-03 15:03:49
* @Last Modified by:   zgh
* @Last Modified time: 2020-10-09 10:20:43
* @Description: create by zgh
* @GitHub: Savour Humor
*/
# vue2 迁移到 vue3

- 新特性
    + createRenderer: @vue/runtime-core 创建自定义渲染器
    + composition api 试验性
    + 单文件组件状态驱动的 css 变量
    + scoped 可以包含全局规则，或者只对插槽内容的规则

## 重大改变
迁移版本正在开发，行为兼容，运行时警告。 如果迁移一个非常重要的 Vue 2 应用程序，我们强烈建议你等待迁移版本完成以获得更流畅的体验。

- 全局 API 更改为使用应用程序实例 
    + Vue 的全局 API 和配置，会修改所有通过 new Vue 创建的实例。创建的每个根实例共享相同的全局配置。
        * 在测试期间，全局配置很容易意外地污染其他测试用例
        * 一个页面多个 app 共享同一个副本。
    + 引入 createApp 概念。将原来在 Vue 上的全局 api 移动到了 app 上。
    + 重点： 元素是否时组件的检查转移到了模版编译阶段。因此只有在使用运行时编译器时才考虑此配置选项。如果你使用的是 runtime-only 版本 isCustomElement 必须通过 @vue/compiler-dom 在构建步骤替换——比如，通过 compilerOptions option in vue-loader。
    + 插件： Vue.use / app.use
    + 共享配置通过工厂方法实现。

- 全局和内部的 api 被重构为可 treeShakable
    + 2.x 写法： Vue.nextTick(), this.$nextTick 是一个包装。 全局的方法是不可动摇的，不管实际在哪里使用。
    + 3.x: 通过模块命名导出。 获取最佳大小。
    + 内部组件的 api 也被命名导出。
    + 插件用法。


- v-model:  可以介绍一些。
    + 之前的 

- key
    + v-if/v-else 的 key 不需要。会自动生成。
    + v2.x template 不能有key, 需要在子节点中，现在应该设置在 template 上。

- 在同一元素上使用的 v-if 和 v-for 优先级已更改。 v-if 高优先级

- v-bind='obj'
    + v2.x 上， v-bind obj 与单独绑定同名时，将被单独的属性覆盖。
    + v3.x 以顺序为准。

- v-for 中的 ref 不再注册数组： 这个也可以。
    + ref是数组的会很难受，有些兼容。 
    + v2.x: 不明确，且效率会降低。通过函数绑定在响应式属性上。 可被监听。




## 组件

- 在 3.x 中，函数式组件 2x 的性能提升可以忽略不计，因此我们建议只使用有状态的组件。
- 函数式组件只能使用接收 props 和 context 的普通函数创建 (即：slots，attrs，emit)。
- 非兼容变更：functional attribute 在单文件组件 (SFC) <template> 已被移除
- 非兼容变更：{ functional: true } 选项在通过函数创建组件已被移除


2.x 中，函数式组件主要有两个用例： 
- 作为性能优化，因为它们的初始化速度比有状态组件快得多
- 返回多个根节点

然而，在 Vue 3 中，有状态组件的性能已经提高到可以忽略不计的程度。此外，有状态组件现在还包括返回多个根节点的能力。因此，函数式组件剩下的唯一用例就是简单组件，比如创建动态标题的组件。否则，建议你像平常一样使用有状态组件。


3.x 中
- 所有的函数式组件都是用普通函数创建的,换句话说，不需要定义 { functional: true } 组件选项。
- 此外，现在不是在 render 函数中隐式提供 h，而是全局导入 h
- 有状态组件和函数式组件之间的性能差异已经大大减少，并且在大多数用例中是微不足道的。
- listeners 现在作为 $attrs 的一部分传递，可以将其删除


- 由于函数式组件被定义为纯函数，因此异步组件的定义需要通过将其包装在新的 defineAsyncComponent 助手方法中来显式地定义
- component 选项现在被重命名为 loader，以便准确地传达不能直接提供组件定义的信息


## Render
- 不再接受参数，它将主要用于 setup() 函数内部。 这还有一个好处：可以访问作用域中声明的被动状态和函数，以及传递给 setup() 的参数。
- VNode Props 格式化： 属性扁平化。
    + attrs: id
    + domProps: innerHTML
    + on: onFun


- 移除 $scopeSlots
- 自定义指令 API 已更改为与组件生命周期一致
- 一些class 被重命名了。
- 组件 watch 选项和实例方法 $watch 不再支持点分隔字符串路径，请改用计算函数作为参数
- 在 Vue 2.x 中，应用根容器的 outerHTML 将替换为根组件模板 (如果根组件没有模板/渲染选项，则最终编译为模板)。VUE3.x 现在使用应用程序容器的 innerHTML。


## 其他一些小的改变

- destroyed 生命周期选项被重命名为 unmounted
- beforeDestroy 生命周期选项被重命名为 beforeUnmount
- prop default 工厂函数不再有权访问 this 是上下文
- 自定义指令 API 已更改为与组件生命周期一致
- data 应始终声明为函数
- 来自 mixin 的 data 选项现在可简单地合并
- attribute 强制策略已更改
- 一些过渡 class 被重命名
- 组建 watch 选项和实例方法 $watch 不再支持以点分隔的字符串路径。请改用计算属性函数作为参数。
- <template> 没有特殊指令的标记 (v-if/else-if/else、v-for 或 v-slot) 现在被视为普通元素，并将生成原生的 <template> 元素，而不是渲染其内部内容。
在 Vue 2.x 中，应用根容器的 outerHTML 将替换为根组件模板 (如果根组件没有模板/渲染选项，则最终编译为模板)。Vue 3.x 现在使用应用容器的 innerHTML，这意味着容器本身不再被视为模板的一部分。

# 移除API

- keyCode 不支持作为 v-on 的修饰符， 而是通过别名。 enter, delete,  主要是原生移除了 keycode 。
- 移除： $on，$off 和 $once 实例方法。  建议引入外部库 event hub.
- 移除 filters： 打破花括号内的表达式，有学习成本和实现成本。建议使用方法或者计算属性替换。
- 移除 inline-template: 将内容作为模版，而不是内容分发。
- 移除： $destroy 实例方法。用户不应再手动管理单个 Vue 组件的生命周期。

## 最后

其他： 如支持的库， cli, router, vuex, devtools, ide, 其他相关项目。









