import { IConnect } from ".";
import { Inquirer } from "../inquirer";
import { Logger } from "../logger";

export class RFCConnect implements IConnect {

    name = 'RFC';
    description = 'RFC (Uses node-rfc)';
    loginData = true;

    private _connData: any;

    public async onConnectionData(force: boolean, commandArgs: any): Promise<void> {
        this._connData = await Inquirer.prompt([{
            type: `input`,
            name: `ashost`,
            message: `Application server`,
            default: commandArgs.ashost,
            when: (hash) => {
                return (commandArgs.ashost ? false : true) || force;
            },
            validate: (val) => {
                if (val) {
                    return true;
                } else {
                    return `Invalid input: application server in mandatory`;
                }
            }
        }, {
            type: `input`,
            name: `dest`,
            message: `System ID`,
            default: commandArgs.dest,
            when: (hash) => {
                return (commandArgs.dest ? false : true) || force;
            },
            validate: (val) => {
                if (val && /^\w{3}$/.test(val)) {
                    return true;
                } else {
                    return `Invalid input: expected length 3, only letters allowed`;
                }
            }
        }, {
            type: `input`,
            name: `sysnr`,
            message: `Instance number`,
            default: commandArgs.sysnr,
            when: (hash) => {
                return (commandArgs.sysnr ? false : true) || force;
            },
            validate: (val) => {
                if (val && /^\d{2}$/.test(val)) {
                    return true;
                } else {
                    return `Invalid input: expected length 2, only numbers allowed`;
                }
            }
        }, {
            type: `input`,
            name: `saprouter`,
            message: `SAProuter`,
            default: commandArgs.saprouter,
            when: (hash) => {
                return (commandArgs.saprouter ? false : true) || force;
            }
        }]);
    }

    public async onAfterLoginData(force: boolean, commandArgs: any): Promise<void> {
        this._connData = { ...commandArgs, ...this._connData };
    }

    public setData(data: any): void {
        this._connData = data;
    }

    public getData(): any {
        var parsed: any = {
            dest: this._connData.dest,
            ashost: this._connData.ashost,
            sysnr: this._connData.sysnr,
            client: this._connData.client,
            user: this._connData.user,
            passwd: this._connData.passwd,
            lang: this._connData.lang
        };
        if (this._connData.saprouter) {
            parsed.saprouter = this._connData.saprouter;
        }
        return parsed;
    }

    public logData() {
        if (this._connData.dest) {
            Logger.info(`System ID: ${this._connData.dest}`);
        } else {
            Logger.warning(`System ID: Unknown`);
        }
        if (this._connData.ashost) {
            Logger.info(`Application server: ${this._connData.ashost}`);
        } else {
            Logger.warning(`Application server: Unknown`);
        }
        if (this._connData.sysnr) {
            Logger.info(`Instance number: ${this._connData.sysnr}`);
        } else {
            Logger.warning(`Instance number: Unknown`);
        }
        if (this._connData.saprouter) {
            Logger.info(`SAProuter: ${this._connData.saprouter}`);
        }
        if (this._connData.client) {
            Logger.info(`Logon client: ${this._connData.client}`);
        } else {
            Logger.warning(`Logon client: Unknown`);
        }
        if (this._connData.lang) {
            Logger.info(`Logon language: ${this._connData.lang}`);
        } else {
            Logger.warning(`Logon language: Unknown`);
        }
        if (this._connData.user) {
            Logger.info(`Logon user: ${this._connData.user}`);
        } else {
            Logger.warning(`Logon user: Unknown`);
        }
        if (this._connData.passwd) {
            Logger.info(`Logon password: *** (SAVED IN PLAIN TEXT)`);
        } else {
            Logger.warning(`Logon password: Unknown`);
        }
    }

}