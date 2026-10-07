import { ValueHelp, ValueHelpDescriptor } from "../valueHelp";

/**
 * A column of a {@link QuestionUiTable}.
 */
export type QuestionUiColumn = {
    /**
     * key of the value in the row object
     */
    name: string,
    /**
     * column header, defaults to {@link QuestionUiColumn.name}
     */
    label?: string,
    /**
     * cell type, defaults to `string`
     *
     * `table` cells contain nested rows, described by {@link QuestionUiColumn.columns}
     */
    type?: 'string' | 'number' | 'boolean' | 'select' | 'table',
    /**
     * the cell must have a value (`table` cells: at least one row)
     */
    required?: boolean,
    placeholder?: string,
    /**
     * `string` only: maximum length
     */
    maxLength?: number,
    /**
     * `string` only: case conversion applied to the value
     */
    case?: 'upper' | 'lower',
    /**
     * `select` only: selectable values
     */
    options?: { name?: string, value: any }[],
    /**
     * `table` only: nested columns
     */
    columns?: QuestionUiColumn[],
    /**
     * `string` only: list of suggested values
     */
    valueHelp?: ValueHelp,
    /**
     * validation function, called for non empty values: return `true` if the value is valid, otherwise an error message
     */
    validate?: (value: any, row: Record<string, any>) => true | string | Promise<true | string>
};

/**
 * Table with addable rows: the answer is an array of row objects, keyed by {@link QuestionUiColumn.name}.
 */
export type QuestionUiTable = {
    kind: 'table',
    columns: QuestionUiColumn[],
    /**
     * initial rows
     */
    value?: Record<string, any>[],
    /**
     * label of the add row button
     */
    addLabel?: string
};

/**
 * List of tags: the answer is an array of strings.
 */
export type QuestionUiTags = {
    kind: 'tags',
    /**
     * initial tags
     */
    value?: string[],
    /**
     * case conversion applied to the tags
     */
    case?: 'upper' | 'lower'
};

/**
 * Markdown editor with preview: the answer is a string.
 */
export type QuestionUiMarkdown = {
    kind: 'markdown',
    /**
     * initial text
     */
    value?: string
};

/**
 * Widget a UI client renders in place of the question type.
 *
 * Only UI clients handle it (see {@link Inquirer.isUi}): questions with it must be asked only when the inquirer is a UI.
 * The answer is the structured value of the widget, not the value of the question type.
 */
export type QuestionUi = QuestionUiTable | QuestionUiTags | QuestionUiMarkdown;

/**
 * {@link QuestionUiColumn} without functions, sent to UI clients.
 */
export type QuestionUiColumnDescriptor = Omit<QuestionUiColumn, 'valueHelp' | 'validate' | 'columns'> & {
    valueHelp?: ValueHelpDescriptor,
    columns?: QuestionUiColumnDescriptor[]
};

/**
 * {@link QuestionUi} without functions, sent to UI clients.
 */
export type QuestionUiDescriptor = (Omit<QuestionUiTable, 'columns'> & { columns: QuestionUiColumnDescriptor[] }) | QuestionUiTags | QuestionUiMarkdown;

function toColumnDescriptor(column: QuestionUiColumn, register: (valueHelp: ValueHelp) => string): QuestionUiColumnDescriptor {
    const { valueHelp, validate, columns, ...descriptor } = column;
    const result: QuestionUiColumnDescriptor = { ...descriptor };
    if (valueHelp) {
        result.valueHelp = {
            id: register(valueHelp),
            key: valueHelp.key,
            columns: valueHelp.columns
        };
    }
    if (columns) {
        result.columns = columns.map(c => toColumnDescriptor(c, register));
    }
    return result;
}

/**
 * Removes the functions of a {@link QuestionUi}, so it can be sent to UI clients.
 * @param ui question ui
 * @param register stores a value help handler and returns its id
 */
