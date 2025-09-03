export interface IConnect {
    name: string,
    description: string,
    loginData: boolean,

    setData: (data: any) => void,
    getData: () => any,
    getSystemConnector?: () => Object,
    onConnectionData?: (force: boolean, commandArgs?: any) => Promise<void>,
    onAfterLoginData?: (force: boolean, commandArgs?: any) => Promise<void>,
    logData?: () => void
}