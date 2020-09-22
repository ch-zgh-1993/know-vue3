<template>
    <div>
        <p>reactive</p>
        <reactive></reactive>

        <p>computed</p>
        <p>1s 后change</p>
        <p>{{a}}</p>
        <p>{{c1}}</p>

    </div>
</template>

<script>
import { computed, ref } from '@vue/composition-api'
export default {
    components: {
        reactive: () => import('./components/reactive')
    },
    setup () {
        let a = ref('i am string')

        // getter 中必须依赖响应式属性
        const c1 = computed(() => {
            return a.value + ', but this is my brother'
        })

        setTimeout(() => {
            a.value = 'i am boolean'
        }, 1000)


        // get/set 的对象
        const count = ref(0)
        let countPlus = computed({
            get () {
                return count.value + 1
            },
            set (v) {
                count.value = v - 1
            }
        })

        console.log(count.value)
        countPlus.value = 3
        console.log(count.value)

        return {
            a, 
            c1
        }
    }
}
</script>

<style scoped>

</style>