export function toUiDescriptor(ui: QuestionUi, register: (valueHelp: ValueHelp) => string): QuestionUiDescriptor {
    if (ui.kind === 'table') {
        return {
            ...ui,
            columns: (ui.columns || []).map(c => toColumnDescriptor(c, register))
        };
    }
    return { ...ui };
}

function isEmpty(value: any): boolean {
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0);
}

function applyCase(value: string, sCase?: 'upper' | 'lower'): string {
    if (sCase === 'upper') {
        return value.toUpperCase();
    } else if (sCase === 'lower') {
        return value.toLowerCase();
    }
    return value;
}

function normalizeRows(columns: QuestionUiColumn[], rows: any): Record<string, any>[] {
    if (!Array.isArray(rows)) {
        return [];
    }
    const result: Record<string, any>[] = [];
    for (const row of rows) {
        if (!row || typeof row !== 'object') {
            continue;
        }
        const normalized: Record<string, any> = {};
        for (const column of columns) {
            var value = row[column.name];
            if (column.type === 'table') {
                value = normalizeRows(column.columns || [], value);
            } else if (typeof value === 'string') {
                value = applyCase(value.trim(), column.case);
            }
            if (!isEmpty(value)) {
                normalized[column.name] = value;
            }
        }
        if (Object.keys(normalized).length > 0) {
            result.push(normalized);
        }
    }
    return result;
}

/**
 * Normalizes the answer of a {@link QuestionUi}: trims strings, applies case conversions, removes empty cells and empty rows.
 * Markdown text is kept as is.
 * @param ui question ui
 * @param value answer
 */
export function normalizeUiValue(ui: QuestionUi, value: any): any {
    if (ui.kind === 'table') {
        return normalizeRows(ui.columns || [], value);
    }
    if (ui.kind === 'markdown') {
        return value === undefined || value === null ? '' : String(value);
    }
    const tags: string[] = [];
    (Array.isArray(value) ? value : []).forEach(tag => {
        if (tag === undefined || tag === null) {
            return;
        }
        const normalized = applyCase(String(tag).trim(), ui.case);
        if (normalized && !tags.includes(normalized)) {
            tags.push(normalized);
        }
    });
    return tags;
}

async function validateRows(columns: QuestionUiColumn[], rows: Record<string, any>[], path: string): Promise<true | string> {
    for (var i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowPath = `${path}Row ${i + 1}`;
        for (const column of columns) {
            const value = row[column.name];
            const label = column.label || column.name;
            if (column.required && isEmpty(value)) {
                return `${rowPath}, ${label}: value is required`;
            }
            if (!isEmpty(value)) {
                if (column.type === 'table') {
                    const nested = await validateRows(column.columns || [], value, `${rowPath}, ${label}, `);
                    if (nested !== true) {
                        return nested;
                    }
                } else if (column.maxLength && String(value).length > column.maxLength) {
                    return `${rowPath}, ${label}: maximum length is ${column.maxLength} characters`;
                }
                if (column.validate) {
                    const result = await column.validate(value, row);
                    if (result !== true) {
                        return `${rowPath}, ${label}: ${result || 'invalid value'}`;
                    }
                }
            }
        }
    }
    return true;
}

/**
 * Validates the answer of a {@link QuestionUi}, after {@link normalizeUiValue}.
 * @param ui question ui
 * @param value normalized answer
 * @returns `true` if the answer is valid, otherwise an error message
 */
export async function validateUiValue(ui: QuestionUi, value: any): Promise<true | string> {
    if (ui.kind === 'table') {
        if (!Array.isArray(value)) {
            return 'Invalid rows';
        }
        return validateRows(ui.columns || [], value, '');
    }
    if (ui.kind === 'markdown') {
        return typeof value === 'string' ? true : 'Invalid text';
    }
    if (!Array.isArray(value)) {
        return 'Invalid tags';
    }
    return true;
}
