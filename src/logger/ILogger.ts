import { ResponseMessage } from "trm-registry-types";
import { TreeLog } from "./TreeLog";
import { ILoggerMultibar } from "./ILoggerMultibar";
import { ILoggerProgressbar } from "./ILoggerProgressbar";

/**
 * Logger used by TRM modules. Implement this to plug a custom logger into {@link Logger}.
 *
 * Every output method accepts an optional `debug` flag: when `true`, the message
 * is only printed if the logger was created in debug mode ({@link ILogger.debug}).
 */
export interface ILogger {
    /**
     * `true` if messages flagged as debug should be printed
     */
    debug: boolean,
    /**
     * Sets a text to put before every message.
     * @param text prefix
     */
    setPrefix: (text: string) => void,
    /**
     * Removes the prefix set with {@link ILogger.setPrefix}.
     */
    removePrefix: () => void,
    /**
     * Returns the current prefix, or an empty string if none is set.
     */
    getPrefix: () => string,
    /**
     * Shows a message for an operation in progress (e.g. a spinner), until the next message.
     * @param text message
     * @param debug print only in debug mode
     */
    loading: (text: string, debug?: boolean) => void,
    /**
     * Stops the current loading message, if any.
     */
    forceStop: () => void,
    /**
     * Prints a success message.
     * @param text message, can span multiple lines
     * @param debug print only in debug mode
     */
    success: (text: string, debug?: boolean) => void,
    /**
     * Prints an error message.
     * @param text message, can span multiple lines
     * @param debug print only in debug mode
     */
    error: (text: string, debug?: boolean) => void,
    /**
     * Prints a warning message.
     * @param text message, can span multiple lines
     * @param debug print only in debug mode
     */
    warning: (text: string, debug?: boolean) => void,
    /**
     * Prints an information message.
     * @param text message, can span multiple lines
     * @param debug print only in debug mode
     */
    info: (text: string, debug?: boolean) => void,
    /**
     * Prints a plain message.
     * @param text message, can span multiple lines
     * @param debug print only in debug mode
     */
    log: (text: string, debug?: boolean) => void,
    /**
     * Prints a table.
     * @param header column titles
     * @param data rows, each one with a value per column
     * @param debug print only in debug mode
     */
    table: (header: string[], data: string[][], debug?: boolean) => void,
    /**
     * Prints a message returned by the TRM registry, as error, warning or info depending on its type.
     * @param response registry message
     * @param debug print only in debug mode
     */
    registryResponse: (response: ResponseMessage, debug?: boolean) => void,
    /**
     * Prints a tree.
     * @param data root node
     * @param debug print only in debug mode
     */
    tree: (data: TreeLog, debug?: boolean) => void,
    /**
     * Prints a message based on an SAP message type.
     * @param msgty SAP message type: `A` or `E` (error), `W` (warning), `I` (info), `S` (success). Other values are ignored.
     * @param text message
     * @param debug print only in debug mode
     */
    msgty: (msgty: string, text: string, debug?: boolean) => void,
    /**
     * Creates a progress bar.
     * @param format bar format (cli-progress syntax, e.g. `{bar} {value}/{total}`)
     * @param glue string placed between the complete and incomplete parts of the bar
     */
    progressbar: (format: string, glue: string) => ILoggerProgressbar,
    /**
     * Creates a container for multiple progress bars.
     * @param format bar format (cli-progress syntax, e.g. `{bar} {value}/{total}`)
     * @param glue string placed between the complete and incomplete parts of the bar
     */
    multibar: (format: string, glue: string) => ILoggerMultibar
}
