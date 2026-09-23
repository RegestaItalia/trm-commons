/**
 * Progress bar, created with {@link ILogger.progressbar} or {@link ILoggerMultibar.create}.
 */
export interface ILoggerProgressbar {
    /**
     * Starts the bar.
     * @param total value at which the bar is complete
     * @param value initial value
     * @param payload custom values, available as tokens in the bar format
     */
    start: (total: number, value: number, payload?: any) => void,
    /**
     * Sets the current value.
     * @param value current value
     * @param payload custom values, available as tokens in the bar format
     */
    update: (value: number, payload?: any) => void,
    /**
     * Stops the bar.
     */
    stop: () => void
}
