/*
* @Author: Zhang Guohua
* @Date:   2020-04-23 18:01:42
* @Last Modified by:   zgh
* @Last Modified time: 2020-05-09 14:32:57
* @Description: create by zgh
* @GitHub: Savour Humor
*/

# Composition API 

一套新增的， 基于函数的 api 让组件逻辑更加灵活。


## 原因，动机
### 逻辑复用和代码组织

过去使用 vue 的原因是快速，简单的构建中小型项目。随着 vue 使用者的发展，被用来构建大型项目，这会使团队对项目进行迭代需要耗费更长的时间。过去的时间我们见证了这些项目被 vue 当前的 api 的编程模型所限制，大概有两类问题：

- 复杂组件在不断扩展中，变得难以理解。特别在我们读别人写的代码时，根本原因是 现有 API 强制按 options 组织代码，没有逻辑关系，实际上，按逻辑关系组织代码更有意义。
- 缺少一个干净，无成本的机制，在多个组件之间提取和重用逻辑。

新增 API 的目的是提供更灵活的组件组织代码方式。现在不使用 options，而是使用 function 组织代码。使多个组件复用逻辑的提取更直接，甚至是外部的组件。

### 更好的类型检查机制

另一个来自大型项目开发者的声音是对 TS 的支持。当前 的 api 和 TS 整合使用时带来了一些挑战，大部分原因是 vue 依赖 this 上下文来暴露属性，在组件中 this 使用更多比简单的 js。(例如： 在方法中我们用 this 指向 组件本身，而不是 methods 对象。) 现有 API 设计时没有考虑类型推断，这使得当你使用 TS 造成了大量的复杂性。


大多人在 vue 中使用 TS 用 vue-class-component. 允许组件被命名为 TS class. 在 3.0, 我们提供了 built-in Class API 更好的解决之前的类型问题。在设计方面的讨论和迭代中，我们发现 Class API 解决类型问题，依赖装饰器，这在实现细节中增加了很多不确定的提议，这是一个危险的基础。

相比较，本 API 大多使用简单的变量和函数，对类型更友好。新的 API 可以享受完整的类型推断，使用新的 api 编写的代码在 TS 和 JS  看起来几乎相同，即使你不用 TS , 也可以获得更好的 IDE 支持。


## 详细设计

### API 介绍

新的 API 没有新的概念，而是将 VUE 的核心功能暴露为独立的函数。比如 创建状态响应机制。这里将介绍一些最基本的 API，如何用这些 API 代替 2.x 选项来表示组件逻辑。这里介绍几本思想，不是所有的 API.

#### 状态响应和一些作用

声明响应状态: reactive 等同于 2.x 的 Vue.observable(), 重命名避免和 RxJS observates 混淆。 监测数据变化： watchEffect 类似于 effect, 不需要分离监控数据源。 Composition API 提供 watch function 类似于 2.x.

我们之前返回的 data ,内部使用 reactive 创建响应状态，模版编译在一个渲染函数 watchEffect，使用了这些响应状态。

我们不需要关注 innerHTML 或者 eventListeners. 我们用 假定的API renderTemplate 使我们把关注放在响应方面。

```js
import {reactive, watchEffect} from 'vue'

// 声明响应状态
const state = reactive({
    count: 0
})

function increment() {
    state.count++
}

const renderContext = {
    state,
    increment
}

// 监听响应状态的改变
watchEffect(() => {
    // hypothetical internal code, NOT actual API
    renderTemplate(
        `<button @click="increment">{{ state.count }}</button>`,
        renderContext
    )
})


```

computed: 一个状态依赖另一个状态。 那么 computed 是如何实现的呢？如果直接监控原始数据类型，或者对象属性的值，直接监测时不起作用的。那么很自然的，我们会把他包装为一个对象，使用对象替代。此外，我们还需要拦截对象的属性读写操作，便于我们执行跟踪和执行数据渲染变更。现在我们使用引用类型，不用担心丢失响应性。 类似于 dobule 我们称为 ref，是对内部的参考， 你已经意识到之前内部属性 refs 引用 dom element/component, 现在还可以包括 逻辑状态。

