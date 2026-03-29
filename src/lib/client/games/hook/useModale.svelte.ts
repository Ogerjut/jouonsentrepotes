
export type ModaleData = {
    title : string | null,
    message : string | null,
    actions : ModaleActions[]
}

export type ModaleActions = {
    name  : string,  
    onclick : (args : unknown) => void
}

const data : ModaleData = $state({
    message : null, title : null, actions : []
})
let visible = $state(false)

export function useModale() {
    return {
        get data() {return data},
        get visible() {return visible},

        close() {
            data.title = null
            visible = false
            data.message = null
        },

        show(title : string, reason : string, actions : ModaleActions[]){
            data.title = title
            data.message = reason
            visible = true
            data.actions = actions
        },
    }
}




