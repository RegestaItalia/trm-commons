import { ResponseMessage } from "trm-registry-types";
import { ILogger } from "./ILogger";
import { DummyLogger } from "./DummyLogger";
import { TreeLog } from "./TreeLog";
import { InspectOptions } from "util";
import { inspect as utilInspect } from "util";
import { ILoggerProgressbar } from "./ILoggerProgressbar";
import { ILoggerMultibar } from "./ILoggerMultibar";
import { LogMessageOptions, LogOptions } from "./LogOptions";

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
 * Text messages accept either the `debug` flag or {@link LogOptions}: flag a message as
 * `important` when it must stay visible after the operation ends.
 *
 * @example
 * Logger.logger = new CliLogger(false);
 * Logger.success('Done');
 * Logger.warning('Transport was not released', { important: true });
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
     * Splits the `debug` flag from the message options.
     * Options are only returned when set, so loggers unaware of them receive the same arguments as before.
     */
    function parseOptions(options?: boolean | LogOptions): { debug?: boolean, messageOptions?: LogMessageOptions } {
        if (!options || typeof options !== 'object') {
            return { debug: options as boolean };
        }
        return {
            debug: options.debug,
            messageOptions: options.important ? { important: true } : undefined
        };
    }

    function logText(method: 'success' | 'error' | 'warning' | 'info' | 'log', text: string, options?: boolean | LogOptions): void {
        checkLogger();
        const { debug, messageOptions } = parseOptions(options);
        if (messageOptions) {
            return logger[method](text, debug, messageOptions);
        }
        return logger[method](text, debug);
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
    export function success(text: string, options?: boolean | LogOptions): void {
        return logText('success', text, options);
    }

    /**
     * Prints an error message.
     * @see {@link ILogger.error}
     */
    export function error(text: string, options?: boolean | LogOptions): void {
        return logText('error', text, options);
    }

    /**
     * Prints a warning message.
     * @see {@link ILogger.warning}
     */
    export function warning(text: string, options?: boolean | LogOptions): void {
        return logText('warning', text, options);
    }

    /**
     * Prints an information message.
     * @see {@link ILogger.info}
     */
    export function info(text: string, options?: boolean | LogOptions): void {
        return logText('info', text, options);
    }

    /**
     * Prints a plain message.
     * @see {@link ILogger.log}
     */
    export function log(text: string, options?: boolean | LogOptions): void {
        return logText('log', text, options);
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
    export function msgty(msgty: string, text: string, options?: boolean | LogOptions): void {
        checkLogger();
        const { debug, messageOptions } = parseOptions(options);
        if (messageOptions) {
            return logger.msgty(msgty, text, debug, messageOptions);
        }
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
