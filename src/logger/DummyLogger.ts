import { ResponseMessage } from "trm-registry-types";
import { ILogger } from "./ILogger";
import { TreeLog } from "./TreeLog";
import { ILoggerProgressbar } from "./ILoggerProgressbar";
import { ILoggerMultibar } from "./ILoggerMultibar";

/**
 * {@link ILogger} that discards every message. Default logger of {@link Logger}.
 */
export class DummyLogger implements ILogger {

    debug: boolean;

    constructor() { }

    public loading(text: string, debug?: boolean): void { }

    public success(text: string, debug?: boolean): void { }

    public error(text: string, debug?: boolean): void { }

    public warning(text: string, debug?: boolean): void { }

    public info(text: string, debug?: boolean): void { }

    public log(text: string, debug?: boolean): void { }

    public table(header: string[], data: string[][], debug?: boolean): void { }

    public registryResponse(response: ResponseMessage, debug?: boolean): void { }

    public tree(data: TreeLog, debug?: boolean): void { }

    public setPrefix(text: string): void { }

    public removePrefix(): void { }

    public getPrefix(): string {
        return '';
    }

    public msgty(msgty: string, text: string, debug?: boolean) { }

    public forceStop(): void { }

    public progressbar(format: string, glue: string): ILoggerProgressbar {
        return {
            start(total: number, value: number, payload?: any) {
                return;
            },
            stop() {
                return;
            },
            update(value: number, payload?: any) {
                return;
            }
        }
    }

    public multibar(format: string, glue: string): ILoggerMultibar {
        return {
            create(total: number, startValue: number, payload?: any): ILoggerProgressbar {
                return {
                    start(total: number, value: number, payload?: any) {
                        return;
                    },
                    stop() {
                        return;
                    },
                    update(value: number, payload?: any) {
                        return;
                    }
                }
            },
            stop() {
                return;
            }
        }
    }

}