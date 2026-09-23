/**
 * A node of a tree printed with {@link ILogger.tree}.
 */
export type TreeLog = {
    /**
     * node text
     */
    text: string,
    /**
     * child nodes
     */
    children?: TreeLog[]
}
