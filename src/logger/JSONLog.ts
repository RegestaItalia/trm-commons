/**
 * A log entry in JSON form.
 */
export type JSONLog = {
    /**
     * message type (e.g. `error`, `info`)
     */
    type: string,
    /**
     * message text
     */
    text: string
}