除了 computed ， 我们还可以直接创建 ref

```js
import { reactive, computed, watchEffect, ref } from 'vue'

const state = reactive({
    count: 0
})

const double = computed(() => state.count * 2)

watchEffect(() => {
    console.log(double.value)
})

state.count++ // -> 2

// 内部简单代码
function computed (getter) {
    const ref = {
        value: null
    }
    watchEffect(() => {
        ref.value = getter()
    })
    return ref
}

const cc = ref(0)
console.log(cc.value) // 0
```

ref 内部: 在渲染上下文暴露 ref 属性， 在内部， vue 对 ref 进行特殊处理，在遇到渲染上下文时，直接公开 ref 的内部值。也就是在 template 中，直接使用 count 而不是 count.value.

此外，ref 在作为属性在一个响应对象中，也会自动展开。

```js
import { ref, watch, reactive, computed } from 'vue'

const state = reactive({
    count: 0,
    dobule: computed(() => state.count * 2)
})
console.log(state.dobule) // 不是 state.dobule.value

const count = ref(0)

function increment() {
    count.value++
}

const renderContext = {
    count,
    increment
}

watchEffect(() => {
    renderTemplate(
        `<button @click="increment">{{ count }}</button>`,
        renderContext
    )
})
```

components 重用: 如果想要重用逻辑，下一步是将其重构为一个函数。

生命周期钩子: 除了这些，我们还需打印，发送 ajax, 增加事件在 window.这些在一下的时间完成：

- 当状态改变时。 watch, watchEffect.
- 当组件 mounted, updated, unmounted. （on XXXAPI)

lifecycle methods 将总是在 setup 钩子中调用，将自动计算出调用 setup 钩子的当前实例。这个设计使得将逻辑提取到外部函数时，减少分歧。

### 代码组织

现在我们已经通过导入的函数复制了组件 API, 那用选项定义似乎比函数中混合更有条理? 回到动机，我们试着去理解其中的原因。

#### 什么是代码组织

组织代码的目标是使我们更容易的阅读和理解代码，我们知道他的选项就理解了吗？你是否遇到过别人写的大型组件，你很困难去清晰的理解？

我们向别人描述这个组件，会说 这个组件处理什么事， A，B，C. 而不会说这个组件包含 这些 data, computed, methods. options 在告诉组件做了什么上，处理的不好。


#### 逻辑问题 vs options

我们更多的时候定义组件使用逻辑问题，可读性问题通常不在小型，单一功能的组件中。在大型的组件中问题更加突出，比如 Vue CLI UI file explorer 处理更多不同的逻辑问题:

- 跟踪当前文件状态，显示内容
- 处理文件状态，打开，关闭，刷新
- 创建新的文件
- 弹出最喜欢的文件
- 显示隐藏的文件
- 当前工作文件夹改变

你去查看时很难识别这些逻辑问题部分通过选项， 这些逻辑问题通常是零散并且散落在各处，比如创建新的文件用到了两个 properties, 一个 computed prop, 一个 method. 这些距离相差甚远。这使得复杂的组件维护和理解变得更加困难。 通过选项强制分割掩盖了逻辑问题，当我们关注一个逻辑时，不得不在 options 中来回跳转。确实是。

如果我们能把同一个逻辑问题的代码收集在一块就好了。这刚好就是我们的 Composition API 做的。创建新的文件可以被重写: 将逻辑收集到一个 function 中，他的命名有些自文档化，我们称它是 composition function, 建议在函数名开头使用 use 表明它是一个结构函数。

每个逻辑问题都收集在一起，减少了我们来回跳，在一个大的组件中。 Composition functions 在编辑器中折叠，更容易被扫描查找。

