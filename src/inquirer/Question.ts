export type Question = {
    type: 'confirm' | 'input' | 'list' | 'editor' | 'password' | 'select' | 'search',
    message: any,
    name: any,
    default?: any,
    validate?: any,
    choices?: any[],
    when?: any,
    pageSize?: number,
    expanded?: boolean,
    postfix?: string,
    filter?: boolean,
    required?: boolean,
    source?: (term: string | void) => Promise<any[]>
}