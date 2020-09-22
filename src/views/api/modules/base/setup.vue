<!--
 * @Author: zhangguohua
 * @Date: 2020-09-18 18:46:19
 * @Description: setup
-->
<template>
    <div>
        <h2>{{ name }}</h2>
    </div>
</template>

<script>
export default {
    props: {
        name: String
    },
    // props 不可解构
    // context 可以解构: attrs, slots, emit, isServer, listeners, parent, refs, root
    // why? props 使用场景更多，有时候甚至只用 props. 可以让 ts 单独对 props 做类型推导。这也让setup 、 render 和其他使用了 TSX 的函数式组件的签名保持一致。
    // this 不可用，setup 在 2.x 选项前被调用，同时使用可能造成混乱。
    setup (props, context, ) {
        console.log(props.name)
        console.log('context', context)
        return {}
    }
}
</script>

<style scoped>

</style>