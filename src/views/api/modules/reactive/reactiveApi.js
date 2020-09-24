/*
 * @Author: zhangguohua
 * @Date: 2020-09-22 13:06:08
 * @Description: 直接执行测试的 api
 */
import { reactive, watchEffect } from '@vue/composition-api'

export function readonlyF () {
    const original = reactive({
        count: 0
    })

    // const copy = readonly(original)
    const copy = original

    watchEffect(() => {
        // 依赖追踪
        console.log(copy.count)
    })

    // 触发 copy 的监听
    original.count++

    // 无法修改 copy
    copy.count++
}