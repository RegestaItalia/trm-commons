import { ResponseMessage } from "trm-registry-types";
import { ILogger } from "./ILogger";
import { DummyLogger } from "./DummyLogger";
import { TreeLog } from "./TreeLog";
import { InspectOptions } from "util";
import { inspect as utilInspect } from "util";
import { ILoggerProgressbar } from "./ILoggerProgressbar";
import { ILoggerMultibar } from "./ILoggerMultibar";

/**
 * Same as Node.js `util.inspect`, but hides authentication data (`_authData` and `_login` properties).
 * Use it to log objects that may hold credentials.
 * @param object object to inspect
 * @param options `util.inspect` options
 */
export function inspect(object: any, options?: InspectOptions): string {
    var sInspect = utilInspect(object, options);
    sInspect = sInspect.replace(/_authData:\s*{\s*.*?\s*}/gmi, '_authData: HIDDEN');
    sInspect = sInspect.replace(/_login:\s*{\s*.*?\s*}/gmi, '_login: HIDDEN');
    return sInspect;
}

/**
 * Global logger, shared by all TRM modules.
 *
 * Set {@link Logger.logger} once at startup, then use the functions of this namespace.
 * Until then, messages are discarded ({@link DummyLogger}).
 *
 * See {@link ILogger} for details on each function.
 *
 * @example
 * Logger.logger = new CliLogger(false);
 * Logger.success('Done');
 */
export namespace Logger {

    /**
     * logger instance every function of this namespace delegates to
     */
    export var logger: ILogger = new DummyLogger();

    function checkLogger(){
        if(!logger){
            throw new Error('Logger not initialized.');
        }
    }

    /**
     * Shows a message for an operation in progress, until the next message.
     * @see {@link ILogger.loading}
     */
    export function loading(text: string, debug?: boolean): void {
        checkLogger();
        return logger.loading(text, debug);
    }

    /**
     * Prints a success message.
     * @see {@link ILogger.success}
     */
    export function success(text: string, debug?: boolean): void {
        checkLogger();
        return logger.success(text, debug);
    }

    /**
     * Prints an error message.
     * @see {@link ILogger.error}
     */
    export function error(text: string, debug?: boolean): void {
        checkLogger();
        return logger.error(text, debug);
    }

    /**
     * Prints a warning message.
     * @see {@link ILogger.warning}
     */
    export function warning(text: string, debug?: boolean): void {
        checkLogger();
        return logger.warning(text, debug);
    }

    /**
     * Prints an information message.
     * @see {@link ILogger.info}
     */
    export function info(text: string, debug?: boolean): void {
        checkLogger();
        return logger.info(text, debug);
    }

    /**
     * Prints a plain message.
     * @see {@link ILogger.log}
     */
    export function log(text: string, debug?: boolean): void {
        checkLogger();
        return logger.log(text, debug);
    }

    /**
     * Prints a table.
     * @see {@link ILogger.table}
     */
    export function table(header: any, data: any, debug?: boolean): void {
        checkLogger();
        return logger.table(header, data, debug);
    }

    /**
     * Prints a message returned by the TRM registry.
     * @see {@link ILogger.registryResponse}
     */
    export function registryResponse(response: ResponseMessage, debug?: boolean): void {
        checkLogger();
        return logger.registryResponse(response, debug);
    }

    /**
     * Prints a tree.
     * @see {@link ILogger.tree}
     */
    export function tree(data: TreeLog, debug?: boolean): void {
        checkLogger();
        return logger.tree(data, debug);
    }

    /**
     * Sets a text to put before every message.
     * @see {@link ILogger.setPrefix}
     */
    export function setPrefix(text: string): void {
        checkLogger();
        return logger.setPrefix(text);
    }

    /**
     * Removes the prefix set with {@link Logger.setPrefix}.
     */
    export function removePrefix(): void {
        checkLogger();
        return logger.removePrefix();
    }

    /**
     * Returns the current prefix.
     */
    export function getPrefix(): string {
        checkLogger();
        return logger.getPrefix();
    }

    /**
     * Prints a message based on an SAP message type (`A`, `E`, `W`, `I`, `S`).
     * @see {@link ILogger.msgty}
     */
    export function msgty(msgty: string, text: string, debug?: boolean): void {
        checkLogger();
        return logger.msgty(msgty, text, debug);
    }

    /**
     * Stops the current loading message, if any.
     */
    export function forceStop(): void {
        checkLogger();
        return logger.forceStop();
    }

    /**
     * Creates a progress bar.
     * @see {@link ILogger.progressbar}
     */
    export function progressbar(format: string, glue: string): ILoggerProgressbar {
        checkLogger();
        return logger.progressbar(format, glue);
    }

    /**
     * Creates a container for multiple progress bars.
     * @see {@link ILogger.multibar}
     */
    export function multibar(format: string, glue: string): ILoggerMultibar {
        checkLogger();
        return logger.multibar(format, glue);
    }

}
