import { IConnect } from ".";
import normalizeUrl from "@esm2cjs/normalize-url";
import { Inquirer } from "../inquirer";
import { Logger } from "../logger";

/**
 * Connection to an SAP system through the trm-rest HTTP service.
 *
 * Connection data: `endpoint`, `rfcdest` (forward RFC destination, defaults to `NONE`),
 * `client`, `user`, `passwd`, `lang`.
 */
export class RESTConnect implements IConnect {

    name = 'REST';
    description = 'REST (Requires trm-rest)';
    loginData = true;

    private _connData: any;

    public async onConnectionData(force: boolean, commandArgs: any): Promise<void> {
        // forwardRfcDest provided (string) = use it, otherwise prompt (default saved rfcdest or NONE)
        const forwardRfcDest = commandArgs.forwardRfcDest;
        const presetRfcDest: string = typeof forwardRfcDest === 'string' && forwardRfcDest.trim() ? forwardRfcDest : (commandArgs.rfcdest || 'NONE');
        const answers = await Inquirer.prompt([{
            type: `input`,
            name: `endpoint`,
            message: `System endpoint`,
            default: commandArgs.endpoint,
            when: (hash) => {
                return (commandArgs.endpoint ? false : true) || force;
            }
        }, {
            type: `input`,
            name: `rfcdest`,
            message: `Forward RFC Destination`,
            default: presetRfcDest,
            when: (hash) => {
                return !(typeof forwardRfcDest === 'string' && forwardRfcDest.trim()) || force;
            }
        }]);
        this._connData = {
            ...answers,
            rfcdest: (answers.rfcdest || presetRfcDest).trim().toUpperCase() || 'NONE'
        };
    }

    public async onAfterLoginData(force: boolean, commandArgs: any): Promise<void> {
        this._connData = { ...commandArgs, ...this._connData };
        try {
            const url = new URL(this._connData.endpoint);
            this._connData.endpoint = normalizeUrl(url.origin, {
                removeTrailingSlash: true
            });
        } catch { }
        if (this._connData.user) {
            this._connData.user = this._connData.user.toUpperCase();
        }
    }

    public setData(data: any): void {
        this._connData = data;
    }

    public getData(): any {
        return {
            endpoint: this._connData.endpoint,
            rfcdest: this._connData.rfcdest || 'NONE',
            client: this._connData.client,
            user: this._connData.user,
            passwd: this._connData.passwd,
            lang: this._connData.lang
        };
    }

    public logData() {
        if (this._connData.endpoint) {
            Logger.info(`System endpoint: ${this._connData.endpoint}`);
        } else {
            Logger.warning(`System endpoint: Unknown`);
        }
        if (this._connData.rfcdest && this._connData.rfcdest !== 'NONE') {
            Logger.info(`RFC Forward: ${this._connData.rfcdest}`);
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