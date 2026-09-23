import { IInquirer } from "./IInquirer";
import { Question } from "./Question";

/**
 * Global inquirer, shared by all TRM modules.
 *
 * Set {@link Inquirer.inquirer} once at startup, then use the functions of this namespace.
 *
 * @example
 * Inquirer.inquirer = new CliInquirer();
 * const { name } = await Inquirer.prompt({ type: 'input', name: 'name', message: 'Name' });
 */
export namespace Inquirer {
    /**
     * inquirer instance every function of this namespace delegates to
     */
    export var inquirer: IInquirer;

    function checkInquirer(){
        if(!inquirer){
            throw new Error('Inquirer not initialized.');
        }
    }

    /**
     * Asks one or more questions in sequence.
     * @param arg1 question, or list of questions
     * @returns object with answers, keyed by {@link Question.name}
     * @throws if {@link Inquirer.inquirer} is not set
     */
    export function prompt(arg1: Question | Question[]): Promise<any> {
        checkInquirer();
        return inquirer.prompt(arg1);
    }

    /**
     * Sets a text to put before every question message.
     * @param text prefix
     * @throws if {@link Inquirer.inquirer} is not set
     */
    export function setPrefix(text: string): void {
        checkInquirer();
        return inquirer.setPrefix(text);
    }

    /**
     * Removes the prefix set with {@link Inquirer.setPrefix}.
     * @throws if {@link Inquirer.inquirer} is not set
     */
    export function removePrefix(): void {
        checkInquirer();
        return inquirer.removePrefix();
    }

    /**
     * Returns the current prefix.
     * @throws if {@link Inquirer.inquirer} is not set
     */
    export function getPrefix(): string {
        checkInquirer();
        return inquirer.getPrefix();
    }
}
