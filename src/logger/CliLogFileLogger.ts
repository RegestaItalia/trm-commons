import { ResponseMessage } from "trm-registry-types";
import { CliLogger } from "./CliLogger";
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";
import { join } from "path";
import { getStackTrace } from "get-stack-trace";
import { TreeLog } from "./TreeLog";

/**
 * {@link CliLogger} that also appends every message to a log file, including debug messages.
 *
 * Each instance is a log session, with its own file named `<sessionId>.txt`.
 * Call {@link CliLogFileLogger.endLog} when done to mark the end of the session.
 */
export class CliLogFileLogger extends CliLogger {

    private _filePath: string;
    private _sessionId: string;

    /**
     * Creates the log directory (if missing) and a new log file.
     * @param _dir directory where the log file is written
     * @param debug print messages flagged as debug to the terminal (they are always written to file)
     */
    constructor(private _dir: string, debug?: boolean) {
        super(debug);
        if (!existsSync(this._dir)) {
            mkdirSync(this._dir, {
                recursive: true
            });
        }
        this._sessionId = randomUUID();
        this._filePath = join(this._dir, `${this._sessionId}.txt`);
        writeFileSync(this.getFilePath(), `*** STARTING LOG SESSION ID ${this._sessionId}, ${new Date().toISOString()} ***`);
    }

    /**
     * Returns the ID of this log session, which is also the log file name.
     */
    public getSessionId(): string {
        return this._sessionId;
    }

    private _getStackTrace(): string {
        var sStackTrace: string;
        try {
            const aStackTrace = getStackTrace();
            const oStackTrace = aStackTrace[5];

            //extract trm-module
            const moduleName = /(trm-[^\\\/]*)(?:\\{1,2}|\/{1,2})dist/gmi.exec(oStackTrace.fileName)[1];
            sStackTrace = `[${moduleName}] ${oStackTrace.functionName} ${oStackTrace.lineNumber},${oStackTrace.columnNumber}`;
        } catch (e) {
            sStackTrace = ``;
        }
        return sStackTrace;
    }

    private _getDebugString(text: string, type: string) {
        const sStackTrace = this._getStackTrace();
        return `${type} ${new Date().toISOString()} ${sStackTrace}   ${text}`;
    }

    private _append(text: string, type: string) {
        appendFileSync(this.getFilePath(), `\n${this._getDebugString(text, type)}`);
    }

    /**
     * Writes the end of session marker to the log file.
     */
    public endLog() {
        appendFileSync(this.getFilePath(), `\n*** ENDING LOG SESSION ID ${this._sessionId}, ${new Date().toISOString()} ***`);
    }

    /**
     * Returns the absolute path of the log file.
     */
    public getFilePath(): string {
        return this._filePath;
    }

    public loading(text: string, debug?: boolean) {
        this._append(text, 'WAIT');
        super.loading(text, debug);
    }

    public success(text: string, debug?: boolean) {
        this._append(text, 'OK  ');
        super.success(text, debug);
    }

    public error(text: string, debug?: boolean) {
        this._append(text, 'ERR ');
        super.error(text, debug);
    }

    public warning(text: string, debug?: boolean) {
        this._append(text, 'WARN');
        super.warning(text, debug);
    }

    public info(text: string, debug?: boolean) {
        this._append(text, 'INFO');
        super.info(text, debug);
    }

    public log(text: string, debug?: boolean) {
        this._append(text, 'LOG ');
        super.log(text, debug);
    }

    public table(header: string[], data: string[][], debug?: boolean) {
        this._append(`${JSON.stringify(header)}${JSON.stringify(data)}`, 'TABL');
        super.table(header, data, debug);
    }

    public registryResponse(response: ResponseMessage, debug?: boolean) {
        this._append(`${JSON.stringify(response)}`, 'REG ');
        super.registryResponse(response, debug);
    }

    public tree(data: TreeLog, debug?: boolean) {
        this._append(`${JSON.stringify(data)}`, 'TREE');
        super.tree(data, debug);
    }

}
