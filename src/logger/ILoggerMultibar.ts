import { ILoggerProgressbar } from "./ILoggerProgressbar";

export interface ILoggerMultibar {
    create: (total: number, startValue: number, payload?: any) => ILoggerProgressbar,
    stop: () => void
}