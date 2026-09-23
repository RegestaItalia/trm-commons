# <a href="https://docs.trmregistry.com/"><img src="https://docs.trmregistry.com/logo.png" height="40" alt="TRM"></a>

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-1.3.0-4baaaa.svg)](https://github.com/RegestaItalia/trm-docs/blob/main/CODE_OF_CONDUCT.md)
[![trm-commons License](https://img.shields.io/github/license/RegestaItalia/trm-commons)](https://github.com/RegestaItalia/trm-commons)
[![trm-commons Latest version](https://img.shields.io/npm/v/trm-commons)](https://www.npmjs.com/package/trm-commons)
[![trm-commons Installs](https://img.shields.io/npm/dt/trm-commons)](https://www.npmjs.com/package/trm-commons)
[![View Code Wiki](https://assets.codewiki.google/readme-badge/static.svg)](https://codewiki.google/github.com/regestaitalia/trm-docs)

| 🚀 This project is funded and maintained by 🏦  | 🔗                                                             |
|-------------------------------------------------|----------------------------------------------------------------|
| Regesta S.p.A.                                  | [https://www.regestaitalia.eu/](https://www.regestaitalia.eu/) |
| Clarex S.r.l.                                   | [https://www.clarex.it/](https://www.clarex.it/)               |

[trm-commons](https://www.npmjs.com/package/trm-commons) is the shared library used by TRM components ([trm-client](https://github.com/RegestaItalia/trm-client), [trm-core](https://github.com/RegestaItalia/trm-core), plugins).

🚚 **TRM (Transport Request Manager)** is a package manager inspired solution built leveraging CTS that simplifies SAP ABAP transports.

> [!NOTE]
> This is a technical module meant for developers who build or extend TRM.
> If you are looking to use TRM, see [trm-client](https://github.com/RegestaItalia/trm-client).

---


# Install

```bash
npm install trm-commons
```

---

# Logger

`Logger` is a global namespace: set the implementation once at startup, then every TRM module logs through it.
Until an implementation is set, messages are discarded (`DummyLogger`).

```ts
import { Logger, CliLogger } from "trm-commons";

Logger.logger = new CliLogger(false); // true = print debug messages

Logger.loading("Reading package...");
Logger.success("Package read");
Logger.info("Only visible in debug mode", true);
```

Custom loggers can be plugged in by implementing `ILogger`.

When logging objects that may contain credentials, use `inspect` instead of `util.inspect`: it hides authentication data.

# Inquirer

`Inquirer` works like `Logger`: set the implementation once, then prompt from anywhere.

```ts
import { Inquirer, CliInquirer } from "trm-commons";

Inquirer.inquirer = new CliInquirer();

const answers = await Inquirer.prompt([{
    type: "input",
    name: "user",
    message: "Logon user"
}, {
    type: "confirm",
    name: "save",
    message: "Save connection?",
    when: (hash) => !!hash.user
}]);
```

Custom inquirers (e.g. non-interactive, answering from a file) can be plugged in by implementing `IInquirer`.

# Plugins

TRM components raise events through `Plugin.call`. Plugins can hook into them to read or modify the event payload.

A plugin is an npm package named `trm-plugin-*` (scoped packages are supported), installed in the nearest local `node_modules` or globally.
Its default export is a function that registers handlers:

```ts
import { PluginRegisterFn } from "trm-commons";

const register: PluginRegisterFn = (on) => {
    on("core", "someEvent", async (payload, ctx) => {
        return { ...payload, changed: true };
    }, { priority: 10, timeoutMs: 5000 });
};

export default register;

// optional, plugins with lower priority run first (default 100)
export const meta = { priority: 50 };
```

- `ctx` is the TRM layer raising the event: `client` or `core`
- Handlers are chained: each one receives the payload returned by the previous one. Returning nothing leaves the payload unchanged
- Handlers run ordered by plugin priority, then handler priority, then plugin name
- A handler that throws or exceeds its timeout (default 3000 ms) is skipped

On the component side:

```ts
import { Plugin } from "trm-commons";

await Plugin.load(); // optional, done automatically on first call
const payload = await Plugin.call("core", "someEvent", { changed: false });
```

> [!IMPORTANT]
> `Logger`, `Inquirer` and `Plugin` are globals: a plugin must use the **same** `trm-commons` instance as the host, not its own copy.
> Declare `trm-commons` as a peer dependency and use the instance the client passes with the `loadCommons` event:
>
> ```ts
> on("client", "loadCommons", (opts: { commons: typeof import("trm-commons") }) => {
>     commons = opts.commons;
> });
> ```

For a real example, see [trm-plugin-btp-dest](https://github.com/RegestaItalia/trm-plugin-btp-dest).

# Connections

A connection type describes how TRM reaches an SAP system. Built-in types are `RFCConnect` (via [node-rfc](https://github.com/SAP-archive/node-rfc)) and `RESTConnect` (via [trm-rest](https://github.com/RegestaItalia/trm-rest)).

New connection types implement `IConnect`. Its lifecycle is:

1. `onConnectionData` collects the system address, prompting for anything missing in the command arguments
2. logon data (client, user, password, language) is collected, if `loginData` is `true`
3. `onAfterLoginData` merges and normalizes the data
4. `getData` returns the final connection data, which can be persisted and later restored with `setData`

Declare the arguments your connection accepts in `connectionArgs`, marking passwords and tokens as `secret` so they are never printed.

New connection types are made available to trm-client through a plugin, by handling the `onContextLoadConnections` event:

```ts
on("client", "onContextLoadConnections", (connections: IConnect[]) => {
    connections.push(new MyConnect());
    return connections;
});
```

---

# Development

```bash
npm install
npm run build
```

---

# Contributing

Like every other TRM open-source projects, contributions are always welcomed ❤️.

Make sure to open an issue first.

Contributions will be merged upon approval.

[Click here](https://docs.trmregistry.com/#/CONTRIBUTING) for the full list of TRM contribution guidelines.

[<img src="https://trmregistry.com/public/contributors?image=true">](https://docs.trmregistry.com/#/?id=contributors)
