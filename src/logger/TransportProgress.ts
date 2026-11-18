/**
 * Progress of a transport request operation that is polled until it ends (e.g. its import in the TMS queue),
 * passed to {@link ILogger.transportProgress} at every check.
 */
export type TransportProgress = {
    /**
     * transport request number
     */
    trkorr: string,
    /**
     * operation in progress
     */
    action: 'import' | 'release',
    /**
     * when the operation started waiting (epoch milliseconds): the same at every check of the same operation
     */
    started: number,
    /**
     * full message, shown by loggers without a dedicated view (e.g. as the CLI spinner text)
     */
    text: string,
    /**
     * current step, as told by the system (e.g. the tp import status message)
     */
    step?: string,
    /**
     * system time (HH:MM:SS) of the last change of the step, set when it didn't change since the previous check
     */
    unchangedSince?: string
};
