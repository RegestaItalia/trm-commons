export interface IConnect {
    name: string,
    description: string,
    getParsedData: (args?: any) => any,
    onConnectionData?: (force: boolean, commandArgs?: any) => Promise<void>,
    onAfterLoginData?: (force: boolean, commandArgs?: any) => Promise<void>,
    getSystemConnector?: (connectionData?: any, loginData?: any) => Object,
    logConnectionData?: (connectionData?: any) => void
}