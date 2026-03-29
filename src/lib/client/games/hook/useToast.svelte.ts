export type ToastData = {
    message : string | null,
    visible : boolean, 
    timeout: ReturnType<typeof setTimeout> | null
}

const data : ToastData = $state({
    message : null, visible : false, timeout : null
})

export function useToast() {
    return {
        get data() { return data},

        close() {
            data.visible = false
            data.message = null
            if (data.timeout){
                clearTimeout(data.timeout)
                data.timeout = null
            }
            
        },

        show(reason : string, duration = 3000){
            if (data.timeout){
                clearTimeout(data.timeout)
            }
            data.message = reason
            data.visible = true
            data.timeout = setTimeout(this.close, duration)
        }
    }
}