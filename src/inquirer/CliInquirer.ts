import { Question } from "./Question";
import { CliLogFileLogger, CliLogger, Logger } from "../logger";
import { IInquirer } from "./IInquirer";
import * as cliInquirer from '@inquirer/prompts';
import { select as selectPro } from 'inquirer-select-pro';

/**
 * Interactive terminal {@link IInquirer}, based on `@inquirer/prompts` and `inquirer-select-pro`.
 *
 * Stops the loader of a {@link CliLogger} before prompting, so the two don't overlap.
 */
export class CliInquirer implements IInquirer {

    private _prefix: string = '';

    /**
     * @param _ui `true` if used by a UI client (see {@link Inquirer.isUi})
     */
    constructor(private readonly _ui: boolean = false) { }

    public async prompt(arg1: Question | Question[]): Promise<any> {
        if(Logger.logger instanceof CliLogger || Logger.logger instanceof CliLogFileLogger){
            Logger.logger.forceStop();
        }
        var aQuestions: Question[];
        var hash = {};
        var oResponse: any;
        if(!Array.isArray(arg1)){
            aQuestions = [arg1];
        }else{
            aQuestions = arg1;
        }
        for(var question of aQuestions){
            oResponse = {};
            if(question.type === 'select'){
                (question.type as any) = 'inquirer-select-pro';
            }
            if(question.type === 'list'){ // deprecated
                question.type = 'search';
                if(!question.source){
                    question.source = async(input) : Promise<any[]> => {
                        var choices = (question.choices || []);
                        if(question.default){
                            //find default, move as first selection item
                            choices = choices.sort((a, b) => (a.value === question.default ? -1 : b.value === question.default ? 1 : 0));
                        }
                        if(input){
                            return choices.filter(o => o.name ? o.name.toUpperCase().includes(input.toUpperCase()) : o.value.toUpperCase().includes(input.toUpperCase()));
                        }else{
                            return choices;
                        }
                    };
                }
            }
            const isSelectPro = (question.type as any) === 'inquirer-select-pro';
            if(!cliInquirer[question.type] && !isSelectPro){
                throw new Error(`Unknown CLI inquirer type "${question.type}".`);
            }
            var prompt: boolean;
            if(question.when === undefined){
                prompt = true;
            }else if(typeof(question.when) === 'boolean'){
                prompt = question.when;
            }else {
                prompt = await question.when(hash);
            }
            if(prompt){
                question.message = this._prefix + question.message;
                if(isSelectPro){
                    oResponse = await selectPro({
                        message: question.message,
                        validate: question.validate,
                        options: question.choices,
                        filter: question.filter,
                        required: question.required
                    });
                }else{
                    const { ui, valueHelp, ...cliQuestion } = question;
                    oResponse = await cliInquirer[question.type](cliQuestion as any);
                }
                hash[question.name] = oResponse;
            }
        }
        return hash;
    }

    public setPrefix(text: string): void {
        this._prefix = text;
    }

    public removePrefix(): void {
        this._prefix = '';
    }

    public getPrefix(): string {
        return this._prefix;
    }

    public isUi(): boolean {
        return this._ui;
    }
}