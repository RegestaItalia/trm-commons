/**
 * Options of a single message, passed to {@link ILogger} implementations.
 */
export type LogMessageOptions = {
    /**
     * the message must stay visible after the operation ends (e.g. in a summary of the action outcome),
     * instead of being superseded by later messages
     */
    important?: boolean
};

/**
 * Options accepted by the message functions of {@link Logger}, in place of the `debug` flag.
 *
 * @example
 * Logger.warning('Transport was not released', { important: true });
 */
export type LogOptions = LogMessageOptions & {
    /**
     * print only in debug mode
     */
    debug?: boolean
};
