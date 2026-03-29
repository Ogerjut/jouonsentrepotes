export type TimerInfo = {
    timer : NodeJS.Timeout,
    startTime : number,
    duration : number
}

export type TimerScheduled = {
    startTime : number,
    duration : number, 
    userId : string | null
}