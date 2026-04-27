import { MessageType, ResponseMessage } from "trm-registry-types";
import { ILogger } from "./ILogger";
import { TreeLog } from "./TreeLog";
import { ILoggerProgressbar } from "./ILoggerProgressbar";
import { ILoggerMultibar } from "./ILoggerMultibar";

export class ConsoleLogger implements ILogger {

    private _prefix: string = '';

    constructor(public readonly debug: boolean) { }

    public loading(text: string, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        console.log(this._prefix + text);
    }

    public success(text: string, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        console.log(this._prefix + text);
    }

    public error(text: string, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        console.error(this._prefix + text);
    }

    public warning(text: string, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        console.warn(this._prefix + text);
    }

    public info(text: string, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        console.info(this._prefix + text);
    }

    public log(text: string, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        console.log(this._prefix + text);
    }

    public table(header: string[], data: string[][], debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        const table = {
            header,
            data
        };
        console.log(this._prefix + JSON.stringify(table));
    }

    public registryResponse(response: ResponseMessage, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        if (response.type === MessageType.ERROR) {
            this.error(response.text, debug);
        }
        if (response.type === MessageType.INFO) {
            this.info(response.text, debug);
        }
        if (response.type === MessageType.WARNING) {
            this.warning(response.text, debug);
        }
    }

    public tree(data: TreeLog, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        console.log(this._prefix + JSON.stringify(data));
    }

    public setPrefix(text: string): void {
        this._prefix = text;
    }

    public removePrefix(): void {
        this._prefix = '';
    }

    public getPrefix(): string {
        return this._prefix;
    }

    public msgty(msgty: string, text: string, debug?: boolean) {
        switch (msgty) {
            case 'A':
                this.error(text, debug);
                break;
            case 'E':
                this.error(text, debug);
                break;
            case 'I':
                this.info(text, debug);
                break;
            case 'S':
                this.success(text, debug);
                break;
            case 'W':
                this.warning(text, debug);
                break;
        }
    }

    public forceStop(): string {
        return;
    }

    public progressbar(format: string, glue: string): ILoggerProgressbar {
        var barTotal;
        return {
            start(total: number, value: number, payload?: any) {
                barTotal = total;
                console.log(`${value}/${total}${payload ? ' ' + JSON.stringify(payload) : ''}`);
            },
            stop() {
                return;
            },
            update(value: number, payload?: any) {
                console.log(`${value}/${barTotal}${payload ? ' ' + JSON.stringify(payload) : ''}`);
            }
        }
    }

    public multibar(format: string, glue: string): ILoggerMultibar {
        return {
            create(total: number, startValue: number, payload?: any): ILoggerProgressbar {
                var barTotal = total;
                return {
                    start(total: number, value: number, payload?: any) {
                        barTotal = total;
                        console.log(`${value}/${total}${payload ? ' ' + JSON.stringify(payload) : ''}`);
                    },
                    stop() {
                        return;
                    },
                    update(value: number, payload?: any) {
                        console.log(`${value}/${barTotal}${payload ? ' ' + JSON.stringify(payload) : ''}`);
                    }
                }
            },
            stop() {
                return;
            }
        }
    }

}