```js
function useCreateFolder (openFolder) {
    // originally data properties
    const showNewFolder = ref(false)
    const newFolderName = ref('')

    // originally computed property
    const newFolderValid = computed(() => isValidMultiName(newFolderName.value))

    // originally a method
    async function createFolder () {
        if (!newFolderValid.value) return
        const result = await mutate({
            mutation: FOLDER_CREATE,
            variables: {
                name: newFolderName.value
            }
        })
        openFolder(result.data.folderCreate.path)
        newFolderName.value = ''
        showNewFolder.value = false
    }

    return {
        showNewFolder,
        newFolderName,
        newFolderValid,
        createFolder
    }
}
```
setup 作为调用所有函数的入口。
setup 函数 读起来像是对组件做的内容的口头描述，这是基于 options 版本无法做到的。还可以根据参数看到 Composition function 之间的依赖关系流。 return返回的内容可以用来检查 template 中使用的内容。

给定相同的功能， options 和 composition function 定义的组件表达了相同底层逻辑的两种不同方式。 一个基于 option type, 一个基于 logic concerns.

```js 
export default {
    setup () {
        // Network
        const { networkState } = useNetworkState()

        // Folder
        const { folders, currentFolderData } = useCurrentFolderData(networkState)
        const folderNavigation = useFolderNavigation({ networkState, currentFolderData })
        const { favoriteFolders, toggleFavorite } = useFavoriteFolders(currentFolderData)
        const { showHiddenFolders } = useHiddenFolders()
        const createFolder = useCreateFolder(folderNavigation.openFolder)

        // Current working directory
        resetCwdOnLeave()
        const { updateOnCwdChanged } = useCwdUtils()

        // Utils
        const { slicePath } = usePathUtils()

        return {
              networkState,
              folders,
              currentFolderData,
              folderNavigation,
              favoriteFolders,
              toggleFavorite,
              showHiddenFolders,
              createFolder,
              updateOnCwdChanged,
              slicePath
        }
    }
}
function useCurrentFolderData(networkState) { // ...
}

function useFolderNavigation({ networkState, currentFolderData }) { // ...
}

function useFavoriteFolder(currentFolderData) { // ...
}

function useHiddenFolders() { // ...
}

function useCreateFolder(openFolder) { // ...
}
```

### 逻辑提取和重用

Composition API 在提取和重用逻辑时，更加的灵活。比起依赖 magical this context ， composition function 依赖参数和 vue 全局 api. 你能用组件的任何一部分通过导入 function. 甚至可以导出扩展 setup 来实现同样的组件。

类似逻辑重用，我们可以通过现有的 mixin, 高阶组件(higher-order components)， renderless components 无渲染组件(作用域插槽)。 这些和 composition function 相比，都有缺点:

- context prop 来源不明确。比如使用多个 mixin, 那么很难判断一个属性从哪注入。
- 命名冲突。 混入可能在属性和方法名上发生冲突，高阶组件可能在属性名发生冲突。
- 性能。 高阶组件和无渲染组件需要额外的 状态组件实例，这就浪费性能。

相比较之下，使用 composition api: 

- 公开到模版的属性有明确的来源， returns。
- composition function 返回的值可以任意命名，因此不存在命名冲突。
- 不需要创建额外的组件实例。


```js
// example
import { ref, onMounted, onUnmounted } from 'vue'

export function useMousePosition() {
    const x = ref(0)
    const y = ref(0)

    function update(e) {
        x.value = e.pageX
        y.value = e.pageY
    }

    onMounted(() => {
        window.addEventListener('mousemove', update)
    })

    onUnmounted(() => {
        window.removeEventListener('mousemove', update)
    })

    return { x, y }
}


//  在组件中使用
import { useMousePosition } from './mouse'

export default {
    setup() {
        const { x, y } = useMousePosition()
        // other logic...
        return { x, y }
    }
}
```


### 和现有 API 一起使用

Composition API 可以和 options-based API 一起使用。

- composition api 在 2.x options(data, computed, methods) 之前解析，并且不能访问 options 定义的属性。
- setup 返回的 prop 将被挂在 this 上，在 2.x options 中时可用的。

### 插件开发

