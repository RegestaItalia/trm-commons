import { IConnect } from ".";
import { Inquirer } from "../inquirer";
import { Logger } from "../logger";

export class RFCConnect implements IConnect {

    name = 'RFC';
    description = 'RFC (Uses node-rfc)';

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

    public getParsedData(args?: any): any {
        if (!args) {
            args = this._connData;
        }
        var parsed: any = {
            dest: args.dest,
            ashost: args.ashost,
            sysnr: args.sysnr,
            client: args.client,
            user: args.user,
            passwd: args.passwd,
            lang: args.lang
        };
        if (args.saprouter) {
            parsed.saprouter = args.saprouter;
        }
        return parsed;
    }

    public logConnectionData(connectionData?: any) {
        if (!connectionData) {
            connectionData = this.getParsedData();
        }
        if (connectionData.dest) {
            Logger.info(`System ID: ${connectionData.dest}`);
        } else {
            Logger.warning(`System ID: Unknown`);
        }
        if (connectionData.ashost) {
            Logger.info(`Application server: ${connectionData.ashost}`);
        } else {
            Logger.warning(`Application server: Unknown`);
        }
        if (connectionData.sysnr) {
            Logger.info(`Instance number: ${connectionData.sysnr}`);
        } else {
            Logger.warning(`Instance number: Unknown`);
        }
        if (connectionData.saprouter) {
            Logger.info(`SAProuter: ${connectionData.saprouter}`);
        }
        if (connectionData.client) {
            Logger.info(`Logon client: ${connectionData.client}`);
        } else {
            Logger.warning(`Logon client: Unknown`);
        }
        if (connectionData.lang) {
            Logger.info(`Logon language: ${connectionData.lang}`);
        } else {
            Logger.warning(`Logon language: Unknown`);
        }
        if (connectionData.user) {
            Logger.info(`Logon user: ${connectionData.user}`);
        } else {
            Logger.warning(`Logon user: Unknown`);
        }
        if (connectionData.passwd) {
            Logger.info(`Logon password: *** (SAVED IN PLAIN TEXT)`);
        } else {
            Logger.warning(`Logon password: Unknown`);
        }
    }

}