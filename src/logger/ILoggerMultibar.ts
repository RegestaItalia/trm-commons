import { ILoggerProgressbar } from "./ILoggerProgressbar";

/**
 * Container for multiple progress bars, created with {@link ILogger.multibar}.
 */
export interface ILoggerMultibar {
    /**
     * Adds a new progress bar.
     * @param total value at which the bar is complete
     * @param startValue initial value
     * @param payload custom values, available as tokens in the bar format
     */
    create: (total: number, startValue: number, payload?: any) => ILoggerProgressbar,
    /**
     * Stops all progress bars.
     */
    stop: () => void
}