一些插件今天注入属性在 this, 例如 Vue Router this.$route/this.$router Vuex this.$store. 这使得类型推断变得困难，因为每个插件都需要用户为注入的属性增加 vue 类型。在使用 composition api 时， 没有 this, 插件将相应的 provide/inject 暴露在 composition function.

在任何组件中，通过 inject 使用 app provide 的任何依赖。

```js
const StoreSymbol = Symbol()
export function provideStore(store) {
    provide(StoreSymbol, store)
}

export function useStore() {
    const store = inject(StoreSymbol)
    if(!store) {
        throw new Error('no store provide')
    }
    return store
}


// 使用

// 根组件中提供 store
const App = {
    setup () {
        provideStore(store)
    }
}

// 这里使用 store
const Child = {
    setup () {
        const store = useStore()
    }
}
```


## 缺点

### 引入 refs 的开销

从技术上来说， ref 是 composition api 引入的唯一的新概念。 引入 ref 是为了将 响应值作为变量传递，不必依赖 this.这里的缺点是:

- 我们需要始终区分 refs 来自简单值和对象。增加了我们要考虑的事情。
    + 使用命名约定可以大大减少我们的负担（比如所有的 ref 变量命名为 xxxRef），或者通过类型系统。另一方面，由于提高代码组织的灵活性，组件逻辑通常会被分割成一些小的函数，在这些函数中，上下文比较简单， ref 的开销也容易管理。
- 现在由于需要使用 .value, 使用 refs 变得更加繁琐，冗长。
    + 有人建议使用编译时提供语法糖去解决这个问题，就像 Svelte 3。 虽然在技术上可行，但我们认为作为 vue 的默认值，这是没有意义的。就是说，通过 Babel 插件在用户方面，技术上是可行的。


我们已经讨论了，是不是可以避开使用 ref 概念，只使用 响应对象，然而：

- 计算属性可以返原始类型，因此使用对象，类似于 ref 的容器是不能避免的。
- composition function 期望返回原始类型总是需要被包装在 object 中为了响应的目的。如果没有框架提供标准的实现，用户很可能最终会发明自己的 (ref-like) 模式(导致生态系统崩溃).

### ref vs reactive

正常滴，用户可能会对使用 ref 和 reactive 之间的使用感到困惑。首先，你要理解这两个内容，去更高效的使用 composition api. 只使用一个将很可能导致难以理解的代码，或者重复造轮子。

使用 ref 和 reactive 之间的一些区别可以与如何写标准的 js  逻辑进行比较。

- 如果使用 ref, 我们在很大程度上，使用 refs 将样式 1 转换为更加详细，繁琐的等效的值(为了使原始类型具有响应性)
- 使用 reactive 更接近样式 2， 我们仅需要使用 reactive 创建对象。

然而，当仅使用 reactive 问题是 composition function 必须保持返回对象的引用 为了保持响应性，这个对象不能进行解构和扩展。

提供 toRefs API 用来处理约束 - 它将把每一个属性在可响应对象上转换成一个对应的 ref.

总结： 有两种可行的方式：

- 使用 ref 和 reactive 就像在 js 中声明原始数据类型和对象变量一样。推荐使用支持类型的 IDE 系统。
- 尽可能的使用 reactive, 在 composition function 返回 响应对象时使用 toRefs. 这会减少使用 refs 的心理负担，但并不能消除这个概念的必要性。

在这个阶段，我们认为想要一个最佳实践关于 ref 和 reactive 之间言之尚早，我们建议从上面的两个选项中选取更符合你的心理模型的一种。我们将收集用户的真实反馈，在对这一话题提供更加明确的指导。

```js 
// style 1:  分离变量 
let x = 0
let y = 0
function updatePosition(e) {
    x = e.pageX
    y = e.pageY
}

// --- compared to ---

// style2: 单一对象
const pos = {
    x: 0,
    y: 0
}

function updatePosition(e) {
    pos.x = e.pageX
    pos.y = e.pageY
}
```

