import type { ChessTeams } from "$lib/types/games/chess"

export type ClockState = {
    white : ChessClock,
    black : ChessClock,
    current : ChessTeams
}

export type ClocksData = {
    whiteRemainingTime : number,
    blackRemainingTime : number,
    current : ChessTeams,
    serverDate : number, 
}

export class ClockManager {
    private clocks : Map<string, ClockState> = new Map()
    private intervals : Map<string, NodeJS.Timeout> = new Map()

    setIntervals(tableId : string, interval : NodeJS.Timeout){
        this.intervals.set(tableId, interval)
    }

    setClocks(tableId : string, clock : ClockState){
        this.clocks.set(tableId, clock)
    }

    startUpdate(tableId:string, cb : () => void){
        const interval = setInterval(cb , 1000)
        this.setIntervals(tableId, interval)
    }

    startClock(tableId : string) {
        const clocks = this.clocks.get(tableId)
        if (!clocks) return
        const activeClock = clocks[clocks.current]
        activeClock.start()
    }

    setTimeOut(tableId : string, cb : (looser : ChessTeams) => Promise<void>){
        const clocks = this.clocks.get(tableId)
        if (!clocks) return
        clocks.black.setTimeoutCallback(() => cb("black"))
        clocks.white.setTimeoutCallback(() => cb("white"))
    }

    switch(tableId : string) {
        const clocks = this.clocks.get(tableId)
        if (!clocks) return
        const current = clocks.current
        clocks[current].pause()
        clocks.current = current === "white" ? "black" : "white"
        clocks[clocks.current].start()
    }

    clear(tableId: string){
        const clocks = this.clocks.get(tableId)
        if (clocks) {
            clocks.white.stop()
            clocks.black.stop()
        }
        this.clocks.delete(tableId)
        
        const interval = this.intervals.get(tableId)
        if (interval) {
            clearInterval(interval)
            this.intervals.delete(tableId)
        }
        console.log("server clocks stopped")
    }

    update(tableId : string ) : ClocksData | undefined {
        const clocks = this.clocks.get(tableId)
        if (!clocks) return
        return { 
            whiteRemainingTime: clocks.white.getRemainingTime(),
            blackRemainingTime: clocks.black.getRemainingTime(),
            current: clocks.current, 
            serverDate : Date.now()
        }
    }
}


export class ChessClock {
    duration: number
    startTime: number | null
    private timer: NodeJS.Timeout | null
    private onTimeout?: () => Promise<void>

    constructor(duration: number) {
        this.duration = duration
        this.startTime = null
        this.timer = null
    }

    setTimeoutCallback(cb: () => Promise<void>) {
        this.onTimeout = cb
    }

    start() {
        if (this.startTime) return
        if (this.timer) this.stop()

        this.startTime = Date.now()

        this.timer = setTimeout(async () => {
            if (this.onTimeout) await this.onTimeout()
        }, this.duration)
    }

    pause() {
        if (!this.timer) return

        this.duration = this.getRemainingTime()
        clearTimeout(this.timer)
        this.timer = null
        this.startTime = null
    }

    stop() {
        if (!this.timer) return

        clearTimeout(this.timer)
        this.timer = null
        this.startTime = null
    }

    getRemainingTime(): number {
        if (!this.startTime) return this.duration
        return Math.max(0, this.startTime + this.duration - Date.now())
    }
}