/**
 * Describes a single argument that a connection type accepts from `commandArgs`.
 */
export interface ConnectArgument {
    /**
     * key expected in commandArgs (e.g. from client --connection-args JSON)
     */
    name: string,
    /**
     * human readable description of the argument
     */
    description: string,
    /**
     * value is a secret (e.g. password), never print it
     */
    secret?: boolean
}

/**
 * A connection type used by TRM to reach an SAP system (e.g. RFC, REST).
 *
 * The lifecycle is:
 * 1. {@link IConnect.onConnectionData} collects the system address (host, endpoint, ...)
 * 2. the client collects logon data (client, user, password, language) if {@link IConnect.loginData} is `true`
 * 3. {@link IConnect.onAfterLoginData} merges and normalizes everything
 * 4. {@link IConnect.getData} returns the final connection data, which can be persisted and restored with {@link IConnect.setData}
 */
export interface IConnect {
    /**
     * unique identifier of the connection type (e.g. `RFC`)
     */
    name: string,
    /**
     * description shown to the user when choosing a connection type
     */
    description: string,
    /**
     * `true` if the connection requires logon data (client, user, password, language)
     */
    loginData: boolean,
    /**
     * arguments accepted by this connection from commandArgs, used for validation and documentation
     */
    connectionArgs?: ConnectArgument[],

    /**
     * Restores previously saved connection data.
     * @param data connection data, as returned by {@link IConnect.getData}
     */
    setData: (data: any) => void,
    /**
     * Returns the connection data, ready to be persisted or passed to the system connector.
     */
    getData: () => any,
    /**
     * Returns the system connector instance for this connection, if the connection type provides one.
     */
    getSystemConnector?: () => Object,
    /**
     * Collects the system address data, prompting the user for anything missing in `commandArgs`.
     * @param force always prompt, even when a value is already provided in `commandArgs`
     * @param commandArgs values provided by the caller (e.g. command line arguments)
     */
    onConnectionData?: (force: boolean, commandArgs?: any) => Promise<void>,
    /**
     * Called after logon data has been collected, to merge and normalize connection data.
     * @param force always prompt, even when a value is already provided in `commandArgs`
     * @param commandArgs values provided by the caller, including logon data
     */
    onAfterLoginData?: (force: boolean, commandArgs?: any) => Promise<void>,
    /**
     * Prints the current connection data using `Logger`. Secrets are never printed.
     */
    logData?: () => void
}