```js
// composition function 
function useMousePosition () {
    consst pos = reactive({
        x: 0,
        y: 0
    })
    return pos
}

// consuming component
export default {
    setup () {
        // 丢失响应性
        const {x, y} = useMousePosition()
        return {
            x,
            y
        }
        // 丢失响应性
        return {
            ...useMousePosition()
        }

        // 这是唯一保持响应性的方式，返回 pos，在 template 中使用 pos.x, pos.y
        return {
            pos: useMousePosition()
        }
    }
}

// ToRefs API
function useMousePosition() {
    const pos = reactive({
        x: 0,
        y: 0
    })

    return toRefs(pos)
}

// x & y are now refs!
const {x, y} = useMousePosition()
```

### 返回语句的复杂，冗长程度

一些用户已经注意到 setup 的返回语句将称为冗长的就像范例一样。我们认为简洁的 return 语句 将有利于维护，他让我们能明确控制暴露在 template 中的内容，并跟踪组件中定义的模版属性时充当起点。

有人建议自动暴露 setup 中声明的变量，使 return 语句可选，但我们不认为这应该被默认，因为违背了 js 的直观。这有一些方法可以让他不那么麻烦:

- 使用 IDE 扩展，根据 setup 中声明的变量自动生成返回语句。
- 隐式生成并插入返回语句的 babel plugin.

### 更灵活的 需要 更多纪律性，要求

许多用户指出，虽然 composition api 提供了更多的灵活性，但他也需要开发人员更多的遵守，如何正确的做。一些人担心会导致缺乏经验的人使用意大利面代码，换句话说，当 composition api 提供代码质量的同时，也降低了下限。

我们在一定程度上同意，但是，我们也相信:

- 上界的收益远远大于下界的损失。
- 通过恰当的文档和社区指导，我们能有效的解决代码组织问题。

一些用户使用 angular1 controller 作为怎么设计会导致不良的代码的实例，composition api 和 angular1 controller 之间最大的区别是不依赖共享作用域上下文，这使得几那个逻辑分解为单独的函数非常容易，这也是 js 组织代码的核心机制。

任何 js 项目开始于一个入口文件 (就好像一个项目的 program), 我们组织项目通过基于逻辑问题，分离函数/模块。 composition api 使我们可以做类似的处理在 vue component code. 换句话说，编写组织良好的 js 代码能直接转换为使用 composition api 编写组织良好的 vue 代码的技能。


## 选用策略

composition api 是纯粹的添加，不影响/不支持 任何现有的 2.x api. 已经通过 @vue/composition 库作为 2.x 的插件提供。 这个库的主要目标是提供一种方式来测试 api 和收集用户的反馈。 当前实现和建议是最新的，但由于差劲啊技术的限制，可能包含一些细微的不一致。可能会接受一些改变就像这个建议更新一样，因此我们不建议在现阶段生产中使用。

我们打算在 3.0 内置此 API. 将和 2.x 的 options  一起存在。

对于在 app  中只使用 composition api， 可以提供编译时的选项去删除 2.x 的 options 以减少库的大小。当然，这完全可选。

本 api 将被定义为一个高级特性，因为他要解决的问题出现在大规模的应用程序中。我们不打算修改文档将它用作默认值，相反，他在文档中将有自己的专用部分。


## 附录

### class api 的类型问题

引入 class api 的主要目标是提供可选的 api 处理更好的 TS 推断支持。然而， vue 组件需要从多个源声明的属性合并到单一的 this 上下文中，即使使用基于 class 的 api, 也存在一些挑战。

一个例子是属性类型， 为了合并属性到 this，我们需要泛型参数到组件的 class, 或者使用 decorator.

使用泛型参数: 由于传递泛型参数的接口是 in type-land only, 用户仍然需要提供一个 runtime 属性声明为 this 上的属性代理， 这两次声明是多余的，尴尬的。

