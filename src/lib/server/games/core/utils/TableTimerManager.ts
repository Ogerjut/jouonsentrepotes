import type { TimerInfo, TimerScheduled } from "$lib/types/timer"


export class TableTimerManager {
    private timers = new Map<string, TimerInfo>()

    get(tableId : string){
        return this.timers.get(tableId)
    }

    schedule(tableId: string, duration: number, callback: () => Promise<void>) : TimerScheduled{
        this.clear(tableId)
        const startTime = Date.now()

        const timer = setTimeout(async () => {
            this.timers.delete(tableId)
            await callback()
        }, duration)

        this.timers.set(tableId, {timer, startTime, duration})

        return {startTime, duration, userId : null}
    }

    clear(tableId: string) {
        const existing = this.timers.get(tableId)
        if (existing) {
            console.log("clean timer")
            clearTimeout(existing.timer)
            this.timers.delete(tableId)
        }
    }
}
