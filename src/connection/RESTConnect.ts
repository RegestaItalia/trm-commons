import { IConnect } from ".";
import normalizeUrl from "@esm2cjs/normalize-url";
import { Inquirer } from "../inquirer";
import { Logger } from "../logger";

export class RESTConnect implements IConnect {

    name = 'REST';
    description = 'REST (Requires trm-rest)';

    private _connData: any;

    public async onConnectionData(force: boolean, commandArgs: any): Promise<void> {
        this._connData = await Inquirer.prompt([{
            type: `input`,
            name: `endpoint`,
            message: `System endpoint`,
            default: commandArgs.endpoint,
            when: (hash) => {
                return (commandArgs.endpoint ? false : true) || force;
            }
        }, {
            type: `input`,
            name: `forwardRfcDest`,
            message: `Forward RFC Destination`,
            default: commandArgs.forwardRfcDest || 'NONE',
            when: (hash) => {
                return commandArgs.forwardRfcDest || force; //only show when in arguments or forced
            }
        }]);
    }

    public async onAfterLoginData(force: boolean, commandArgs: any): Promise<void> {
        this._connData = { ...commandArgs, ...this._connData };
        this._connData.endpoint = normalizeUrl(this._connData.endpoint, {
            removeTrailingSlash: true
        });
    }

    public getParsedData(args?: any): any {
        if (!args) {
            args = this._connData;
        }
        var parsed: any = {
            endpoint: args.endpoint,
            rfcdest: args.rfcdest || 'NONE',
            client: args.client,
            user: args.user,
            passwd: args.passwd,
            lang: args.lang
        };
        return parsed;
    }

    public logConnectionData(connectionData?: any) {
        if (!connectionData) {
            connectionData = this.getParsedData();
        }
        if (connectionData.endpoint) {
            Logger.info(`System endpoint: ${connectionData.endpoint}`);
        } else {
            Logger.warning(`System endpoint: Unknown`);
        }
        if (connectionData.rfcdest && connectionData.rfcdest !== 'NONE') {
            Logger.info(`RFC Forward: ${connectionData.rfcdest}`);
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