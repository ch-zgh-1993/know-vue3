<template>
    <div>
        <p>1 秒后更新: {{obj.boolean}} {{obj1.boolean}}</p>
    </div>
</template>

<script>
import { reactive, ref } from '@vue/composition-api'

export default {
    setup () {
        // reactive: 使对象成为响应式的，返回的对象不等于原始对象。建议操作代理对象
        // 相当于 2.x 的 observable

        const obj = {
            array: [1, 2],
            boolean: true
        }

        const obj1 = reactive(obj)

        setTimeout(() => {
            // obj.boolean = false
            obj1.boolean = 'false1'
        }, 1000)

        
        // ref 返回的对象，拥有一个指向内部值的单一属性，.value。 如果传入对象，则调用 reactive 进行转换。
        // 自动解套： 在模版中， 在 reactive 中访问。
        const a = 0
        let a1 = ref(a)
        a1 = 2
        console.log(a, a1)


        return {
            obj,
            obj1
        }
    }
}
</script>

<style scoped>

</style>