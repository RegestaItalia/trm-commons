import loadingCli from "loading-cli";
import cliTable from "cli-table3";
import { MessageType, ResponseMessage } from "trm-registry-types";
import { ILogger } from "./ILogger";
import { TreeLog } from "./TreeLog";
import * as printTree from "print-tree";
import chalk from "chalk";
import { ILoggerProgressbar } from "./ILoggerProgressbar";
import * as cliProgress from "cli-progress";
import { ILoggerMultibar } from "./ILoggerMultibar";

export class CliLogger implements ILogger {

    private _loader: loadingCli.Loading;
    private _prefix: string = '';

    constructor(public readonly debug: boolean) {
    }

    public loading(text: string, debug?: boolean) {
        if (debug && !this.debug) {
            return;
        }
        
        const max = (process.stderr.columns || 80) - 4;
        const fit = (this._prefix + text).length > max ? (this._prefix + text).slice(0, max - 1) + '…' : (this._prefix + text);

        if (this._loader) {
            if (this._loader.text === text) {
                return;
            }else{
                this._loader.stop();
            }
        }

        this._loader = loadingCli({
            text: fit,
            frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
            interval: 150
        }).start();
    }

    public success(text: string, debug?: boolean) {
        if (debug && !this.debug) {
            return;
        }
        const aText = text.split('\n');
        aText.forEach(s => {
            s = chalk.green(this._prefix + s);
            if (this._loader) {
                this._loader.render().succeed(s);
            } else {
                loadingCli().render().succeed(s);
            }
        });
    }

    public error(text: string, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        const aText = text.split('\n');
        aText.forEach(s => {
            s = chalk.red(this._prefix + s);
            if (this._loader) {
                this._loader.render().fail(s);
            } else {
                loadingCli().render().fail(s);
            }
        });
    }

    public warning(text: string, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        const aText = text.split('\n');
        aText.forEach(s => {
            s = chalk.yellow(this._prefix + s);
            if (this._loader) {
                this._loader.render().warn(s);
            } else {
                loadingCli().render().warn(s);
            }
        });
    }

    public info(text: string, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        const aText = text.split('\n');
        aText.forEach(s => {
            s = this._prefix + s;
            if (this._loader) {
                this._loader.render().info(s);
            } else {
                loadingCli().render().info(s);
            }
        });
    }

    public log(text: string, debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        const aText = text.split('\n');
        aText.forEach(s => {
            s = chalk.dim(this._prefix + s);
            if (this._loader) {
                this.forceStop();
            }
            console.log(s);
        });
    }

    public table(header: string[], data: string[][], debug?: boolean): void {
        if (debug && !this.debug) {
            return;
        }
        var table = new cliTable({
            head: header,
            chars: {
                'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
                , 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
                , 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
                , 'right': '║', 'right-mid': '╢', 'middle': '│'
            }
            //colWidths: [300, 50]
        });
        data.forEach(arr => {
            table.push(arr);
        });
        this.forceStop();
        console.log(this._prefix + table.toString());
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
        const _parseBranch = (o: TreeLog) => {
            var children = [];
            if (o.children) {
                o.children.forEach(k => {
                    children.push(_parseBranch(k));
                });
            }
            return {
                name: o.text,
                children
            };
        }
        const treeData = _parseBranch(data);
        this.forceStop();
        printTree.default(
            treeData,
            (node) => {
                return node.name;
            },
            (node) => {
                return node.children;
            }
        );
    }

    public forceStop(): void {
        try {
            this._loader.stop();
        } catch (e) { }
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

    public progressbar(format: string, glue: string): ILoggerProgressbar {
        const that = this;
        const bar = new cliProgress.SingleBar({
            clearOnComplete: true,
            hideCursor: true,
            barGlue: glue,
            format
        }, cliProgress.Presets.legacy);
        return {
            start(total: number, value: number, payload?: any) {
                that.forceStop();
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
        const that = this;
        const multibar = new cliProgress.MultiBar({
            clearOnComplete: true,
            hideCursor: true,
            barGlue: glue,
            format
        }, cliProgress.Presets.legacy);
        return {
            create(total: number, startValue: number, payload?: any): ILoggerProgressbar {
                that.forceStop();
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