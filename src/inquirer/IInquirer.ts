import { Question } from "./Question";

/**
 * Asks the user questions. Implement this to plug a custom inquirer into {@link Inquirer}.
 */
export interface IInquirer {
    /**
     * Asks one or more questions in sequence.
     * @param arg1 question, or list of questions
     * @returns object with answers, keyed by {@link Question.name}. Skipped questions are not included.
     */
    prompt: (arg1: Question | Question[]) => Promise<any>,
    /**
     * Sets a text to put before every question message.
     * @param text prefix
     */
    setPrefix: (text: string) => void,
    /**
     * Removes the prefix set with {@link IInquirer.setPrefix}.
     */
    removePrefix: () => void,
    /**
     * Returns the current prefix, or an empty string if none is set.
     */
    getPrefix: () => string
}
