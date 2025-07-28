import { Question } from "./Question";
import { CliLogFileLogger, CliLogger, Logger } from "../logger";
import { IInquirer } from "./IInquirer";
import * as cliInquirer from '@inquirer/prompts';
import { select as selectPro } from 'inquirer-select-pro';

export class CliInquirer implements IInquirer {

    private _prefix: string = '';

    constructor() { }

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
                question.type = 'select';
            }
            if(cliInquirer[question.type]){
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
                    oResponse = await cliInquirer[question.type](question as any);
                    hash[question.name] = oResponse;
                }
            }else if((question.type as any) === 'inquirer-select-pro'){
                oResponse = await selectPro({
                    message: question.message,
                    validate: question.validate,
                    options: question.choices,
                    filter: question.filter,
                    required: question.required
                });
                hash[question.name] = oResponse;
            }else{
                throw new Error(`Unknown CLI inquirer type "${question.type}".`);
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
}