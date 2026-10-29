import { Question } from "./Question";
import { IInquirer } from "./IInquirer";

/**
 * {@link IInquirer} for runs with prompts disabled (e.g. `--no-prompts`).
 *
 * A question that would be asked (its `when` is not `false`) takes its default; without a default,
 * the prompt fails with an error naming the missing value instead of waiting for an answer.
 * `changelog` questions are skipped.
 * Prefix functions are delegated to the wrapped inquirer.
 *
 * @example
 * const previous = Inquirer.inquirer;
 * Inquirer.inquirer = new NonInteractiveInquirer(previous, 'Pass it with --connection-args.');
 * try { ... } finally { Inquirer.inquirer = previous; }
 */
export class NonInteractiveInquirer implements IInquirer {

    /**
     * @param _base inquirer the prefix functions are delegated to
     * @param _hint text appended to the error, telling how to provide the missing value
     */
    constructor(private readonly _base: IInquirer, private readonly _hint: string = '') { }

    public async prompt(arg1: Question | Question[]): Promise<any> {
        const aQuestions: any[] = Array.isArray(arg1) ? arg1 : [arg1];
        const answers: any = {};
        for (const question of aQuestions) {
            if (question.type === 'changelog') { // UI only
                continue;
            }
            const when = typeof question.when === 'function' ? await question.when(answers) : question.when;
            if (when === false) {
                continue;
            }
            const value = typeof question.default === 'function' ? await question.default(answers) : question.default;
            if (value === undefined || value === null || value === '') {
                throw new Error(`"${question.message}" (${question.name}) is required when interactive prompts are disabled (--no-prompts).${this._hint ? ` ${this._hint}` : ''}`);
            }
            answers[question.name] = value;
        }
        return answers;
    }

    public setPrefix(text: string): void {
        this._base.setPrefix(text);
    }

    public removePrefix(): void {
        this._base.removePrefix();
    }

    public getPrefix(): string {
        return this._base.getPrefix();
    }

    public isUi(): boolean {
        return false;
    }

}
