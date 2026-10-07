import { MessageType, ResponseMessage } from "trm-registry-types";
import { ILogger } from "./ILogger";
import { TreeLog } from "./TreeLog";
import { ILoggerProgressbar } from "./ILoggerProgressbar";
import { ILoggerMultibar } from "./ILoggerMultibar";
import cliTable from "cli-table3";
import * as cliProgress from "cli-progress";

/**
 * Non-interactive counterpart to {@link CliLogger}. Keeps its status symbols,
 * tables, trees and formatted progress bars, but writes stable lines instead
 * of animating or moving the cursor. Suitable for CI logs and redirected output.
 */
export class ConsoleLogger implements ILogger {

    private _prefix: string = '';
    private _loading: string | undefined;

    /**
     * @param debug print messages flagged as debug
     */
    constructor(public readonly debug: boolean) { }

    public loading(text: string, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        const message = this._prefix + text;
        if (this._loading !== message) {
            this._loading = message;
            console.log(`… ${message}`);
        }
    }

    public success(text: string, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        this.printStatus('✔', text, console.log);
    }

    public error(text: string, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        this.printStatus('✖', text, console.error);
    }

    public warning(text: string, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        this.printStatus('⚠', text, console.warn);
    }

    public info(text: string, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        this.printStatus('ℹ', text, console.info);
    }

    public log(text: string, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        this.forceStop();
        text.split('\n').forEach(line => console.log(this._prefix + line));
    }

    private printStatus(symbol: string, text: string, write: (message: string) => void): void {
        this.forceStop();
        text.split('\n').forEach(line => write(`${symbol} ${this._prefix}${line}`));
    }

    public table(header: string[], data: string[][], debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        this.forceStop();
        const table = new cliTable({
            head: header,
            chars: {
                'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
                'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
                'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
                'right': '║', 'right-mid': '╢', 'middle': '│'
            }
        });
        data.forEach(row => table.push(row));
        table.toString().split('\n').forEach(line => console.log(this._prefix + line));
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
        this.forceStop();
        const render = (node: TreeLog, branch: string): void => {
            const children = node.children || [];
            const head = branch && (children.length ? '┬ ' : '─ ');
            console.log(this._prefix + branch + head + node.text);
            const base = branch ? branch.slice(0, -2) + (branch.endsWith('└─') ? '  ' : '│ ') : '';
            children.forEach((child, index) => {
                render(child, base + (index === children.length - 1 ? '└─' : '├─'));
            });
        };
        render(data, '');
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

    public forceStop(): void {
        this._loading = undefined;
    }

    public progressbar(format: string, glue: string): ILoggerProgressbar {
        const logger = this;
        const bar = new cliProgress.SingleBar({
            noTTYOutput: true,
            notTTYSchedule: 2000,
            clearOnComplete: false,
            barGlue: glue,
            format: this._prefix + format
        }, cliProgress.Presets.legacy);
        return {
            start(total: number, value: number, payload?: any) {
                logger.forceStop();
                bar.start(total, value, payload);
            },
            stop() {
                bar.stop();
            },
            update(value: number, payload?: any) {
                bar.update(value, payload);
            }
        }
    }

    public multibar(format: string, glue: string): ILoggerMultibar {
        const logger = this;
        const multibar = new cliProgress.MultiBar({
            noTTYOutput: true,
            notTTYSchedule: 2000,
            clearOnComplete: false,
            barGlue: glue,
            format: this._prefix + format
        }, cliProgress.Presets.legacy);
        return {
            create(total: number, startValue: number, payload?: any): ILoggerProgressbar {
                logger.forceStop();
                const bar = multibar.create(total, startValue, payload);
                return {
                    start(total: number, value: number, payload?: any) {
                        bar.start(total, value, payload);
                    },
                    stop() {
                        bar.stop();
                    },
                    update(value: number, payload?: any) {
                        bar.update(value, payload);
                    }
                }
            },
            stop() {
                multibar.stop();
            }
        }
    }

}
