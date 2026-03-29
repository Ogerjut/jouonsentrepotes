import { socket } from "$lib/client/socket"
import type { TimerScheduled } from "$lib/types/timer"

export type Timer = {
    startTime : number, 
    duration : number, 
    remainingTime : number,
    targetUserId : string | null
}

let interval : ReturnType<typeof setInterval> | null = null
const timer : Timer = $state({
    startTime : 0,
    duration : 0, 
    remainingTime : 0,
    targetUserId : null
})

export const useTimer = () => {return timer}

function getRemainingTime(){
    if (!timer) return
    const now = Date.now()
    timer.remainingTime = Math.max(0, timer.startTime + timer.duration - now)
    
    if (timer.remainingTime <= 0 && interval){
        console.log("end timer")
        clearInterval(interval)
        interval = null
        resetTimer()
    }
}

function resetTimer(){
    timer.duration = 0
    timer.remainingTime = 0
    timer.startTime = 0
    timer.targetUserId = null
}


export function initTimerListerner(){

    const startTimer = (timerInfo : TimerScheduled) => {
       console.log('started timer')
        if (interval) clearInterval(interval)
        getRemainingTime()
        interval = setInterval(getRemainingTime, 100)
        timer.duration = timerInfo.duration
        timer.startTime = timerInfo.startTime
        timer.targetUserId = timerInfo.userId
    }

    const stopTimer = () => {
        if (interval){
            clearInterval(interval)
            interval = null
            resetTimer()
        }
    }

    const pauseTimer = () => {
        getRemainingTime()
        timer.duration = timer.remainingTime
        if (interval){
            clearInterval(interval)
            interval = null
        }

    }

    socket.on("timer:start", startTimer)
    socket.on("timer:stop", stopTimer)
    socket.on("timer:pause", pauseTimer)

    return () => {
        socket.off("timer:start")
        socket.off("timer:stop")
        socket.off("timer:pause")
    }
}