装饰器 decorators: 使用装饰器会产生对 stage-2 的依赖，这种依赖有很多的不确定性，特别是当 TS 当前的实现和 TC39 协议完全不同步时。此外，没有方法使用装饰器在 this.$props 公开声明属性的类型， 这会 破坏 TSX 的支持。用户还可能设置默认值，比如 @prop message: string = 'foo'， 但技术上无法按照预期工作。

此外，目前没有方法利用上下文类型来处理 class 方法的参数，这意味着传递给类的 render 函数的参数，不能基于类的其他属性做类型推断。

```ts
// 泛型参数
interface Props {
    message: string
}

class App extends Component<Props> {
    static props = {
        message: string
    }
}


// decoratore
class App extends Component<Props> {
    @prop message: string
}
```


### 和 react hooks 比较

基于函数的 api 提供了相同级别的逻辑组合功能类似于 react hooks，但是有一些重要的不同点，不像 react hooks, setup 函数仅仅被调用一次，这意味着代码使用 composition api： 

- 一般来说，更符合 js 代码的表达方式。
- 对于调用顺序不敏感，可以是有条件的。
- 不会重复调用在每次渲染时，减少垃圾处理的压力。
- 不被影响： 为了防止内联处理程序导致子组件的过度重新渲染问题，几乎总是需要使用 useCallback.
- 不受影响： 如果用户忘记传递正确的依赖数组，那么 useEffect 和 useMemo 或许会捕获过时的变量。 vue 的自动依赖跟踪确保 watchers 和 computed 值将总是正确的。

我们承认 React Hooks 的创造性，他是这个提议的主要灵感来源。然而，上面提到的这些问题确实存在于他的设计中， Vue 的响应模型提供了一种解决这些问题的方法。

### 和 Svelte 比较

尽管走的路线不同，但是 composition api 和 svelte3 的 compiler-based 方法实际上有大量的共同点，下面是一个例子:

Svelte 代码看起来更加的简洁，因为他在编译时做了一下内容：

- 隐式的将 script block (除了 import 语句) 包装到函数中，这个函数被每个组件实例调用，而不是只执行一次。
- 隐式注册响应属性在变量改变时
- 隐式向渲染上下文暴露作用域变量。
- 将 $ 语句编译为重新执行的代码。

技术上来说，这些我们也可以在 vue 中做(通过 babel plugin 实现),我们没有做的主要原因是和标准的 js 对齐。如果从 vue file 提取 script block 的代码，我们希望他的工作方式和标准的 ES 模块相同。另一方面，在 svelte script block 中，技术上不再是标准的 js， 这种基于编译的方法有很多问题:

- 代码在 编译/没有编译时 的工作方式不同。 作为一个渐进式框架，许多 vue 用户可能 希望/需要/必须 在没有构建设置的情况下使用它， 所以编译版本不能被默认。 另一方面，Svelte 是一个编译器，这是两个框架的本质区别。
- 代码在 内部/外部 组件工作方式不同。 当从 Svelte 组件中提取逻辑到标准的 js  文件中，我们将丢失 magical 简洁的语法，必须后退到一个更详细的低级 api。
- Svelte 的响应编译仅仅工作在顶级变量，不包括函数内的变量声明，因此我们不能在组件内部声明的函数中封装响应状态。这就给函数的代码组织设置了约束，正如我们在 RFC 中演示的，这对于保持大型组件的可维护性非常重要。
- 不标准的语义使得和 TS 集成存在问题。

这里没有任何说 Svelte3 不好，事实上他是一个非常创新的方法，我们高度尊重 Rich 的工作，但是基于 vue 的设计约束和目标，我们必须做出对应的权衡。

```html
// vue
<script>
import {ref, watchEffect, onMounted} from 'vue'

export default {
    setup () {
        const count = ref(0)

        function increment() {
            count.value++
        }

        watchEffect(() => console.log(count.value))
        onMounted(() => console.log('mounted'))

        return {
            count,
            increment
        }
    }
}
</script>


// svelte
<script type="text/javascript">
import {onMount} from 'svelte'

let count = 0
function increment() {
    count++
}

$: console.log(count)

onMount(() => console.log('mounted'))
</script>
```

