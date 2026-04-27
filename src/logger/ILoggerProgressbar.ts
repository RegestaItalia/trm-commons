export interface ILoggerProgressbar {
    start: (total: number, value: number, payload?: any) => void,
    update: (value: number, payload?: any) => void,
    stop: () => void
}