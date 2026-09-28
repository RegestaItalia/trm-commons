/**
 * A column displayed by a value help.
 */
export type ValueHelpColumn = {
    /**
     * key of the value in {@link ValueHelpPage.rows}
     */
    name: string,
    /**
     * column header, defaults to {@link ValueHelpColumn.name}
     */
    label?: string
};

/**
 * Parameters received by a {@link ValueHelp.handler}.
 */
export type ValueHelpContext = {
    /**
     * text typed by the user: the handler should filter by it
     */
    search?: string,
    /**
     * number of rows to skip
     */
    offset: number,
    /**
     * maximum number of rows to return
     */
    limit: number,
    /**
     * row being edited, when the value help belongs to a table column
     */
    row?: Record<string, any>,
    /**
     * rows containing {@link ValueHelpContext.row} in nested tables, outermost first
     */
    parentRows?: Record<string, any>[],
    /**
     * other values known so far (e.g. answers or command arguments)
     */
    values?: Record<string, any>
};

/**
 * A page of value help results.
 */
export type ValueHelpPage = {
    rows: Record<string, any>[],
    /**
     * `true` if more rows are available after this page
     */
    hasMore: boolean
};

/**
 * List of selectable values, loaded page by page.
 *
 * Used by UI clients only: CLI clients ignore it.
 */
export type ValueHelp = {
    /**
     * key of the value in {@link ValueHelpPage.rows} returned when a row is selected
     */
    key: string,
    /**
     * columns displayed, defaults to all keys of the rows
     */
    columns?: ValueHelpColumn[],
    /**
     * returns the rows matching the context
     */
    handler: (ctx: ValueHelpContext) => Promise<ValueHelpPage>
};

/**
 * Serializable {@link ValueHelp}, sent to UI clients in place of the handler.
 *
 * The client requests pages by {@link ValueHelpDescriptor.id} to the process owning the handler.
 */
export type ValueHelpDescriptor = Omit<ValueHelp, 'handler'> & {
    id: string
};

/**
 * Returns a page of rows already in memory, filtered by {@link ValueHelpContext.search} (case insensitive, on all values).
 * @param rows all rows
 * @param ctx value help context
 */
export function staticValueHelpPage(rows: Record<string, any>[], ctx: ValueHelpContext): ValueHelpPage {
    var filtered = rows || [];
    const search = (ctx.search || '').trim().toUpperCase();
    if (search) {
        filtered = filtered.filter(row => Object.values(row || {}).some(v => v !== undefined && v !== null && String(v).toUpperCase().includes(search)));
    }
    const offset = Math.max(0, ctx.offset || 0);
    const limit = Math.max(0, ctx.limit || 0);
    return {
        rows: filtered.slice(offset, offset + limit),
        hasMore: offset + limit < filtered.length
    };
}
