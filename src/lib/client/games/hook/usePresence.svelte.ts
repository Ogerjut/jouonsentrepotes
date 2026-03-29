let online = $state(false)
let inGame = $state(false)

export function usePresence() {
    return {
        get online() { return online },
        get inGame() { return inGame },
        
        setPresence: (status : {online : boolean, inGame : boolean}) => {
            online = status.online
            inGame = status.inGame
        },
    }
}