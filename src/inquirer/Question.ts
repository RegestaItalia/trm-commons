/**
 * A question to ask with {@link IInquirer.prompt}.
 */
export type Question = {
    /**
     * prompt type
     *
     * `list` is deprecated: it is handled as `search`, filtering {@link Question.choices}
     */
    type: 'confirm' | 'input' | 'list' | 'editor' | 'password' | 'select' | 'search',
    /**
     * text shown to the user
     */
    message: any,
    /**
     * key of the answer in the returned object
     */
    name: any,
    /**
     * default answer
     */
    default?: any,
    /**
     * validation function: return `true` if the value is valid, otherwise an error message
     */
    validate?: any,
    /**
     * choices for `list`, `select` and `search` questions (`{ name?, value }` objects)
     */
    choices?: any[],
    /**
     * `boolean`, or function receiving the answers given so far, telling whether the question should be asked
     */
    when?: any,
    /**
     * number of choices displayed at once
     */
    pageSize?: number,
    expanded?: boolean,
    postfix?: string,
    /**
     * `select` only: allow filtering choices by typing
     */
    filter?: boolean,
    /**
     * `select` only: an answer is mandatory
     */
    required?: boolean,
    /**
     * `search` only: returns the choices matching the text typed by the user
     */
    source?: (term: string | void) => Promise<any[]>
}
