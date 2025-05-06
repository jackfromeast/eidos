/// <reference types="react" resolution-mode="require"/>
/// <reference types="node" />
declare module "packages/lib/env" {
    export const logger: Console;
    export const EIDOS_VERSION = "0.19.0";
    export const isDevMode: boolean;
    export const isSelfHosted: boolean;
    export const isInkServiceMode: boolean;
    export const isDesktopMode: boolean;
    export const isStagingMode: boolean;
}
declare module "packages/lib/mime/mime" {
    /**
     * source: https://github.com/jshttp/mime-types/blob/master/index.js
     * refactored to typescript via copilot
     * js => ts
     * path => path-browserify
     */
    /*!
     * mime-types
     * Copyright(c) 2014 Jonathan Ong
     * Copyright(c) 2015 Douglas Christopher Wilson
     * MIT Licensed
     */
    /**
     * Get the default charset for a MIME type.
     *
     * @param {string} type
     * @return {boolean|string}
     */
    export const charset: (type: string) => boolean | string;
    /**
     * Create a full Content-Type header given a MIME type or extension.
     *
     * @param {string} str
     * @return {boolean|string}
     */
    export const contentType: (str: string) => boolean | string;
    /**
     * Get the default extension for a MIME type.
     *
     * @param {string} type
     * @return {boolean|string}
     */
    export const extension: (type: string) => boolean | string;
    /**
     * Lookup the MIME type for a file path/extension.
     *
     * @param {string} path
     * @return {boolean|string}
     */
    export const lookup: (path: string) => boolean | string;
    export const extensions: {
        [key: string]: string[];
    };
    export const types: {
        [key: string]: string;
    };
    export const getFileType: (url: string) => boolean | string | "image" | "audio" | "video";
    export const getFilePreviewImage: (url: string) => string;
}
declare module "packages/lib/storage/indexeddb" {
    import { StateStorage } from "zustand/middleware";
    export const indexedDBStorage: StateStorage;
    export const getConfig: <T = Record<string, any>>(name: string) => Promise<T>;
    export const DATABASE_NAME = "eidos";
    export function getIndexedDBValue<T = any>(tableName: string, key: string): Promise<T>;
}
declare module "packages/lib/storage/eidos-file-system" {
    export enum FileSystemType {
        OPFS = "opfs",
        NFS = "nfs"
    }
    export const getFsRootHandle: (fsType: FileSystemType) => Promise<FileSystemDirectoryHandle>;
    export const getExternalFolderHandle: (name: string) => Promise<FileSystemDirectoryHandle>;
    /**
     * get DirHandle for a given path list
     * we read config from indexeddb to decide which file system to use
     * there are two file systems:
     * 1. opfs: origin private file system. store files in web.
     * 2. nfs: Native File System. store files in local file system.
     * @param _paths path list just like ["root", "dir1", "dir2"]
     * @param rootDirHandle we can pass rootDirHandle to avoid reading from indexeddb
     * @returns
     */
    export const getDirHandle: (_paths: string[], rootDirHandle?: FileSystemDirectoryHandle) => Promise<FileSystemDirectoryHandle>;
    /**
     * eidos fs structure:
     * - spaces
     *  - space1
     *    - db.sqlite3
     *    - files
     *      - 1234567890.png
     *      - 0987654321.png
     *  - space2
     *    - db.sqlite3
     *
     * spaces
     * - what is a space? a space is a folder that contains a sqlite3 database, default name is db.sqlite3.
     * - one space is one database.
     *
     * files
     * - files is a folder that contains all static files, such as images, videos, etc.
     * - when user upload a file, it will be saved in this folder. hash will be used as file name. e.g. 1234567890.png
     */
    export class EidosFileSystemManager {
        rootDirHandle: FileSystemDirectoryHandle | undefined;
        constructor(rootDirHandle?: FileSystemDirectoryHandle);
        isSameEntry: (dirHandle: FileSystemDirectoryHandle) => Promise<boolean>;
        getDirHandle: (paths: string[]) => Promise<FileSystemDirectoryHandle>;
        walk: (_paths: string[]) => Promise<string[][]>;
        copyFile: (_paths: string[], targetFs: EidosFileSystemManager) => Promise<void>;
        copyTo: (targetFs: EidosFileSystemManager, options?: {
            ignoreSqlite?: boolean;
        }, cb?: (data: {
            current: number;
            total: number;
            msg: string;
        }) => void) => Promise<void>;
        getFileUrlByPath: (path: string, replaceSpace?: string) => string;
        getFileByURL: (url: string) => Promise<File>;
        getFileByPath: (path: string) => Promise<File>;
        listDir: (_paths: string[]) => Promise<FileSystemFileHandle[]>;
        updateOrCreateDocFile: (_paths: string[], content: string) => Promise<void>;
        checkFileExists: (_paths: string[]) => Promise<boolean>;
        getFile: (_paths: string[], options?: FileSystemGetFileOptions) => Promise<File>;
        getFileText: (_paths: string[]) => Promise<string>;
        getDocContent: (_paths: string[]) => Promise<string>;
        addDir: (_paths: string[], dirName: string) => Promise<void>;
        addFile: (_paths: string[], file: File, fileId?: string) => Promise<string[]>;
        deleteEntry: (_paths: string[], isDir?: boolean) => Promise<void>;
        renameFile: (_paths: string[], newName: string) => Promise<void>;
    }
    export const efsManager: EidosFileSystemManager;
    export const getExternalFolderManager: (name: string) => Promise<EidosFileSystemManager>;
}
declare module "packages/lib/storage/zip-file" {
    import JSZip from "jszip";
    export function zipDirectory(dirPaths: string[], zip?: JSZip): Promise<JSZip>;
    export const zipFile2Blob: (file: JSZip.JSZipObject) => Promise<File>;
    export function getPackageJsonFromZipFile(file: File): Promise<any>;
    export function unZipFileToDir(file: File, rootPaths: string[]): Promise<void>;
    export function importZipFileIntoDir(rootPaths: string[], zip: JSZip): Promise<void>;
}
declare module "packages/lib/storage/space" {
    /**
     * when expose spaceFileSystem  from electron preload,
     * the method only works when it's a arrow function, i don't know why, so we need to use class to wrap it
     */
    export class SpaceFileSystem {
        rootDirHandle?: FileSystemDirectoryHandle;
        constructor(rootDirHandle?: FileSystemDirectoryHandle);
        remove: (space: string) => Promise<void>;
        /**
         * import space from .zip file
         * @param space
         * @param file
         */
        import: (space: string, file: File) => Promise<void>;
        create: (space: string) => Promise<FileSystemDirectoryHandle>;
        export: (space: string) => Promise<void>;
        /**
         *
         * @returns list of spaces
         */
        list: () => Promise<any[]>;
        getSpaceInfo: (space: string) => Promise<{
            isSyncEnabled: boolean;
            graftId?: undefined;
        } | {
            isSyncEnabled: boolean;
            graftId: string;
        }>;
    }
}
declare module "packages/lib/const" {
    export enum MsgType {
        SetConfig = "SetConfig",
        CallFunction = "CallFunction",
        SwitchDatabase = "SwitchDatabase",
        CreateSpace = "CreateSpace",
        Syscall = "Syscall",
        Status = "Status",
        Pull = "Pull",
        Push = "Push",
        Reset = "Reset",
        Pages = "Pages",
        Error = "Error",
        QueryResp = "QueryResp",
        Notify = "Notify",
        BlockUIMsg = "BlockUIMsg",
        DataUpdateSignal = "DataUpdateSignal",
        WebSocketConnected = "WebSocketConnected",
        WebSocketDisconnected = "WebSocketDisconnected",
        ConvertMarkdown2State = "ConvertMarkdown2State",
        ConvertHtml2State = "ConvertHtml2State",
        ConvertEmail2State = "ConvertEmail2State",
        GetDocMarkdown = "GetDocMarkdown",
        HighlightRow = "HighlightRow"
    }
    export enum MainServiceWorkerMsgType {
        SetData = "SetData"
    }
    export enum EidosDataEventChannelMsgType {
        DataUpdateSignalType = "DataUpdateSignalType",
        MetaTableUpdateSignalType = "MetaTableUpdateSignalType"
    }
    export type EidosDataEventChannelMsg = {
        type: EidosDataEventChannelMsgType;
        payload: {
            type: DataUpdateSignalType;
            table: string;
            _new: Record<string, any> & {
                _id: string;
            };
            _old: Record<string, any> & {
                _id: string;
            };
        };
    };
    export enum DataUpdateSignalType {
        Update = "update",
        Insert = "insert",
        Delete = "delete",
        AddColumn = "addColumn",
        UpdateColumn = "updateColumn"
    }
    export const EidosDataEventChannelName = "eidos-data-event";
    export const EidosSharedEnvChannelName = "eidos-shared-env";
    export const EidosMessageChannelName = "eidos-message";
    export const EidosProtocolUrlChannelName = "eidos-protocol-url";
    export const DOMAINS: {
        HOME: string;
        IMAGE_PROXY: string;
        LINK_PREVIEW: string;
        WIKI: string;
        DOWNLOAD: string;
        ACTIVATION_SERVER: string;
        EXTENSION_SERVER: string;
        API_AGENT_SERVER: string;
        DISCORD_INVITE: string;
        GITHUB_ISSUES: string;
        GEOLOCATION_API: string;
        ACCOUNT_REGISTRATION: string;
    };
    export enum CustomEventType {
        UpdateColumn = "eidos-update-column"
    }
    export const EIDOS_SPACE_BASE_URL: string;
}
declare module "packages/lib/fields/const" {
    export enum FieldType {
        Number = "number",
        Text = "text",
        Title = "title",
        Checkbox = "checkbox",
        Date = "date",
        File = "file",
        MultiSelect = "multi-select",
        Rating = "rating",
        Select = "select",
        URL = "url",
        Formula = "formula",
        Link = "link",
        Lookup = "lookup",
        CreatedTime = "created-time",
        CreatedBy = "created-by",
        LastEditedTime = "last-edited-time",
        LastEditedBy = "last-edited-by"
    }
    export enum FieldValueType {
        String = "string",
        Number = "number",
        Boolean = "boolean"
    }
    export const FIELD_VALUE_TYPE_MAP: {
        title: {
            valueType: FieldValueType;
            example: string;
        };
        text: {
            valueType: FieldValueType;
            example: string;
        };
        number: {
            valueType: FieldValueType;
            example: number;
        };
        checkbox: {
            valueType: FieldValueType;
            example: boolean;
        };
        date: {
            valueType: FieldValueType;
            example: string;
        };
        file: {
            valueType: FieldValueType;
            example: string;
        };
        "multi-select": {
            valueType: FieldValueType;
            example: string;
        };
        rating: {
            valueType: FieldValueType;
            example: number;
        };
        select: {
            valueType: FieldValueType;
            example: string;
        };
        url: {
            valueType: FieldValueType;
            example: string;
        };
        formula: {
            valueType: FieldValueType;
            example: string;
        };
        link: {
            valueType: FieldValueType;
            example: string;
        };
        lookup: {
            valueType: FieldValueType;
            example: string;
        };
        "created-time": {
            valueType: FieldValueType;
            example: string;
        };
        "created-by": {
            valueType: FieldValueType;
            example: string;
        };
        "last-edited-time": {
            valueType: FieldValueType;
            example: string;
        };
        "last-edited-by": {
            valueType: FieldValueType;
            example: string;
        };
    };
    export enum GridCellKind {
        Uri = "uri",
        Text = "text",
        Image = "image",
        RowID = "row-id",
        Number = "number",
        Bubble = "bubble",
        Boolean = "boolean",
        Loading = "loading",
        Markdown = "markdown",
        Drilldown = "drilldown",
        Protected = "protected",
        Custom = "custom"
    }
    export enum CompareOperator {
        IsEmpty = "IsEmpty",
        IsNotEmpty = "IsNotEmpty",
        Equal = "=",
        NotEqual = "!=",
        Contains = "Contains",
        NotContains = "NotContains",
        StartsWith = "StartsWith",
        EndsWith = "EndsWith",
        GreaterThan = ">",
        GreaterThanOrEqual = ">=",
        LessThan = "<",
        LessThanOrEqual = "<="
    }
    export enum BinaryOperator {
        And = "AND",
        Or = "OR"
    }
    export const NUMBER_BASED_COMPARE_OPERATORS: CompareOperator[];
    export const TEXT_BASED_COMPARE_OPERATORS: CompareOperator[];
    export function applyMixins(derivedCtor: any, constructors: any[]): void;
}
declare module "packages/lib/sqlite/const" {
    /**
     * define constance what we will use in sqlite
     */
    export const TreeTableName = "eidos__tree";
    export const ColumnTableName = "eidos__columns";
    export const TodoTableName = "eidos__todo";
    export const FileTableName = "eidos__files";
    export const DocTableName = "eidos__docs";
    export const ActionTableName = "eidos__actions";
    export const ScriptTableName = "eidos__scripts";
    export const ViewTableName = "eidos__views";
    export const EmbeddingTableName = "eidos__embeddings";
    export const ReferenceTableName = "eidos__references";
    export const ChatTableName = "eidos__chats";
    export const MessageTableName = "eidos__messages";
    export const QueueTableName = "eidos__queue";
}
declare module "packages/lib/store/ITreeNode" {
    export interface ITreeNode {
        id: string;
        name: string;
        type: "table" | "doc" | "folder" | string;
        position?: number;
        parent_id?: string;
        is_pinned?: boolean;
        is_full_width?: boolean;
        is_locked?: boolean;
        is_deleted?: boolean;
        hide_properties?: boolean;
        icon?: string;
        cover?: string;
        created_at?: string;
        updated_at?: string;
    }
}
declare module "components/table/view-filter-editor/interface" {
    import { BinaryOperator, CompareOperator } from "packages/lib/fields/const";
    export interface IFilterValue {
        operator: CompareOperator;
        operands: [
            field: string,
            value: string | number | boolean | Date | null | undefined
        ];
    }
    export interface IGroupFilterValue {
        operator: BinaryOperator;
        operands: (IFilterValue | IGroupFilterValue)[];
    }
    export type FilterValueType = IFilterValue | IGroupFilterValue;
}
declare module "packages/lib/store/IView" {
    import { FilterValueType } from "components/table/view-filter-editor/interface";
    export enum ViewTypeEnum {
        Grid = "grid",
        Gallery = "gallery",
        DocList = "doc_list",
        Kanban = "kanban"
    }
    export interface IView<T = any> {
        id: string;
        name: string;
        type: ViewTypeEnum;
        table_id: string;
        query: string;
        fieldIds?: string[];
        properties?: T;
        filter?: FilterValueType;
        order_map?: Record<string, number>;
        hidden_fields?: string[];
        position?: number;
    }
    export interface IGridViewProperties {
        fieldWidthMap: Record<string, number>;
        freezeColumns?: number;
    }
}
declare module "packages/lib/store/interface" {
    import { FieldType } from "packages/lib/fields/const";
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    import { IView } from "packages/lib/store/IView";
    export type IField<T = any> = {
        name: string;
        type: FieldType;
        table_column_name: string;
        table_name: string;
        property: T;
        created_at?: string;
        updated_at?: string;
    };
    export interface ITable {
        rowMap: {
            [rowId: string]: Record<string, any>;
        };
        fieldMap: {
            [fieldId: string]: IField;
        };
        viewMap: {
            [viewId: string]: IView;
        };
        viewIds: string[];
    }
    export interface IDataStore {
        tableMap: {
            [nodeId: string]: ITable;
        };
        nodeIds: string[];
        nodeMap: {
            [nodeId: string]: ITreeNode;
        };
    }
}
declare module "packages/lib/sqlite/helper" {
    export const getTransformedQuery: (query: string) => string;
    export function isReadOnlySql(sql: string): boolean;
    /**
     *
     * example 1:
     *
     * const id = 42
     * const fieldName = "id"
     * buildSql`select ${Symbol(fieldName)} from table where id = ${id}` => { sql: "select id from table where id = ?", bind: [42]}
     *
     * example 2:
     * const table = "books"
     * buildSql`select * from ${Symbol(table)}` => { sql: "select * from books", bind: []}
     *
     * buildSql only return sql and bind, no execute.we need to escape table name, column name, etc.
     *
     * in example 1, we can use ? placeholder to avoid sql injection
     * in example 2, we need to escape table name, column name, etc.
     *
     * if variable is a Symbol, we don't escape it.
     * @param strings
     * @param values
     * @returns
     */
    export function buildSql(strings: TemplateStringsArray, ...values: any[]): {
        sql: string;
        bind: any[];
    };
    export const checkSqlIsModifyTableSchema: (sql: string) => boolean;
    export const checkSqlIsOnlyQuery: (sql: string) => boolean;
    export const checkSqlIsModifyTableData: (sql: string) => boolean;
    export function isAggregated(sql: string): boolean;
    export const aggregateSql2columns: (sql: string, originFields: string[]) => any;
    export const getSqlQueryColumns: (sql: string, originSchema: any) => any;
    export const queryData2JSON: (sqlResult: any[][], fields: string[]) => any[];
    export const stringify: (obj: any) => any;
}
declare module "packages/lib/utils" {
    import { type ClassValue } from "clsx";
    import type { Message } from 'ai';
    export { uuidv7 } from "uuidv7";
    export function cn(...inputs: ClassValue[]): string;
    export function sanitizeUIMessages(messages: Array<Message>): Array<Message>;
    export function getMessageIdFromAnnotations(message: Message): any;
    export const isUuidv4: (id: string) => boolean;
    export function nonNullable<T>(value: T): value is NonNullable<T>;
    export const hashText: (text: string) => number;
    export const checkIsInWorker: () => boolean;
    /**
     * pathname = /space1/5c5bf8539ee9434aa721560c89f34ed6
     * databaseName = space1
     * tableId = 5c5bf8539ee9434aa721560c89f34ed6
     * tableName = user custom name
     * rawTableName = tb_5c5bf8539ee9434aa721560c89f34ed6 (real table name in sqlite)
     * @param id
     * @returns
     */
    export const getRawTableNameById: (id: string) => string;
    export const getTableIdByRawTableName: (rawTableName: string) => string;
    export const getColumnIndexName: (tableName: string, columnName: string) => string;
    export const generateColumnName: () => string;
    export const getRawDocNameById: (id: string) => string;
    export const shortenId: (id: string) => string;
    export const extractIdFromShortId: (shortId: string) => string;
    export const getDate: (offset: number, baseDate?: Date | string) => string;
    export const getToday: () => string;
    export const getYesterday: () => string;
    export const getTomorrow: () => string;
    /**
     *
     * @param str yyyy-w[week]
     */
    export const isWeekNodeId: (str?: string) => boolean;
    /**
     * get week of the year
     * @param day  yyyy-mm-dd || yyyy-w[week]
     * @returns
     */
    export const getWeek: (day: string) => number;
    /**
     *
     * @param weekNodeId yyyy-w[week]
     * @returns
     */
    export const getDaysByYearWeek: (weekNodeId: string) => any[];
    export const getLocalDate: (date: Date) => string;
    export const getUuid: () => string;
    export const generateId: () => string;
    export const isDayPageId: (id: string | undefined) => boolean;
    /**
     * Returns a string representing the time elapsed since the given date.
     * @param date - The date to calculate the time elapsed from.
     * @returns A string representing the time elapsed in a human-readable format.
     */
    export function timeAgo(date: Date): string;
    export const proxyURL: (url?: string) => string;
    export const getBlockUrl: (blockId: string, props?: Record<string, any>) => string;
    export const getBlockIdFromUrl: (url: string) => string;
    export const getBlockUrlWithParams: (id: string, params: Record<string, any>) => string;
    export const isStandaloneBlocksPath: (pathname: string) => boolean;
    export const isFilesPath: (pathname: string) => boolean;
    export const fetcher: (url: string) => Promise<any>;
}
declare module "packages/lib/sqlite/sql-formula-parser" {
    import { IField } from "packages/lib/store/interface";
    export const getTableNameFromSql: (sql: string) => string;
    /**
     * example:
     * sql: select * from table1
     * fields: [{name: "id", type: "number"}, {name: "name", type: "string"}]
     * return: select id, name from table1
     *
     * example2:
     * sql: select id,name from table1
     * fields: [{name: "id", type: "number","table_column_name": "cl_xxx1"}, {name: "name", type: "string"},"table_column_name": "cl_xxx2"]
     * return: select cl_xxx1 as id, cl_xxx2 as name from table1
     * @param sql
     * @param fields
     */
    export const transformQuery: (sql: string, fields: IField[]) => string;
    export const transformFormula2VirtualGeneratedField: (columnName: string, fields: IField[]) => string;
    export const transformQueryWithFormulaFields2Sql: (query: string, fields: IField[]) => string;
    /**
     * Detects circular dependencies among generated columns
     * @param fields List of fields to check for circular dependencies
     * @returns Object with result and cycle information if found
     */
    export const detectCircularDependencies: (fields: IField[]) => {
        hasCycle: boolean;
        cycle: string[];
        dependencyGraph: Record<string, string[]>;
    };
    /**
     * Finds all formula fields that depend on a given column
     * @param columnName The column name to check dependencies for
     * @param fields List of all fields
     * @returns Array of dependent field names
     */
    export const findDependentFormulaFields: (columnName: string, fields: IField[]) => {
        columnName: string;
        fieldName: string;
    }[];
    /**
     * Gets the order in which formula fields should be deleted to respect dependencies
     * @param columnNames Array of column names to delete
     * @param fields List of all fields
     * @returns Ordered array of column names for deletion
     */
    export const getFormulaFieldDeletionOrder: (columnNames: string[], fields: IField[]) => string[];
}
declare module "packages/lib/sqlite/interface" {
    import { MsgType } from "packages/lib/const";
    export type IQuery = {
        type: MsgType.CallFunction;
        data: {
            method: string;
            params: [string, string[]];
            dbName: string;
            userId: string;
        };
        id: string;
    };
    export type IQueryResp = {
        id: string;
        data: {
            result: any;
        };
        type: MsgType.QueryResp;
    };
    export type ITreeItem = {
        id: string;
        name: string;
        type: "table" | "doc";
    };
    export interface ISqlite<T, D> {
        connector: T;
        send: (data: D) => void | Promise<any>;
        onCallBack: (thisCallId: string) => Promise<any>;
    }
    export abstract class BaseServerDatabase {
        filename?: string;
        get isWalMode(): boolean;
        pages(): Promise<{
            [key: string]: any;
        }>;
        status(): Promise<{
            [key: string]: any;
        }>;
        pull(): Promise<{
            [key: string]: any;
        }>;
        push(): Promise<{
            [key: string]: any;
        }>;
        reset(): Promise<{
            [key: string]: any;
        }>;
        abstract prepare(sql: string): {
            run: (bind?: any[]) => void;
        };
        abstract close(): void;
        abstract selectObjects(sql: string, bind?: any[]): Promise<{
            [columnName: string]: any;
        }[]>;
        abstract transaction(func: (db: BaseServerDatabase) => void): any;
        abstract exec(opts: string | {
            sql: string;
            bind?: any[];
            rowMode?: "array" | "object";
            returnValue?: "resultRows" | "saveSql";
        }): Promise<any>;
        abstract createFunction(opt: {
            name: string;
            xFunc: (...args: any[]) => any;
        }): any;
    }
}
declare module "packages/lib/sqlite/sql-merge-table-with-new-columns" {
    /**
     * sqlite has some limitations on alter table, for example, we can't add a column with non-constant default value.
     * when we want to add new columns to a table
     * 1. we need to create a new table with new columns
     * 2. copy data from old table to new table
     * 3. then drop old table
     * 4. rename new table to old table name.
     * @param createTableSql
     * @param newColumnSql
     */
    export function generateMergeTableWithNewColumnsSql(createTableSql: string, newColumnSql: string): {
        newTmpTableSql: string;
        sql: string;
    };
}
declare module "packages/worker/web-worker/sdk/index-manager" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    import { TableManager } from "packages/worker/web-worker/sdk/table";
    export class IndexManager {
        private table;
        dataSpace: DataSpace;
        tableManager: TableManager;
        constructor(table: TableManager);
        createIndex(column: string, onStart?: () => void, onEnd?: () => void): Promise<void>;
    }
}
declare module "packages/lib/fields/base" {
    import { IField } from "packages/lib/store/interface";
    import { CompareOperator, FieldType } from "packages/lib/fields/const";
    interface IBaseField<CD, P, R, RC, FC> {
        /**
         * column from eidos__columns table, guild how to render this field
         */
        column: IField<P>;
        context: FC | undefined;
        get entityFieldInstance(): BaseField<any, any, any, any, any> | null;
        /**
         * define the compare operators for this field, will be used in the filter
         */
        compareOperators: string[];
        /**
         * for render cell, for grid view
         * @param rawData raw data stored in the database
         * @param context some field need context to render, like user field need user map. we only store the user id in the database
         */
        getCellContent(rawData: any, context?: RC): CD;
        /**
         * we store the raw data in the database, but we need to transform the raw data into json for other usage which make it more readable
         * eg: API, SDK, Script etc
         * {
         *  title: "this is title",
         *  cl_xxx: "field1 value",
         *  cl_yyy: "field2 value",
         * } => {
         *  title: "this is title",
         *  field1: "field1 value",
         *  field2: "field2 value",
         * }
         * @param rawData data stored in the database, most of the time, it's a string
         */
        rawData2JSON(rawData: R): any;
        /**
         * transform the cell data into raw data, which can be stored in the database
         * @param cell cell data, which is the return value of getCellContent
         */
        cellData2RawData(cell: CD): any;
    }
    export abstract class BaseField<CD, P, R = string, RC = any, FC = any> implements IBaseField<CD, P, R, RC, FC> {
        static type: FieldType;
        /**
         * each table column has a corresponding ui column, which stored in the `${ColumnTableName}` table
         * we use the ui column to store the column's display name, type, and other ui related information
         * different field will have different property
         */
        column: IField<P>;
        context: FC | undefined;
        constructor(column: IField<P>, context?: FC);
        get entityFieldInstance(): BaseField<any, any, any, any, any> | null;
        get displayType(): FieldType;
        get isTransformable(): boolean;
        abstract get compareOperators(): CompareOperator[];
        /**
         * getCellContent will be called when the cell is rendered
         * transform the raw data into the cell content for rendering
         * @param rawData this is the raw data stored in the database
         */
        abstract getCellContent(rawData: any, context?: RC): CD;
        abstract rawData2JSON(rawData: R): any;
        abstract cellData2RawData(cell: CD): {
            rawData: any;
            shouldUpdateFieldProperty?: boolean;
        };
        /**
         * every field should have a property, when you create a new field, you should implement this method
         * @returns
         */
        static getDefaultFieldProperty(): {};
        text2RawData(text: string | number | string[] | Date): string | number | boolean | null;
    }
}
declare module "packages/lib/fields/checkbox" {
    import type { BooleanCell } from "@glideapps/glide-data-grid";
    import { BaseField } from "packages/lib/fields/base";
    import { CompareOperator, FieldType } from "packages/lib/fields/const";
    type CheckboxProperty = {};
    type CheckboxCell = BooleanCell;
    export class CheckboxField extends BaseField<CheckboxCell, CheckboxProperty, number> {
        static type: FieldType;
        get compareOperators(): CompareOperator[];
        rawData2JSON(rawData: number): number;
        getCellContent(rawData: number | undefined): CheckboxCell;
        text2RawData(value: string | number): true;
        cellData2RawData(cell: CheckboxCell): {
            rawData: number;
        };
    }
}
declare module "components/table/views/grid/cells/user-profile-cell" {
    import { type CustomCell, type CustomRenderer } from "@glideapps/glide-data-grid";
    export interface UserProfileCellProps {
        readonly kind: "user-profile-cell";
        readonly image: string;
        readonly initial: string;
        readonly tint: string;
        readonly name?: string;
    }
    export type UserProfileCell = CustomCell<UserProfileCellProps>;
    const renderer: CustomRenderer<UserProfileCell>;
    export default renderer;
}
declare module "packages/lib/fields/created-by" {
    import type { UserProfileCell } from "components/table/views/grid/cells/user-profile-cell";
    import { BaseField } from "packages/lib/fields/base";
    import { CompareOperator, FieldType } from "packages/lib/fields/const";
    type CreatedByProperty = {};
    export type UserFieldContext = {
        userMap?: {
            [id: string]: {
                name: string;
                avatar?: string;
            };
        };
    };
    export class CreatedByField extends BaseField<UserProfileCell, CreatedByProperty, string, UserFieldContext> {
        static type: FieldType;
        rawData2JSON(rawData: string): string;
        get compareOperators(): CompareOperator[];
        getCellContent(rawData: string | undefined, context?: UserFieldContext): UserProfileCell;
        cellData2RawData(cell: UserProfileCell): {
            rawData: import("@/components/table/views/grid/cells/user-profile-cell").UserProfileCellProps;
        };
    }
}
declare module "packages/lib/fields/created-time" {
    import { TextCell } from "@glideapps/glide-data-grid";
    import { BaseField } from "packages/lib/fields/base";
    import { CompareOperator, FieldType } from "packages/lib/fields/const";
    type DateProperty = {};
    export class CreatedTimeField extends BaseField<TextCell, DateProperty, string> {
        static type: FieldType;
        rawData2JSON(rawData: string): string;
        get compareOperators(): CompareOperator[];
        getCellContent(rawData: string | undefined): TextCell;
        cellData2RawData(cell: TextCell): {
            rawData: string;
        };
    }
}
declare module "components/ui/button" {
    import * as React from "react";
    import { type VariantProps } from "class-variance-authority";
    const buttonVariants: (props?: {
        variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost";
        size?: "default" | "sm" | "xs" | "lg" | "icon";
    } & import("class-variance-authority/dist/types").ClassProp) => string;
    export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
        asChild?: boolean;
    }
    const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
    export { Button, buttonVariants };
}
declare module "components/ui/calendar" {
    import * as React from "react";
    import { DayPicker } from "react-day-picker";
    export type CalendarProps = React.ComponentProps<typeof DayPicker>;
    function Calendar({ className, classNames, showOutsideDays, ...props }: CalendarProps): import("react/jsx-runtime").JSX.Element;
    namespace Calendar {
        var displayName: string;
    }
    export { Calendar };
}
declare module "components/table/views/grid/cells/date-picker-cell" {
    import { CustomCell, CustomRenderer } from "@glideapps/glide-data-grid";
    interface DatePickerCellProps {
        readonly kind: "date-picker-cell";
        readonly date: Date | undefined;
        readonly displayDate: string;
        readonly format: "date" | "datetime-local";
    }
    export type DatePickerCell = CustomCell<DatePickerCellProps>;
    const renderer: CustomRenderer<DatePickerCell>;
    export default renderer;
}
declare module "packages/lib/fields/date" {
    import type { DatePickerCell } from "components/table/views/grid/cells/date-picker-cell";
    import { BaseField } from "packages/lib/fields/base";
    import { CompareOperator, FieldType } from "packages/lib/fields/const";
    type DateProperty = {};
    type DateCell = DatePickerCell;
    export class DateField extends BaseField<DateCell, DateProperty, string> {
        static type: FieldType;
        rawData2JSON(rawData: string): string;
        get compareOperators(): CompareOperator[];
        getCellContent(rawData: string | undefined): DateCell;
        cellData2RawData(cell: DateCell): {
            rawData: string;
        };
    }
}
declare module "components/ui/popover" {
    import * as React from "react";
    import * as PopoverPrimitive from "@radix-ui/react-popover";
    const Popover: React.FC<PopoverPrimitive.PopoverProps>;
    const PopoverTrigger: React.ForwardRefExoticComponent<PopoverPrimitive.PopoverTriggerProps & React.RefAttributes<HTMLButtonElement>>;
    const PopoverAnchor: React.ForwardRefExoticComponent<PopoverPrimitive.PopoverAnchorProps & React.RefAttributes<HTMLDivElement>>;
    const PopoverContent: React.ForwardRefExoticComponent<Omit<PopoverPrimitive.PopoverContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & {
        container?: HTMLElement;
    } & React.RefAttributes<HTMLDivElement>>;
    export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
}
declare module "components/ui/separator" {
    import * as React from "react";
    import * as SeparatorPrimitive from "@radix-ui/react-separator";
    const Separator: React.ForwardRefExoticComponent<Omit<SeparatorPrimitive.SeparatorProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    export { Separator };
}
declare module "packages/worker/web-worker/meta-table/base" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    export interface MetaTable<T> {
        add(data: T): Promise<T>;
        get(id: string): Promise<T | null>;
        set(id: string, data: Partial<T>): Promise<boolean>;
        del(id: string): Promise<boolean>;
    }
    export interface BaseTable<T> extends MetaTable<T> {
        name: string;
        createTableSql: string;
        JSONFields?: string[];
    }
    export class BaseTableImpl<T = any> {
        protected dataSpace: DataSpace;
        name: string;
        JSONFields: string[];
        constructor(dataSpace: DataSpace);
        initTable(createTableSql: string): void;
        toJson: (data: T) => T;
        del(id: string, db?: import("@/lib/sqlite/interface").BaseServerDatabase): Promise<boolean>;
        delBy(data: Partial<T>, db?: import("@/lib/sqlite/interface").BaseServerDatabase): Promise<boolean>;
        get(id: string): Promise<T | null>;
        transformData: (data: Partial<T>) => {
            kv: any[][];
            updateKPlaceholder: string;
            insertKPlaceholder: string;
            insertVPlaceholder: string;
            deleteKPlaceholder: string;
            values: any[];
        };
        add(data: Partial<T>, db?: import("@/lib/sqlite/interface").BaseServerDatabase): Promise<T>;
        set(id: string, data: Partial<T>): Promise<boolean>;
        list(query?: Partial<T>, opts?: {
            limit?: number;
            offset?: number;
            orderBy?: string;
            order?: "ASC" | "DESC";
            fields?: string[];
        }): Promise<T[]>;
    }
}
declare module "packages/worker/web-worker/meta-table/file" {
    import { FileSystemType } from "packages/lib/storage/eidos-file-system";
    import { BaseTable, BaseTableImpl } from "packages/worker/web-worker/meta-table/base";
    export interface IFile {
        id: string;
        name: string;
        path: string;
        size: number;
        mime: string;
        created_at?: string;
        is_vectorized?: boolean;
    }
    export class FileTable extends BaseTableImpl implements BaseTable<IFile> {
        name: string;
        createTableSql: string;
        /**
         * save file to efs
         * @param url a url of file
         * @param subDir sub directory of file, default is [], which means save file to spaces/\<space\>/files/, if subDir is ["a","b"], then save file to spaces/\<space\>/files/a/b/
         * @param _name file name, default is null, which means use the file name in url
         * @returns
         */
        saveFile2EFS(url: string, subDir: string[], _name?: string): Promise<IFile | null>;
        add(data: IFile): Promise<IFile>;
        getFileByPath(path: string): Promise<IFile | null>;
        deleteFileByPathPrefix(prefix: string): Promise<boolean>;
        updateVectorized(id: string, is_vectorized: boolean): Promise<boolean>;
        get(id: string): Promise<IFile | null>;
        del(id: string): Promise<boolean>;
        /**
         * get blob url of file
         * in script or extension environment we can't access opfs file directly, so we need to use blob url to access it.
         * @param id file id
         * @returns
         */
        getBlobURL(id: string): Promise<string | null>;
        getBlobURLbyPath(path: string): Promise<string | null>;
        getBlobByPath(path: string): Promise<Blob>;
        walk(): Promise<any[]>;
        transformFileSystem(sourceFs: FileSystemType, targetFs: FileSystemType): Promise<void>;
        uploadDir(dirHandle: FileSystemDirectoryHandle, total: number, current: number, _parentPath?: string[]): Promise<void>;
        /**
         * Upload a file to EFS with specified parent path
         * @param fileData File data as ArrayBuffer or base64 string
         * @param fileName Original file name
         * @param mimeType File mime type
         * @param parentPath Parent path array, defaults to ["spaces", <space>, "files"]
         * @returns Uploaded file info
         */
        upload(fileData: ArrayBuffer | string, // ArrayBuffer or base64 string
        fileName: string, mimeType: string, parentPath?: string[]): Promise<IFile & {
            publicUrl: string;
        }>;
    }
}
declare module "packages/lib/store/runtime-store" {
    /**
     * state store for runtime, for cross component communication
     */
    import { IFile } from "packages/worker/web-worker/meta-table/file";
    interface AppRuntimeState {
        isCmdkOpen: boolean;
        setCmdkOpen: (isCmdkOpen: boolean) => void;
        isKeyboardShortcutsOpen: boolean;
        setKeyboardShortcutsOpen: (isKeyboardShortcutsOpen: boolean) => void;
        isShareMode: boolean;
        setShareMode: (isShareMode: boolean) => void;
        isEmbeddingModeLoaded: boolean;
        setEmbeddingModeLoaded: (isEmbeddingModeLoaded: boolean) => void;
        currentPreviewFile: IFile | null;
        setCurrentPreviewFile: (currentPreviewFile: IFile) => void;
        isWebsocketConnected: boolean;
        setWebsocketConnected: (isWebsocketConnected: boolean) => void;
        disableDocAIComplete: boolean;
        setDisableDocAIComplete: (disableDocAIComplete: boolean) => void;
        isCompleteLoading: boolean;
        setCompleteLoading: (isCompleteLoading: boolean) => void;
        scriptContainerRef: React.RefObject<any> | null;
        setScriptContainerRef: (scriptContainerRef: React.RefObject<any>) => void;
        blockUIMsg: string | null;
        blockUIData?: Record<string, any>;
        setBlockUIMsg: (blockUIMsg: string | null) => void;
        setBlockUIData: (blockUIData: Record<string, any>) => void;
        runningCommand: string | null;
        setRunningCommand: (runningCommand: string | null) => void;
    }
    export const useAppRuntimeStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AppRuntimeState>>;
}
declare module "components/doc/blocks/interface" {
    import { Transformer } from "@lexical/markdown";
    import { LexicalCommand } from "lexical";
    import { FunctionComponent } from "react";
    export interface DocBlock {
        name: string;
        icon: string;
        node: any;
        plugin: FunctionComponent;
        onSelect: (editor: any) => void;
        keywords: string[];
        transform?: Transformer;
        command: {
            create: LexicalCommand<any>;
        };
        createNode: (args: any) => any;
        markdownLanguage?: string;
        hiddenInMenu?: boolean;
    }
}
declare module "components/ui/dropdown-menu" {
    import * as React from "react";
    import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
    const DropdownMenu: React.FC<DropdownMenuPrimitive.DropdownMenuProps>;
    const DropdownMenuTrigger: React.ForwardRefExoticComponent<DropdownMenuPrimitive.DropdownMenuTriggerProps & React.RefAttributes<HTMLButtonElement>>;
    const DropdownMenuGroup: React.ForwardRefExoticComponent<DropdownMenuPrimitive.DropdownMenuGroupProps & React.RefAttributes<HTMLDivElement>>;
    const DropdownMenuPortal: React.FC<DropdownMenuPrimitive.DropdownMenuPortalProps>;
    const DropdownMenuSub: React.FC<DropdownMenuPrimitive.DropdownMenuSubProps>;
    const DropdownMenuRadioGroup: React.ForwardRefExoticComponent<DropdownMenuPrimitive.DropdownMenuRadioGroupProps & React.RefAttributes<HTMLDivElement>>;
    const DropdownMenuSubTrigger: React.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuSubTriggerProps & React.RefAttributes<HTMLDivElement>, "ref"> & {
        inset?: boolean;
    } & React.RefAttributes<HTMLDivElement>>;
    const DropdownMenuSubContent: React.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuSubContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const DropdownMenuContent: React.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & {
        container?: HTMLElement;
    } & React.RefAttributes<HTMLDivElement>>;
    const DropdownMenuItem: React.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & {
        inset?: boolean;
    } & React.RefAttributes<HTMLDivElement>>;
    const DropdownMenuCheckboxItem: React.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuCheckboxItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const DropdownMenuRadioItem: React.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuRadioItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const DropdownMenuLabel: React.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuLabelProps & React.RefAttributes<HTMLDivElement>, "ref"> & {
        inset?: boolean;
    } & React.RefAttributes<HTMLDivElement>>;
    const DropdownMenuSeparator: React.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuSeparatorProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const DropdownMenuShortcut: {
        ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup, };
}
declare module "components/ui/textarea" {
    import * as React from "react";
    const Textarea: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, "ref"> & React.RefAttributes<HTMLTextAreaElement>>;
    export { Textarea };
}
declare module "components/ui/toast" {
    import * as React from "react";
    import * as ToastPrimitives from "@radix-ui/react-toast";
    import { type VariantProps } from "class-variance-authority";
    const ToastProvider: React.FC<ToastPrimitives.ToastProviderProps>;
    const ToastViewport: React.ForwardRefExoticComponent<Omit<ToastPrimitives.ToastViewportProps & React.RefAttributes<HTMLOListElement>, "ref"> & React.RefAttributes<HTMLOListElement>>;
    const Toast: React.ForwardRefExoticComponent<Omit<ToastPrimitives.ToastProps & React.RefAttributes<HTMLLIElement>, "ref"> & VariantProps<(props?: {
        variant?: "default" | "destructive";
    } & import("class-variance-authority/dist/types").ClassProp) => string> & React.RefAttributes<HTMLLIElement>>;
    const ToastAction: React.ForwardRefExoticComponent<Omit<ToastPrimitives.ToastActionProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
    const ToastClose: React.ForwardRefExoticComponent<Omit<ToastPrimitives.ToastCloseProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
    const ToastTitle: React.ForwardRefExoticComponent<Omit<ToastPrimitives.ToastTitleProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const ToastDescription: React.ForwardRefExoticComponent<Omit<ToastPrimitives.ToastDescriptionProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
    type ToastActionElement = React.ReactElement<typeof ToastAction>;
    export { type ToastProps, type ToastActionElement, ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction, };
}
declare module "components/ui/use-toast" {
    import * as React from "react";
    import type { ToastActionElement, ToastProps } from "components/ui/toast";
    type ToasterToast = ToastProps & {
        id: string;
        title?: React.ReactNode;
        description?: React.ReactNode;
        action?: ToastActionElement;
    };
    const actionTypes: {
        readonly ADD_TOAST: "ADD_TOAST";
        readonly UPDATE_TOAST: "UPDATE_TOAST";
        readonly DISMISS_TOAST: "DISMISS_TOAST";
        readonly REMOVE_TOAST: "REMOVE_TOAST";
    };
    type ActionType = typeof actionTypes;
    type Action = {
        type: ActionType["ADD_TOAST"];
        toast: ToasterToast;
    } | {
        type: ActionType["UPDATE_TOAST"];
        toast: Partial<ToasterToast>;
    } | {
        type: ActionType["DISMISS_TOAST"];
        toastId?: ToasterToast["id"];
    } | {
        type: ActionType["REMOVE_TOAST"];
        toastId?: ToasterToast["id"];
    };
    interface State {
        toasts: ToasterToast[];
    }
    export const reducer: (state: State, action: Action) => State;
    type Toast = Omit<ToasterToast, "id">;
    function toast({ ...props }: Toast): {
        id: string;
        dismiss: () => void;
        update: (props: ToasterToast) => void;
    };
    function useToast(): {
        toast: typeof toast;
        dismiss: (toastId?: string) => void;
        toasts: ToasterToast[];
    };
    export { useToast, toast };
}
declare module "components/doc/blocks/mermaid/MermaidRenderer" {
    interface MermaidRendererProps {
        text: string;
    }
    const MermaidRenderer: React.FC<MermaidRendererProps>;
    export default MermaidRenderer;
}
declare module "components/doc/blocks/mermaid/component" {
    import { NodeKey } from "lexical";
    export interface MermaidProps {
        text: string;
        nodeKey: NodeKey;
    }
    export const Mermaid: React.FC<MermaidProps>;
}
declare module "components/doc/blocks/mermaid/node" {
    import { MultilineElementTransformer } from "@lexical/markdown";
    import { DecoratorBlockNode, SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
    import { EditorConfig, ElementFormatType, LexicalEditor, LexicalNode, NodeKey, Spread } from "lexical";
    export type SerializedMermaidNode = Spread<{
        text: string;
    }, SerializedDecoratorBlockNode>;
    export class MermaidNode extends DecoratorBlockNode {
        __text: string;
        static getType(): string;
        static clone(node: MermaidNode): MermaidNode;
        constructor(text: string, format?: ElementFormatType, key?: NodeKey);
        setText(text: string): void;
        createDOM(): HTMLElement;
        updateDOM(): false;
        exportJSON(): SerializedMermaidNode;
        static importJSON(serializedNode: SerializedMermaidNode): MermaidNode;
        decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element;
        getTextContent(): string;
    }
    export function $createMermaidNode(text: string): MermaidNode;
    export function $isMermaidNode(node: LexicalNode | null | undefined): node is MermaidNode;
    export const MERMAID_NODE_TRANSFORMER: MultilineElementTransformer;
}
declare module "components/doc/utils/getSelectedNode" {
    import { ElementNode, RangeSelection, TextNode, LexicalNode } from "lexical";
    export function findFirstBlockElement(node: LexicalNode): ElementNode | null;
    export function getSelectedNode(selection: RangeSelection): TextNode | ElementNode;
}
declare module "components/doc/blocks/helper" {
    import { DecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
    export const $insertDecoratorBlockNode: (node: DecoratorBlockNode) => void;
}
declare module "components/doc/blocks/mermaid/plugin" {
    import { LexicalCommand } from "lexical";
    export const INSERT_MERMAID_COMMAND: LexicalCommand<string>;
    export function MermaidPlugin(): JSX.Element | null;
}
declare module "components/doc/blocks/mermaid/index" {
    import { DocBlock } from "components/doc/blocks/interface";
    const _default: DocBlock;
    export default _default;
}
declare module "components/loading" {
    export const Loading: () => import("react/jsx-runtime").JSX.Element;
    export const TwinkleSparkle: () => import("react/jsx-runtime").JSX.Element;
    interface AnimationSettings {
        drawDuration: number;
        delayBetweenPaths: number;
        fillDuration: number;
    }
    export function SVGAnimator({ svgContent, width, height, settings, }: {
        svgContent: string;
        width?: number;
        height?: number;
        settings?: AnimationSettings;
    }): import("react/jsx-runtime").JSX.Element;
    export const LogoLoading: ({ width, height, }: {
        width?: number;
        height?: number;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/video/component" {
    import { NodeKey } from "lexical";
    export const VideoComponent: (props: {
        url: string;
        nodeKey: NodeKey;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/video/node" {
    import { DecoratorBlockNode, SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
    import { EditorConfig, ElementFormatType, LexicalEditor, LexicalNode, NodeKey, Spread } from "lexical";
    export type SerializedVideoNode = Spread<{
        src: string;
    }, SerializedDecoratorBlockNode>;
    export class VideoNode extends DecoratorBlockNode {
        __src: string;
        static getType(): string;
        static clone(node: VideoNode): VideoNode;
        constructor(src: string, format?: ElementFormatType, key?: NodeKey);
        setSrc(src: string): void;
        createDOM(): HTMLElement;
        updateDOM(): false;
        static importJSON(data: SerializedVideoNode): VideoNode;
        exportJSON(): SerializedVideoNode;
        decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element;
        getTextContent(): string;
    }
    export function $createVideoNode(src: string): VideoNode;
    export function $isVideoNode(node: LexicalNode | null | undefined): node is VideoNode;
}
declare module "components/doc/blocks/video/plugin" {
    import { LexicalCommand } from "lexical";
    export const INSERT_VIDEO_FILE_COMMAND: LexicalCommand<string>;
    export const VideoPlugin: () => any;
}
declare module "components/doc/blocks/video/index" {
    import { DocBlock } from "components/doc/blocks/interface";
    const _default_1: DocBlock;
    export default _default_1;
}
declare module "components/doc/blocks/audio/component" {
    import { NodeKey } from "lexical";
    export const AudioComponent: (props: {
        url: string;
        nodeKey: NodeKey;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/audio/node" {
    import { DecoratorBlockNode, SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
    import { EditorConfig, ElementFormatType, LexicalEditor, LexicalNode, NodeKey, Spread } from "lexical";
    export type SerializedAudioNode = Spread<{
        src: string;
    }, SerializedDecoratorBlockNode>;
    export class AudioNode extends DecoratorBlockNode {
        __src: string;
        static getType(): string;
        static clone(node: AudioNode): AudioNode;
        constructor(src: string, format?: ElementFormatType, key?: NodeKey);
        setSrc(src: string): void;
        createDOM(): HTMLElement;
        updateDOM(): false;
        static importJSON(data: SerializedAudioNode): AudioNode;
        exportJSON(): SerializedAudioNode;
        decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element;
        getTextContent(): string;
    }
    export function $createAudioNode(src: string): AudioNode;
    export function $isAudioNode(node: LexicalNode | null | undefined): node is AudioNode;
}
declare module "components/doc/blocks/audio/plugin" {
    import { LexicalCommand } from "lexical";
    export const INSERT_AUDIO_FILE_COMMAND: LexicalCommand<string>;
    export const AudioPlugin: () => any;
}
declare module "components/doc/blocks/audio/index" {
    import { DocBlock } from "components/doc/blocks/interface";
    const _default_2: DocBlock;
    export default _default_2;
}
declare module "components/doc/blocks/file/component" {
    import { NodeKey } from "lexical";
    export const FileComponent: ({ url, fileName, nodeKey, }: {
        url: string;
        fileName: string;
        nodeKey: NodeKey;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/file/node" {
    import { DecoratorBlockNode, SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
    import { EditorConfig, ElementFormatType, LexicalEditor, LexicalNode, NodeKey, Spread } from "lexical";
    export type SerializedFileNode = Spread<{
        src: string;
        fileName: string;
    }, SerializedDecoratorBlockNode>;
    export class FileNode extends DecoratorBlockNode {
        __src: string;
        __fileName: string;
        static getType(): string;
        static clone(node: FileNode): FileNode;
        constructor(src: string, fileName: string, format?: ElementFormatType, key?: NodeKey);
        setSrc(src: string): void;
        setFileName(fileName: string): void;
        createDOM(): HTMLElement;
        updateDOM(): false;
        static importJSON(data: SerializedFileNode): FileNode;
        exportJSON(): SerializedFileNode;
        decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element;
        getTextContent(): string;
    }
    export function $createFileNode(data: {
        src: string;
        fileName: string;
    }): FileNode;
    export function $isFileNode(node: LexicalNode | null | undefined): node is FileNode;
}
declare module "components/doc/blocks/file/plugin" {
    import { LexicalCommand } from "lexical";
    export const INSERT_FILE_COMMAND: LexicalCommand<{
        src: string;
        fileName: string;
    }>;
    export const FilePlugin: () => any;
}
declare module "components/doc/blocks/file/index" {
    import { DocBlock } from "components/doc/blocks/interface";
    const _default_3: DocBlock;
    export default _default_3;
}
declare module "components/ui/tooltip" {
    import * as React from "react";
    import * as TooltipPrimitive from "@radix-ui/react-tooltip";
    const TooltipProvider: React.FC<TooltipPrimitive.TooltipProviderProps>;
    const Tooltip: React.FC<TooltipPrimitive.TooltipProps>;
    const TooltipTrigger: React.ForwardRefExoticComponent<TooltipPrimitive.TooltipTriggerProps & React.RefAttributes<HTMLButtonElement>>;
    const TooltipContent: React.ForwardRefExoticComponent<Omit<TooltipPrimitive.TooltipContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
}
declare module "packages/worker/web-worker/meta-table/script" {
    import { JsonSchema7ObjectType } from "zod-to-json-schema";
    import { BaseTable, BaseTableImpl } from "packages/worker/web-worker/meta-table/base";
    export type ScriptStatus = "all" | "enabled" | "disabled";
    export interface ICommand {
        name: string;
        description: string;
        inputJSONSchema?: JsonSchema7ObjectType;
        outputJSONSchema?: JsonSchema7ObjectType;
        asTableAction?: boolean;
    }
    export interface IPromptConfig {
        model?: string;
        actions?: string[];
    }
    export interface IScript {
        id: string;
        name: string;
        type: "script" | "udf" | "prompt" | "block" | "app" | "m_block" | "doc_plugin" | "py_script";
        description: string;
        version: string;
        code: string;
        marketplace_id?: string;
        ts_code?: string;
        enabled?: boolean;
        model?: string;
        prompt_config?: IPromptConfig;
        commands: ICommand[];
        tables?: {
            name: string;
            fields: {
                name: string;
                type: string;
            }[];
        }[];
        envs?: {
            name: string;
            type: string;
            readonly?: boolean;
        }[];
        env_map?: {
            [key: string]: string;
        };
        fields_map?: {
            [tableName: string]: {
                id: string;
                name: string;
                fieldsMap: {
                    [fieldName: string]: string;
                };
            };
        };
        bindings?: Record<string, {
            type: 'table';
            value: string;
        }>;
        dependencies?: string[];
    }
    export class ScriptTable extends BaseTableImpl<IScript> implements BaseTable<IScript> {
        name: string;
        createTableSql: string;
        JSONFields: string[];
        del(id: string): Promise<boolean>;
        enable(id: string): Promise<boolean>;
        disable(id: string): Promise<boolean>;
        updateEnvMap(id: string, env_map: {
            [key: string]: string;
        }): Promise<boolean>;
    }
}
declare module "hooks/use-mblock" {
    import { IScript } from "packages/worker/web-worker/meta-table/script";
    export const useMblock: (id?: string) => IScript;
}
declare module "components/ui/index" {
    export const uiComponentsConfig: {
        "use-toast": string;
        accordion: string;
        alert: string;
        "alert-dialog": string;
        aspect: string;
        avatar: string;
        badge: string;
        breadcrumb: string;
        button: string;
        calendar: string;
        card: string;
        carousel: string;
        chart: string;
        checkbox: string;
        collapsible: string;
        command: string;
        "context-menu": string;
        dialog: string;
        drawer: string;
        "dropdown-menu": string;
        form: string;
        "hover-card": string;
        input: string;
        "input-otp": string;
        label: string;
        menubar: string;
        "navigation-menu": string;
        pagination: string;
        popover: string;
        progress: string;
        "radio-group": string;
        resizable: string;
        "scroll-area": string;
        select: string;
        separator: string;
        sheet: string;
        sidebar: string;
        skeleton: string;
        slider: string;
        sonner: string;
        switch: string;
        table: string;
        tabs: string;
        textarea: string;
        toast: string;
        toaster: string;
        toggle: string;
        "toggle-group": string;
        tooltip: string;
    };
}
declare module "packages/lib/v3/cache" {
    function generateCacheKey(code: string): string;
    function hasCache(key: string): boolean;
    function getCache(key: string): any;
    function setCache(key: string, compiledCode: any): void;
    function clearExpiredCache(): void;
    export { generateCacheKey, hasCache, getCache, setCache, clearExpiredCache };
}
declare module "packages/lib/v3/esbuild" {
    export const initializeCompiler: () => Promise<void>;
    export const transform: (input: string | Uint8Array, options?: import("esbuild-wasm").SameShape<import("esbuild-wasm").TransformOptions, import("esbuild-wasm").TransformOptions>) => Promise<import("esbuild-wasm").TransformResult<import("esbuild-wasm").TransformOptions>>;
}
declare module "packages/lib/v3/compiler" {
    interface CompileOptions {
        uiLibCode?: string;
    }
    interface CompileResult {
        code: string;
        error: string | null;
    }
    export const compileCode: (sourceCode: string, options?: CompileOptions) => Promise<CompileResult>;
    export function getImportsFromCode(code: string): any[];
    export function generateImportMap(thirdPartyLibs: string[], uiLibs: string[]): Promise<{
        importMap: string;
        cleanup: () => void;
    }>;
    export function getAllLibs(code: string, processedComponents?: Set<string>): {
        thirdPartyLibs: any[];
        uiLibs: any[];
    };
}
declare module "packages/lib/python/worker" {
    export const getPythonWorker: () => Worker;
}
declare module "components/script-container/helper" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    export type IScriptInput = Record<string, any>;
    export interface IScriptContext {
        tables: any;
        env: Record<string, any>;
        currentNodeId?: string | null;
        currentRowId?: string | null;
        currentViewId?: string | null;
        currentViewQuery?: string | null;
        callFromTableAction?: boolean;
    }
    export const makeSdkInjectScript: ({ bindings, space, }: {
        bindings?: Record<string, {
            type: "table";
            value: string;
        }>;
        space: string;
    }) => string;
    export interface IPythonScriptCallProps {
        input: Record<string, any>;
        context: {
            tables: any;
            env: Record<string, any>;
            currentNodeId?: string | null;
            currentRowId?: string | null;
            currentViewId?: string | null;
            currentViewQuery?: string | null;
            callFromTableAction?: boolean;
        };
        code: string;
        command: string;
        id: string;
        bindings?: Record<string, any>;
        dependencies?: string[];
    }
    export const callJavaScript: (props: {
        input: IScriptInput;
        context: IScriptContext;
        code: string;
        command: string;
        id: string;
        bindings?: Record<string, any>;
    }, scriptContainerRef: any) => Promise<any>;
    export const callPythonScript: (props: IPythonScriptCallProps) => Promise<any>;
    export const callScriptById: (id: string, input: Record<string, any>, sqlite: DataSpace, scriptContainerRef: any) => Promise<any>;
}
declare module "components/block-renderer/tailwind-config" {
    import type { Config } from "tailwindcss";
    export const twConfig: Partial<Config>;
}
declare module "components/block-renderer/block-renderer" {
    import React from "react";
    export interface BlockRendererRef {
        getHeight: () => number;
    }
    interface BlockRendererProps {
        code: string;
        compiledCode: string;
        env?: Record<string, string>;
        bindings?: Record<string, {
            type: "table";
            value: string;
        }>;
        width?: string | number;
        height?: string | number;
        defaultProps?: Record<string, any>;
    }
    export const BlockRenderer: React.ForwardRefExoticComponent<BlockRendererProps & React.RefAttributes<BlockRendererRef>>;
}
declare module "components/block-renderer/block-app" {
    import { type BlockRendererRef } from "components/block-renderer/block-renderer";
    export const BlockApp: import("react").ForwardRefExoticComponent<{
        url: string;
        height?: number;
    } & import("react").RefAttributes<BlockRendererRef>>;
}
declare module "apps/web-app/[database]/scripts/hooks/use-all-mblocks" {
    import { IScript } from "packages/worker/web-worker/meta-table/script";
    interface MblocksState {
        mblocks: IScript[];
        setMblocks: (mblocks: IScript[]) => void;
    }
    export const useMblocksStore: import("zustand").UseBoundStore<import("zustand").StoreApi<MblocksState>>;
    export const useAllMblocks: () => {
        mblocks: IScript[];
        reload: () => void;
    };
}
declare module "components/doc/hooks/editor-instance-context" {
    import { ReactNode } from "react";
    import { IScript } from "packages/worker/web-worker/meta-table/script";
    interface EditorInstanceContextType {
        mblocks: IScript[];
        isSelecting: boolean;
        setIsSelecting: (value: boolean) => void;
        selectedKeys: Set<string>;
        setSelectedKeys: (keys: Set<string>) => void;
        docId: string | null;
    }
    export function EditorInstanceProvider({ children, docId, }: {
        children: ReactNode;
        docId: string | null;
    }): import("react/jsx-runtime").JSX.Element;
    export const useEditorInstance: () => EditorInstanceContextType;
}
declare module "components/doc/blocks/custom/hooks/use-resizable" {
    import React from "react";
    import { LexicalEditor, NodeKey } from "lexical";
    export function useResizable({ initialHeight, nodeKey, editor, isSelecting, }: {
        initialHeight: number;
        nodeKey: NodeKey;
        editor: LexicalEditor;
        isSelecting: boolean;
    }): {
        height: number;
        handleMouseDown: (e: React.MouseEvent) => void;
        setHeight: React.Dispatch<React.SetStateAction<number>>;
    };
}
declare module "components/doc/blocks/custom/component" {
    import { NodeKey } from "lexical";
    export const CustomBlockComponent: (props: {
        url: string;
        nodeKey: NodeKey;
        height?: number;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/custom/node" {
    import { DecoratorBlockNode, SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
    import { EditorConfig, ElementFormatType, LexicalEditor, LexicalNode, NodeKey, Spread } from "lexical";
    export type SerializedCustomBlockNode = Spread<{
        url: string;
        height?: number;
    }, SerializedDecoratorBlockNode>;
    export class CustomBlockNode extends DecoratorBlockNode {
        __url: string;
        __height?: number;
        static getType(): string;
        static clone(node: CustomBlockNode): CustomBlockNode;
        constructor(url: string, height?: number, format?: ElementFormatType, key?: NodeKey);
        setUrl(url: string): void;
        setHeight(height?: number): void;
        createDOM(): HTMLElement;
        updateDOM(): false;
        static importJSON(data: SerializedCustomBlockNode): CustomBlockNode;
        exportJSON(): {
            url: string;
            height: number;
            type: string;
            version: number;
            $?: Record<string, unknown>;
            format: ElementFormatType;
        };
        decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element;
        getTextContent(): string;
    }
    export function $createCustomBlockNode(url: string, height?: number): CustomBlockNode;
    export function $isCustomBlockNode(node: LexicalNode | null | undefined): node is CustomBlockNode;
}
declare module "components/doc/blocks/custom/plugin" {
    import { LexicalCommand } from "lexical";
    export const INSERT_CUSTOM_BLOCK_COMMAND: LexicalCommand<string>;
    export const CustomBlockPlugin: () => any;
}
declare module "components/doc/blocks/custom/index" {
    import { DocBlock } from "components/doc/blocks/interface";
    const _default_4: DocBlock;
    export default _default_4;
}
declare module "components/doc/utils/url" {
    export function sanitizeUrl(url: string): string;
    export function validateUrl(url: string): boolean;
}
declare module "components/doc/blocks/youtube/component" {
    import { ElementFormatType, NodeKey } from "lexical";
    type YouTubeComponentProps = Readonly<{
        className: Readonly<{
            base: string;
            focus: string;
        }>;
        format: ElementFormatType | null;
        nodeKey: NodeKey;
        videoID: string;
    }>;
    export function YouTubeComponent({ className, format, nodeKey, videoID, }: YouTubeComponentProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/youtube/node" {
    import { DecoratorBlockNode, SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
    import type { DOMConversionMap, DOMExportOutput, EditorConfig, ElementFormatType, LexicalEditor, LexicalNode, NodeKey, Spread } from "lexical";
    export type SerializedYouTubeNode = Spread<{
        videoID: string;
    }, SerializedDecoratorBlockNode>;
    export class YouTubeNode extends DecoratorBlockNode {
        __id: string;
        static getType(): string;
        static clone(node: YouTubeNode): YouTubeNode;
        static importJSON(serializedNode: SerializedYouTubeNode): YouTubeNode;
        exportJSON(): SerializedYouTubeNode;
        constructor(id: string, format?: ElementFormatType, key?: NodeKey);
        exportDOM(): DOMExportOutput;
        static importDOM(): DOMConversionMap | null;
        updateDOM(): false;
        getId(): string;
        getTextContent(): string;
        decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element;
    }
    export function $createYouTubeNode(videoID: string): YouTubeNode;
    export function $isYouTubeNode(node: YouTubeNode | LexicalNode | null | undefined): node is YouTubeNode;
}
declare module "components/doc/blocks/youtube/plugin" {
    import { LexicalCommand } from "lexical";
    export const INSERT_YOUTUBE_COMMAND: LexicalCommand<{
        videoId: string;
    }>;
    export const YouTubePlugin: () => any;
}
declare module "components/ui/input" {
    import * as React from "react";
    const Input: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "ref"> & React.RefAttributes<HTMLInputElement>>;
    export { Input };
}
declare module "components/doc/blocks/bookmark/component" {
    import { NodeKey } from "lexical";
    import { BookmarkPayload } from "components/doc/blocks/bookmark/node";
    import "./style.css";
    export const BookmarkComponent: (props: BookmarkPayload & {
        nodeKey: NodeKey;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/bookmark/node" {
    import { TextMatchTransformer } from "@lexical/markdown";
    import { DecoratorBlockNode, SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
    import { EditorConfig, ElementFormatType, LexicalEditor, LexicalNode, NodeKey, Spread } from "lexical";
    export type BookmarkPayload = {
        url: string;
        title?: string;
        description?: string;
        image?: string;
        fetched?: boolean;
    };
    export type SerializedBookmarkNode = Spread<BookmarkPayload, SerializedDecoratorBlockNode>;
    export class BookmarkNode extends DecoratorBlockNode {
        __url: string;
        __title?: string;
        __description?: string;
        __image?: string;
        __fetched?: boolean;
        isKeyboardSelectable(): boolean;
        static getType(): string;
        static clone(node: BookmarkNode): BookmarkNode;
        getTextContent(): string;
        constructor(payload: BookmarkPayload, format?: ElementFormatType, key?: NodeKey);
        getFetched(): boolean;
        getUrl(): string;
        createDOM(): HTMLElement;
        updateDOM(): false;
        decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element;
        static importJSON(data: SerializedBookmarkNode): BookmarkNode;
        setAll(payload: BookmarkPayload): void;
        exportJSON(): SerializedBookmarkNode;
    }
    export function $createBookmarkNode(payload: BookmarkPayload): BookmarkNode;
    export function $isBookmarkNode(node: LexicalNode | null | undefined): node is BookmarkNode;
    export function $getUrlMetaData(url: string): Promise<BookmarkPayload & {
        error?: string;
    }>;
    export const BOOKMARK_NODE_TRANSFORMER: TextMatchTransformer;
}
declare module "components/doc/blocks/bookmark/plugin" {
    import { LexicalCommand } from "lexical";
    import { BookmarkPayload } from "components/doc/blocks/bookmark/node";
    export type InsertBookmarkPayload = Readonly<BookmarkPayload>;
    export const INSERT_BOOKMARK_COMMAND: LexicalCommand<InsertBookmarkPayload>;
    export function BookmarkPlugin({ captionsEnabled, }: {
        captionsEnabled?: boolean;
    }): JSX.Element | null;
}
declare module "components/doc/blocks/bookmark/index" {
    import { DocBlock } from "components/doc/blocks/interface";
    const _default_5: DocBlock;
    export default _default_5;
}
declare module "components/doc/blocks/image/LazyImage" {
    import { type LexicalEditor, type NodeKey } from "lexical";
    export function useSuspenseImage(src: string): void;
    export const getDisplayURL: (url: string) => string;
    export function LazyImage({ altText, className, imageRef, src, width, height, maxWidth, nodeKey, editor, isResizing, setIsResizing, showCaption, caption, }: {
        altText: string;
        className: string | null;
        height: "inherit" | number;
        imageRef: {
            current: null | HTMLImageElement;
        };
        maxWidth: number;
        src: string;
        width: "inherit" | number;
        nodeKey: NodeKey;
        editor: LexicalEditor;
        isResizing: boolean;
        setIsResizing: (value: boolean) => void;
        showCaption: boolean;
        caption: LexicalEditor;
    }): JSX.Element;
}
declare module "components/doc/blocks/image/component" {
    import { type LexicalEditor, type NodeKey } from "lexical";
    import "./style.css";
    export default function ImageComponent({ src, altText, nodeKey, width, height, maxWidth, resizable, showCaption, caption, captionsEnabled, }: {
        altText: string;
        caption: LexicalEditor;
        height: "inherit" | number;
        maxWidth: number;
        nodeKey: NodeKey;
        resizable: boolean;
        showCaption: boolean;
        src: string;
        width: "inherit" | number;
        captionsEnabled: boolean;
    }): JSX.Element;
}
declare module "components/doc/blocks/image/node" {
    import { TextMatchTransformer } from "@lexical/markdown";
    import { DecoratorBlockNode, SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
    import { ElementFormatType, type DOMConversionMap, type DOMExportOutput, type EditorConfig, type LexicalEditor, type LexicalNode, type NodeKey, type SerializedEditor, type Spread } from "lexical";
    export interface ImagePayload {
        altText: string;
        caption?: LexicalEditor;
        height?: number;
        key?: NodeKey;
        maxWidth?: number;
        showCaption?: boolean;
        src: string;
        width?: number;
        captionsEnabled?: boolean;
    }
    export type SerializedImageNode = Spread<{
        altText: string;
        caption: SerializedEditor;
        height?: number;
        maxWidth: number;
        showCaption: boolean;
        src: string;
        width?: number;
    }, SerializedDecoratorBlockNode>;
    export class ImageNode extends DecoratorBlockNode {
        __src: string;
        __altText: string;
        __width: "inherit" | number;
        __height: "inherit" | number;
        __maxWidth: number;
        __showCaption: boolean;
        __caption: LexicalEditor;
        __captionsEnabled: boolean;
        static getType(): string;
        static clone(node: ImageNode): ImageNode;
        static importJSON(serializedNode: SerializedImageNode): ImageNode;
        exportDOM(): DOMExportOutput;
        static importDOM(): DOMConversionMap | null;
        constructor(src: string, altText: string, maxWidth: number, width?: "inherit" | number, height?: "inherit" | number, showCaption?: boolean, caption?: LexicalEditor, captionsEnabled?: boolean, format?: ElementFormatType, key?: NodeKey);
        exportJSON(): SerializedImageNode;
        setWidthAndHeight(width: "inherit" | number, height: "inherit" | number): void;
        setSrc(src: string): void;
        setShowCaption(showCaption: boolean): void;
        createDOM(): HTMLElement;
        updateDOM(): false;
        getSrc(): string;
        getAltText(): string;
        decorate(editor: LexicalEditor, config: EditorConfig): JSX.Element;
    }
    export function $createImageNode({ altText, height, maxWidth, captionsEnabled, src, width, showCaption, caption, format, key, }: ImagePayload & {
        format?: ElementFormatType;
    }): ImageNode;
    export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode;
    export const IMAGE_NODE_TRANSFORMER: TextMatchTransformer;
}
declare module "components/doc/utils/dom" {
    export const CAN_USE_DOM: boolean;
}
declare module "components/doc/blocks/image/plugin" {
    import { LexicalCommand } from "lexical";
    import { ImagePayload } from "components/doc/blocks/image/node";
    export type InsertImagePayload = Readonly<ImagePayload>;
    export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload>;
    export default function ImagesPlugin({ captionsEnabled, }: {
        captionsEnabled?: boolean;
    }): JSX.Element | null;
    global {
        interface DragEvent {
            rangeOffset?: number;
            rangeParent?: Node;
        }
    }
}
declare module "components/doc/blocks/image/index" {
    import { DocBlock } from "components/doc/blocks/interface";
    const _default_6: DocBlock;
    export default _default_6;
}
declare module "components/doc/blocks/youtube/index" {
    import { DocBlock } from "components/doc/blocks/interface";
    const _default_7: DocBlock;
    export default _default_7;
}
declare module "components/chart/config-form/types" {
    export type DataSourceType = "raw" | "table" | "script";
    export type DataRawConfig = {
        type: "raw";
    };
    export type DataTableConfig = {
        type: "table";
        tableId: string;
        viewId?: string;
        transforms?: any[];
        selectedFields?: string[];
    };
    export type DataScriptConfig = {
        type: "script";
        scriptId: string;
    };
    export type DataSourceConfig = DataRawConfig | DataTableConfig | DataScriptConfig;
    export interface DataTransform {
        type: "filter" | "sort" | "aggregate";
        config: {
            filterColumn?: string;
            filterValue?: string;
            sortColumn?: string;
            sortDirection?: "asc" | "desc";
            aggregateColumn?: string;
            aggregateFunction?: "sum" | "avg" | "count";
            groupByColumn?: string;
        };
    }
}
declare module "components/ui/chart" {
    import * as React from "react";
    import * as RechartsPrimitive from "recharts";
    const THEMES: {
        readonly light: "";
        readonly dark: ".dark";
    };
    export type ChartConfig = {
        [k in string]: {
            label?: React.ReactNode;
            icon?: React.ComponentType;
        } & ({
            color?: string;
            theme?: never;
        } | {
            color?: never;
            theme: Record<keyof typeof THEMES, string>;
        });
    };
    const ChartContainer: React.ForwardRefExoticComponent<Omit<React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement> & {
        config: ChartConfig;
        children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
    }, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const ChartStyle: ({ id, config }: {
        id: string;
        config: ChartConfig;
    }) => import("react/jsx-runtime").JSX.Element;
    const ChartTooltip: typeof RechartsPrimitive.Tooltip;
    const ChartTooltipContent: React.ForwardRefExoticComponent<Omit<RechartsPrimitive.DefaultTooltipContentProps<import("recharts/types/component/DefaultTooltipContent").ValueType, import("recharts/types/component/DefaultTooltipContent").NameType> & {
        accessibilityLayer?: boolean;
        active?: boolean;
        includeHidden?: boolean;
        allowEscapeViewBox?: import("recharts/types/util/types").AllowInDimension;
        animationDuration?: number;
        animationEasing?: import("recharts/types/util/types").AnimationTiming;
        content?: import("recharts/types/component/Tooltip").ContentType<import("recharts/types/component/DefaultTooltipContent").ValueType, import("recharts/types/component/DefaultTooltipContent").NameType>;
        coordinate?: Partial<import("recharts/types/util/types").Coordinate>;
        cursor?: boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.SVGProps<SVGElement>;
        filterNull?: boolean;
        defaultIndex?: number;
        isAnimationActive?: boolean;
        offset?: number;
        payloadUniqBy?: import("recharts/types/util/payload/getUniqPayload").UniqueOption<import("recharts/types/component/DefaultTooltipContent").Payload<import("recharts/types/component/DefaultTooltipContent").ValueType, import("recharts/types/component/DefaultTooltipContent").NameType>>;
        position?: Partial<import("recharts/types/util/types").Coordinate>;
        reverseDirection?: import("recharts/types/util/types").AllowInDimension;
        shared?: boolean;
        trigger?: "click" | "hover";
        useTranslate3d?: boolean;
        viewBox?: import("recharts/types/util/types").CartesianViewBox;
        wrapperStyle?: React.CSSProperties;
    } & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement> & {
        hideLabel?: boolean;
        hideIndicator?: boolean;
        indicator?: "line" | "dot" | "dashed";
        nameKey?: string;
        labelKey?: string;
    }, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const ChartLegend: typeof RechartsPrimitive.Legend;
    const ChartLegendContent: React.ForwardRefExoticComponent<Omit<React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement> & Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
        hideIcon?: boolean;
        nameKey?: string;
    }, "ref"> & React.RefAttributes<HTMLDivElement>>;
    export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle, };
}
declare module "components/chart/constants" {
    export const PRESET_COLORS: {
        readonly brown: {
            readonly fill: "#937264";
            readonly stroke: "#7C5F53";
        };
        readonly orange: {
            readonly fill: "#D97847";
            readonly stroke: "#C2622F";
        };
        readonly yellow: {
            readonly fill: "#DFAB01";
            readonly stroke: "#B58E00";
        };
        readonly green: {
            readonly fill: "#68A47C";
            readonly stroke: "#528A64";
        };
        readonly blue: {
            readonly fill: "#5B8DB8";
            readonly stroke: "#4B749A";
        };
        readonly purple: {
            readonly fill: "#9A6DD7";
            readonly stroke: "#8154C5";
        };
        readonly pink: {
            readonly fill: "#E255A1";
            readonly stroke: "#D13B8B";
        };
        readonly red: {
            readonly fill: "#E45C3A";
            readonly stroke: "#CC4628";
        };
    };
    export type PresetColor = keyof typeof PRESET_COLORS;
    export const PRESET_FILL_COLORS: ("#937264" | "#D97847" | "#DFAB01" | "#68A47C" | "#5B8DB8" | "#9A6DD7" | "#E255A1" | "#E45C3A")[];
    export const PRESET_STROKE_COLORS: ("#7C5F53" | "#C2622F" | "#B58E00" | "#528A64" | "#4B749A" | "#8154C5" | "#D13B8B" | "#CC4628")[];
}
declare module "components/chart/index" {
    export type ChartType = "line" | "bar" | "area" | "pie" | "scatter" | "radar" | "composed" | "treemap" | "radialBar" | "funnel" | "sankey";
    interface StyleConfig {
        stroke?: string;
        fill?: string;
        strokeWidth?: number;
        opacity?: number;
    }
    interface AxisConfig {
        dataKey?: string;
        label?: string;
        type?: "number" | "category";
        domain?: [number | string, number | string];
        tickFormatter?: (value: any) => string;
        style?: StyleConfig;
    }
    export interface SeriesConfig {
        type: "line" | "bar" | "area" | "scatter" | "radar" | "pie" | string;
        dataKey: string;
        name?: string;
        style?: StyleConfig;
        stack?: boolean;
        smooth?: boolean;
    }
    interface ThemeConfig {
        [key: string]: {
            label: string;
            color: string;
        };
    }
    export interface ChartConfig {
        type: ChartType;
        data: any[];
        width?: number | string;
        height?: number | string;
        series: SeriesConfig[];
        xAxis?: AxisConfig;
        yAxis?: AxisConfig;
        showGrid?: boolean;
        showTooltip?: boolean;
        showLegend?: boolean;
        style?: StyleConfig;
        themeConfig?: ThemeConfig;
    }
    export function Chart(props: ChartConfig): import("react/jsx-runtime").JSX.Element;
}
declare module "components/ui/dialog" {
    import * as React from "react";
    import * as DialogPrimitive from "@radix-ui/react-dialog";
    const Dialog: React.FC<DialogPrimitive.DialogProps>;
    const DialogTrigger: React.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & React.RefAttributes<HTMLButtonElement>>;
    const DialogPortal: React.FC<DialogPrimitive.DialogPortalProps>;
    const DialogClose: React.ForwardRefExoticComponent<DialogPrimitive.DialogCloseProps & React.RefAttributes<HTMLButtonElement>>;
    const DialogOverlay: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogOverlayProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const DialogContent: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & {
        container?: HTMLElement;
    } & React.RefAttributes<HTMLDivElement>>;
    const DialogHeader: {
        ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    const DialogFooter: {
        ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    const DialogTitle: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogTitleProps & React.RefAttributes<HTMLHeadingElement>, "ref"> & React.RefAttributes<HTMLHeadingElement>>;
    const DialogDescription: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>, "ref"> & React.RefAttributes<HTMLParagraphElement>>;
    export { Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, };
}
declare module "components/ui/label" {
    import * as React from "react";
    import * as LabelPrimitive from "@radix-ui/react-label";
    import { type VariantProps } from "class-variance-authority";
    const Label: React.ForwardRefExoticComponent<Omit<LabelPrimitive.LabelProps & React.RefAttributes<HTMLLabelElement>, "ref"> & VariantProps<(props?: import("class-variance-authority/dist/types").ClassProp) => string> & React.RefAttributes<HTMLLabelElement>>;
    export { Label };
}
declare module "components/ui/form" {
    import * as React from "react";
    import * as LabelPrimitive from "@radix-ui/react-label";
    import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
    const Form: <TFieldValues extends FieldValues, TContext = any, TTransformedValues extends FieldValues = undefined>(props: import("react-hook-form").FormProviderProps<TFieldValues, TContext, TTransformedValues>) => React.JSX.Element;
    const FormField: <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ ...props }: ControllerProps<TFieldValues, TName>) => import("react/jsx-runtime").JSX.Element;
    const useFormField: () => {
        invalid: boolean;
        isDirty: boolean;
        isTouched: boolean;
        error?: import("react-hook-form").FieldError;
        id: string;
        name: string;
        formItemId: string;
        formDescriptionId: string;
        formMessageId: string;
    };
    const FormItem: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
    const FormLabel: React.ForwardRefExoticComponent<Omit<LabelPrimitive.LabelProps & React.RefAttributes<HTMLLabelElement>, "ref"> & React.RefAttributes<HTMLLabelElement>>;
    const FormControl: React.ForwardRefExoticComponent<Omit<import("@radix-ui/react-slot").SlotProps & React.RefAttributes<HTMLElement>, "ref"> & React.RefAttributes<HTMLElement>>;
    const FormDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
    const FormMessage: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
    export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField, };
}
declare module "components/ui/resizable" {
    import * as ResizablePrimitive from "react-resizable-panels";
    const ResizablePanelGroup: ({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => import("react/jsx-runtime").JSX.Element;
    const ResizablePanel: import("react").ForwardRefExoticComponent<Omit<import("react").HTMLAttributes<import("react").ElementType>, "id" | "onResize"> & {
        className?: string;
        collapsedSize?: number;
        collapsible?: boolean;
        defaultSize?: number;
        id?: string;
        maxSize?: number;
        minSize?: number;
        onCollapse?: ResizablePrimitive.PanelOnCollapse;
        onExpand?: ResizablePrimitive.PanelOnExpand;
        onResize?: ResizablePrimitive.PanelOnResize;
        order?: number;
        style?: object;
        tagName?: import("react").ElementType;
    } & {
        children?: import("react").ReactNode;
    } & import("react").RefAttributes<ResizablePrimitive.ImperativePanelHandle>>;
    const ResizableHandle: ({ withHandle, className, ...props }: Omit<import("react").HTMLAttributes<import("react").ElementType>, "id"> & {
        className?: string;
        disabled?: boolean;
        id?: string;
        onDragging?: ResizablePrimitive.PanelResizeHandleOnDragging;
        style?: import("react").CSSProperties;
        tabIndex?: number;
        tagName?: import("react").ElementType;
    } & {
        children?: import("react").ReactNode;
    } & {
        withHandle?: boolean;
    }) => import("react/jsx-runtime").JSX.Element;
    export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
}
declare module "components/ui/select" {
    import * as React from "react";
    import * as SelectPrimitive from "@radix-ui/react-select";
    const Select: React.FC<SelectPrimitive.SelectProps>;
    const SelectGroup: React.ForwardRefExoticComponent<SelectPrimitive.SelectGroupProps & React.RefAttributes<HTMLDivElement>>;
    const SelectValue: React.ForwardRefExoticComponent<SelectPrimitive.SelectValueProps & React.RefAttributes<HTMLSpanElement>>;
    const SelectTrigger: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
    const SelectScrollUpButton: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectScrollUpButtonProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const SelectScrollDownButton: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectScrollDownButtonProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const SelectContent: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const SelectLabel: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectLabelProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const SelectItem: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const SelectSeparator: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectSeparatorProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton, };
}
declare module "components/chart/config-form/chart-basic-settings" {
    import { Control } from "react-hook-form";
    import { ChartConfig } from "components/chart/index";
    interface ChartBasicSettingsProps {
        control: Control<ChartConfig>;
        data: Record<string, any>[];
        children?: React.ReactNode;
    }
    export function ChartBasicSettings({ control, data, children, }: ChartBasicSettingsProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/ui/switch" {
    import * as React from "react";
    import * as SwitchPrimitives from "@radix-ui/react-switch";
    const Switch: React.ForwardRefExoticComponent<Omit<SwitchPrimitives.SwitchProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
    export { Switch };
}
declare module "components/chart/config-form/chart-display-options" {
    import { Control } from "react-hook-form";
    import { ChartConfig } from "components/chart/index";
    interface ChartDisplayOptionsProps {
        control: Control<ChartConfig>;
    }
    export function ChartDisplayOptions({ control }: ChartDisplayOptionsProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/ui/tabs" {
    import * as React from "react";
    import * as TabsPrimitive from "@radix-ui/react-tabs";
    const Tabs: React.ForwardRefExoticComponent<TabsPrimitive.TabsProps & React.RefAttributes<HTMLDivElement>>;
    const TabsList: React.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsListProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const TabsTrigger: React.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
    const TabsContent: React.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    export { Tabs, TabsList, TabsTrigger, TabsContent };
}
declare module "components/table/views/grid/theme" {
    import { Theme } from "@glideapps/glide-data-grid";
    export const darkTheme: Partial<Theme> & {
        name: string;
    };
    export const lightTheme: Partial<Theme> & {
        name: string;
    };
}
declare module "components/chart/config-form/data-grid" {
    import "@glideapps/glide-data-grid/dist/index.css";
    interface DataGridProps {
        data: Record<string, any>[];
        onDataChange: (data: any[]) => void;
    }
    export function DataGrid({ data, onDataChange }: DataGridProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/eui/callout" {
    type CalloutType = "info" | "warning" | "error" | "success";
    interface CalloutProps {
        children: React.ReactNode;
        className?: string;
        icon?: React.ReactNode;
        type?: CalloutType;
    }
    export function Callout({ children, className, icon, type, }: CalloutProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/data-pipeline/data-transforms" {
    interface DataTransform {
        type: "filter" | "sort" | "aggregate";
        config: {
            filterColumn?: string;
            filterValue?: string;
            sortColumn?: string;
            sortDirection?: "asc" | "desc";
            aggregateColumn?: string;
            aggregateFunction?: "sum" | "avg" | "count";
            groupByColumn?: string;
        };
    }
    interface DataTransformsProps {
        data: any[];
        transforms: DataTransform[];
        onTransformsChange: (transforms: DataTransform[]) => void;
        onApplyTransforms: () => void;
    }
    export function DataTransforms({ data, transforms, onTransformsChange, onApplyTransforms, }: DataTransformsProps): import("react/jsx-runtime").JSX.Element;
}
declare module "hooks/use-extension-navigate" {
    /**
     * const navigate = useLocalNavigate()
     * navigate("block://<blockid>?params=xxx") will redirect to the block page
     */
    export const useExtensionNavigate: () => (url: string) => void;
    export const useExtensionNavigateById: () => (id: string) => void;
}
declare module "components/script-container/hook" {
    import { IScriptContext, IScriptInput } from "components/script-container/helper";
    export const useScriptFunction: () => {
        callFunction: (props: {
            input: IScriptInput;
            context: IScriptContext;
            code: string;
            command: string;
            id: string;
            bindings?: Record<string, any>;
            dependencies?: string[];
            type?: string;
        }) => Promise<any>;
    };
    export const useCallScript: () => {
        callFunction: (props: {
            input: IScriptInput;
            context: IScriptContext;
            code: string;
            command: string;
            id: string;
            bindings?: Record<string, any>;
            dependencies?: string[];
            type?: string;
        }) => Promise<any>;
    };
}
declare module "hooks/use-script-data" {
    export const useScriptData: () => {
        getScriptData: (scriptId: string) => Promise<any>;
    };
}
declare module "apps/web-app/[database]/scripts/hooks/use-all-scripts" {
    import { IScript } from "packages/worker/web-worker/meta-table/script";
    export const useAllScripts: () => IScript[];
}
declare module "components/script-selector" {
    export const ScriptSelector: ({ onSelect, value, }: {
        onSelect?: (scriptId: string) => void;
        value?: string;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/chart/config-form/script-data-source" {
    import { DataScriptConfig } from "components/chart/config-form/types";
    interface ScriptDataSourceProps {
        config: DataScriptConfig;
        onConfigChange: (config: DataScriptConfig) => void;
        onDataChange: (data: any[]) => void;
    }
    export function ScriptDataSource({ config, onConfigChange, onDataChange, }: ScriptDataSourceProps): import("react/jsx-runtime").JSX.Element;
}
declare module "packages/lib/types/aggregate-item" {
    export interface AggregateItem {
        column: string;
        function: "sum" | "avg" | "count" | "min" | "max" | "count_distinct";
        alias?: string;
    }
}
declare module "packages/lib/sqlite/sql-aggregate-parser" {
    import { AggregateItem } from "packages/lib/types/aggregate-item";
    export const transformAggregateItems2SqlString: (sql: string, aggregateItems: AggregateItem[], groupByColumns?: string[], selectedFields?: string[]) => string;
}
declare module "hooks/use-debounce" {
    export function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number): (...args: Parameters<T>) => void;
}
declare module "hooks/use-table-fields" {
    export interface TableField {
        name: string;
        type: string;
        label: string;
    }
    export function useTableFields(tableId: string | undefined): {
        fields: TableField[];
        loading: boolean;
        error: string;
    };
}
declare module "hooks/use-view" {
    import { IView } from "packages/lib/store/IView";
    export const useView: ({ viewId }: {
        viewId?: string;
    }) => IView<any>;
}
declare module "components/multi-select" {
    type Option = {
        label: string;
        value: string;
    };
    interface ISelectProps {
        placeholder: string;
        options: Option[];
        selected: string[];
        onChange: (selected: string[]) => void;
    }
    export const MultiSelect: ({ placeholder, options: values, selected: selectedItems, onChange: setSelectedItems, }: ISelectProps) => import("react/jsx-runtime").JSX.Element;
    export default MultiSelect;
}
declare module "components/query-builder/query-builder" {
    import React from "react";
    import { AggregateItem } from "packages/lib/types/aggregate-item";
    import { TableField } from "hooks/use-table-fields";
    export type QueryTransformType = "aggregate" | "filter" | "sort";
    export interface AggregateTransformConfig {
        aggregations: AggregateItem[];
        groupBy?: string[];
    }
    export interface FilterTransformConfig {
        conditions: Array<{
            field: string;
            operator: string;
            value: any;
        }>;
    }
    export interface SortTransformConfig {
        sortBy: Array<{
            field: string;
            direction: "asc" | "desc";
        }>;
    }
    export type QueryTransform = {
        type: "aggregate";
        config: AggregateTransformConfig;
    };
    interface QueryBuilderProps {
        fields: TableField[];
        onQueryChange: (transforms: QueryTransform[]) => void;
        transforms?: QueryTransform[];
    }
    export const QueryBuilder: React.FC<QueryBuilderProps>;
}
declare module "components/sql-query-display/index" {
    import React from "react";
    interface SQLQueryDisplayProps {
        query: string;
        fieldMappings?: Record<string, string>;
    }
    export const SQLQueryDisplay: React.FC<SQLQueryDisplayProps>;
}
declare module "hooks/use-nodes" {
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    export const useAllNodes: (opts?: {
        isDeleted?: boolean;
        parent_id?: string;
        type?: ITreeNode["type"] | ITreeNode["type"][];
    }) => ITreeNode[];
    export const useNode: () => {
        updateIcon: (id: string, icon: string) => Promise<void>;
        updateCover: (id: string, cover: string) => Promise<void>;
        updatePosition: (id: string, position: number) => Promise<void>;
        updateParentId: (id: string, parentId?: string, opts?: {
            targetId: string;
            targetDirection: "up" | "down";
        }) => Promise<void>;
        updateHideProperties: (id: string, hideProperties: boolean) => Promise<void>;
        moveIntoTable: (nodeId: string, tableId: string, parentId?: string) => Promise<void>;
    };
}
declare module "components/table-selector" {
    export const TableSelector: ({ onSelect, value, }: {
        onSelect?: (tableId: string) => void;
        value?: string;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "hooks/use-all-views" {
    import { IView } from "packages/lib/store/IView";
    export const useAllViews: ({ tableId }: {
        tableId: string;
    }) => IView<any>[];
}
declare module "components/view-selector" {
    export const ViewSelector: ({ onSelect, value, tableId, }: {
        onSelect?: (viewId: string) => void;
        value?: string | null;
        tableId: string;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/chart/config-form/table-data-source" {
    import { DataTableConfig } from "components/chart/config-form/types";
    interface TableDataSourceProps {
        config: DataTableConfig;
        onConfigChange: (config: DataTableConfig) => void;
        onDataChange: (data: any[]) => void;
    }
    export function TableDataSource({ config, onConfigChange, onDataChange, }: TableDataSourceProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/chart/config-form/data-source-config" {
    import { DataSourceConfig, DataTransform } from "components/chart/config-form/types";
    interface DataSourceConfigProps {
        data: any[];
        onDataChange: (data: any[]) => void;
        dataSource: DataSourceConfig;
        onDataSourceChange: (source: DataSourceConfig) => void;
        transforms: DataTransform[];
        onTransformsChange: (transforms: DataTransform[]) => void;
    }
    export function DataSourceConfigComponent({ data, onDataChange, dataSource, onDataSourceChange, transforms, onTransformsChange, }: DataSourceConfigProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/chart/config-form/chart-preview" {
    import { ChartConfig } from "components/chart/index";
    import { DataSourceConfig, DataTransform } from "components/chart/config-form/types";
    interface ChartPreviewProps {
        config: ChartConfig;
        onDataChange: (data: any[]) => void;
        dataSource: DataSourceConfig;
        onDataSourceChange: (source: DataSourceConfig) => void;
        transforms: DataTransform[];
        onTransformsChange: (transforms: DataTransform[]) => void;
    }
    export function ChartPreview({ config, onDataChange, dataSource, onDataSourceChange, transforms, onTransformsChange, }: ChartPreviewProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/ui/card" {
    import * as React from "react";
    const Card: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
    const CardHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
    const CardTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
    const CardDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
    const CardContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
    const CardFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
    export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
}
declare module "components/chart/config-form/chart-series-config" {
    import { Control, UseFormGetValues, UseFormSetValue, UseFormWatch } from "react-hook-form";
    import { ChartConfig } from "components/chart/index";
    interface ChartSeriesConfigProps {
        control: Control<ChartConfig>;
        watch: UseFormWatch<ChartConfig>;
        setValue: UseFormSetValue<ChartConfig>;
        getValues: UseFormGetValues<ChartConfig>;
    }
    export function ChartSeriesConfig({ control, watch, setValue, getValues, }: ChartSeriesConfigProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/chart/config-form/chart-config-form" {
    import { type ChartConfig } from "components/chart/index";
    import { DataSourceConfig, DataTransform } from "components/chart/config-form/types";
    interface ChartConfigFormProps {
        config: ChartConfig;
        onConfigChange: (config: ChartConfig) => void;
        open: boolean;
        onOpenChange: (open: boolean) => void;
        dataSource: DataSourceConfig;
        transforms: DataTransform[];
        onDataSourceChange: (dataSource: DataSourceConfig) => void;
        onTransformsChange: (transforms: DataTransform[]) => void;
    }
    export function ChartConfigForm({ config, onConfigChange, open, onOpenChange, dataSource, transforms, onDataSourceChange, onTransformsChange, }: ChartConfigFormProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/chart/component" {
    import { NodeKey } from "lexical";
    import { DataSourceConfig, DataTransform } from "components/chart/config-form/types";
    export interface ChartBlockProps {
        config: string;
        nodeKey: NodeKey;
        id: string;
        dataSource: DataSourceConfig;
        transforms: DataTransform[];
    }
    export const ChartBlock: React.FC<ChartBlockProps>;
}
declare module "components/doc/blocks/chart/node" {
    import { MultilineElementTransformer } from "@lexical/markdown";
    import { DecoratorBlockNode, SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
    import { EditorConfig, ElementFormatType, LexicalEditor, LexicalNode, NodeKey, Spread } from "lexical";
    import { DataSourceConfig, DataTransform } from "components/chart/config-form/types";
    export type SerializedChartNode = Spread<{
        config: string;
        dataSource: DataSourceConfig;
        transforms: DataTransform[];
        id: string;
    }, SerializedDecoratorBlockNode>;
    export class ChartNode extends DecoratorBlockNode {
        __config: string;
        __dataSource: DataSourceConfig;
        __transforms: DataTransform[];
        __id: string;
        static getType(): string;
        static clone(node: ChartNode): ChartNode;
        constructor(config: string, format?: ElementFormatType, key?: NodeKey, dataSource?: DataSourceConfig, transforms?: DataTransform[], id?: string);
        setConfig(config: string): void;
        setDataSource(dataSource: DataSourceConfig): void;
        setTransforms(transforms: DataTransform[]): void;
        createDOM(): HTMLElement;
        updateDOM(): false;
        getId(): string;
        setId(id: string): void;
        exportJSON(): SerializedChartNode;
        static importJSON(serializedNode: SerializedChartNode): ChartNode;
        decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element;
        getTextContent(): string;
    }
    export function $createChartNode(config: string, format?: ElementFormatType, key?: NodeKey, dataSource?: DataSourceConfig, transforms?: DataTransform[], id?: string): ChartNode;
    export function $isChartNode(node: LexicalNode | null | undefined): node is ChartNode;
    export const CHART_NODE_TRANSFORMER: MultilineElementTransformer;
}
declare module "components/doc/blocks/chart/plugin" {
    import { LexicalCommand } from "lexical";
    export const INSERT_CHART_COMMAND: LexicalCommand<string>;
    export function ChartPlugin(): JSX.Element | null;
}
declare module "components/doc/blocks/chart/index" {
    import { DocBlock } from "components/doc/blocks/interface";
    const _default_8: DocBlock;
    export default _default_8;
}
declare module "components/ui/table" {
    import * as React from "react";
    const Table: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableElement> & React.RefAttributes<HTMLTableElement>>;
    const TableHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
    const TableBody: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
    const TableFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
    const TableRow: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableRowElement> & React.RefAttributes<HTMLTableRowElement>>;
    const TableHead: React.ForwardRefExoticComponent<React.ThHTMLAttributes<HTMLTableCellElement> & React.RefAttributes<HTMLTableCellElement>>;
    const TableCell: React.ForwardRefExoticComponent<React.TdHTMLAttributes<HTMLTableCellElement> & React.RefAttributes<HTMLTableCellElement>>;
    const TableCaption: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableCaptionElement> & React.RefAttributes<HTMLTableCaptionElement>>;
    export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption, };
}
declare module "components/doc/hooks/useModal" {
    export function useModal(): [
        JSX.Element | null,
        (title: string, showModal: (onClose: () => void) => JSX.Element) => void
    ];
}
declare module "components/doc/blocks/sql/dialog" {
    import { LexicalEditor } from "lexical";
    interface SqlQueryDialogProps {
        activeEditor: LexicalEditor;
        onClose: () => void;
        sql?: string;
        handleSqlChange?: (sql: string) => void;
    }
    export const SqlQueryDialog: (props: SqlQueryDialogProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/sql/helper" {
    export enum QueryResultType {
        TEXT = "TEXT",
        CARD = "CARD",
        LIST = "LIST",
        TABLE = "TABLE"
    }
    export const getQueryResultType: (data: object[]) => QueryResultType;
}
declare module "components/doc/blocks/sql/component" {
    type SQLProps = {
        sql: string;
        nodeKey: string;
    };
    export function SQLComponent({ sql, nodeKey }: SQLProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/sql/node" {
    import { ReactNode } from "react";
    import { ElementTransformer } from "@lexical/markdown";
    import { DecoratorNode, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from "lexical";
    export type SerializedSQLNode = Spread<{
        sql: string;
    }, SerializedLexicalNode>;
    export class SQLNode extends DecoratorNode<ReactNode> {
        __sql: string;
        static getType(): string;
        static clone(node: SQLNode): SQLNode;
        constructor(sql: string, key?: NodeKey);
        setSQL(sql: string): void;
        createDOM(): HTMLElement;
        updateDOM(): false;
        static importJSON(data: SerializedSQLNode): SQLNode;
        exportJSON(): SerializedSQLNode;
        decorate(): ReactNode;
        getTextContent(): string;
        isInline(): boolean;
        isIsolated(): boolean;
        isKeyboardSelectable(): boolean;
    }
    export function $createSQLNode(sql: string): SQLNode;
    export function $isSQLNode(node: LexicalNode | null | undefined): node is SQLNode;
    export const SQL_NODE_TRANSFORMER: ElementTransformer;
}
declare module "components/doc/blocks/sql/plugin" {
    import { LexicalCommand } from "lexical";
    export const INSERT_SQL_COMMAND: LexicalCommand<string>;
    export const SQLPlugin: () => any;
}
declare module "components/doc/blocks/sql/index" {
    import { DocBlock } from "components/doc/blocks/interface";
    const _default_9: DocBlock;
    export default _default_9;
}
declare module "packages/worker/web-worker/meta-table/embedding" {
    import { BaseTable, BaseTableImpl } from "packages/worker/web-worker/meta-table/base";
    export interface IEmbedding {
        id: string;
        embedding: string;
        model: string;
        raw_content: string;
        source_type: "doc" | "table" | "file";
        source: string;
    }
    export class EmbeddingTable extends BaseTableImpl implements BaseTable<IEmbedding> {
        name: string;
        createTableSql: string;
        add(data: IEmbedding): Promise<IEmbedding>;
        get(id: string): Promise<IEmbedding | null>;
        set(id: string, data: Partial<IEmbedding>): Promise<boolean>;
        del(id: string): Promise<boolean>;
    }
}
declare module "packages/lib/embedding/worker" {
    export const getEmbeddingWorker: () => Worker;
    export const embeddingTexts: (texts: string[]) => Promise<unknown>;
}
declare module "packages/lib/ai/llm_vendors/base" {
    export abstract class LLMBaseVendor {
        abstract name: string;
        abstract embedding(text: string[], model: string): Promise<number[][]>;
    }
}
declare module "packages/lib/ai/llm_vendors/bge" {
    import { LLMBaseVendor } from "packages/lib/ai/llm_vendors/base";
    export class BGEM3 implements LLMBaseVendor {
        name: string;
        _embedding?: (text: string[]) => Promise<number[][]>;
        constructor(embedding?: (text: string[]) => Promise<number[][]>);
        embedding(text: string[], model: string): Promise<number[][]>;
    }
}
declare module "packages/lib/ai/helper" {
    export type LLMProviderType = "openai" | "google" | "deepseek" | "groq" | "xai" | "openrouter" | "anthropic" | "azure" | "amazon-bedrock" | "deepinfra" | "mistral" | "togetherai" | "cohere" | "fireworks" | "cerebras" | "perplexity" | "ollama" | "openai-compatible";
    export const ALL_PROVIDERS_RAW: string[];
    export const LLM_PROVIDER_INFO: Record<LLMProviderType, {
        name: string;
        baseUrl: string;
        urlForGettingApiKey?: string;
    }>;
    export const ALL_PROVIDERS: LLMProviderType[];
    export interface AvailableModel {
        id: string;
        label: string;
    }
    export function fetchAvailableModels(apiKey: string, providerType: LLMProviderType, baseUrl?: string): Promise<AvailableModel[]>;
    export function getProvider(data: {
        apiKey?: string;
        baseUrl?: string;
        type?: LLMProviderType;
    }): import("@ai-sdk/openai").OpenAIProvider | import("@ai-sdk/google").GoogleGenerativeAIProvider | import("@ai-sdk/deepseek").DeepSeekProvider | import("@ai-sdk/groq").GroqProvider | import("@ai-sdk/xai").XaiProvider | import("@ai-sdk/anthropic").AnthropicProvider | import("@ai-sdk/azure").AzureOpenAIProvider | import("@ai-sdk/amazon-bedrock").AmazonBedrockProvider | import("@ai-sdk/mistral").MistralProvider | import("@ai-sdk/cohere").CohereProvider | import("@ai-sdk/perplexity").PerplexityProvider | import("@openrouter/ai-sdk-provider").OpenRouterProvider | import("@ai-sdk/deepinfra").DeepInfraProvider | import("@ai-sdk/cerebras").CerebrasProvider;
}
declare module "packages/lib/ai/config" {
    import { z } from "zod";
    import { LLMProviderType } from "packages/lib/ai/helper";
    export const llmProviderSchema: z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<[LLMProviderType, ...LLMProviderType[]]>>;
        name: z.ZodString;
        apiKey: z.ZodOptional<z.ZodString>;
        baseUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        models: z.ZodDefault<z.ZodString>;
        enabled: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        type?: LLMProviderType;
        enabled?: boolean;
        apiKey?: string;
        baseUrl?: string;
        models?: string;
    }, {
        name?: string;
        type?: LLMProviderType;
        enabled?: boolean;
        apiKey?: string;
        baseUrl?: string;
        models?: string;
    }>;
    export type LLMProvider = z.infer<typeof llmProviderSchema>;
    export const aiFormSchema: z.ZodObject<{
        localModels: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        llmProviders: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodDefault<z.ZodEnum<[LLMProviderType, ...LLMProviderType[]]>>;
            name: z.ZodString;
            apiKey: z.ZodOptional<z.ZodString>;
            baseUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
            models: z.ZodDefault<z.ZodString>;
            enabled: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            type?: LLMProviderType;
            enabled?: boolean;
            apiKey?: string;
            baseUrl?: string;
            models?: string;
        }, {
            name?: string;
            type?: LLMProviderType;
            enabled?: boolean;
            apiKey?: string;
            baseUrl?: string;
            models?: string;
        }>, "many">>;
        autoLoadEmbeddingModel: z.ZodDefault<z.ZodBoolean>;
        embeddingModel: z.ZodOptional<z.ZodString>;
        translationModel: z.ZodOptional<z.ZodString>;
        codingModel: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        localModels?: string[];
        llmProviders?: {
            name?: string;
            type?: LLMProviderType;
            enabled?: boolean;
            apiKey?: string;
            baseUrl?: string;
            models?: string;
        }[];
        autoLoadEmbeddingModel?: boolean;
        embeddingModel?: string;
        translationModel?: string;
        codingModel?: string;
    }, {
        localModels?: string[];
        llmProviders?: {
            name?: string;
            type?: LLMProviderType;
            enabled?: boolean;
            apiKey?: string;
            baseUrl?: string;
            models?: string;
        }[];
        autoLoadEmbeddingModel?: boolean;
        embeddingModel?: string;
        translationModel?: string;
        codingModel?: string;
    }>;
    export type AIFormValues = z.infer<typeof aiFormSchema>;
}
declare module "apps/web-app/settings/ai/store" {
    import { AIFormValues, LLMProvider } from "packages/lib/ai/config";
    interface ConfigState {
        aiConfig: AIFormValues;
        setAiConfig: (aiConfig: AIFormValues) => void;
        addLLMProvider: (provider: LLMProvider) => void;
        updateLLMProvider: (provider: LLMProvider) => void;
        removeLLMProvider: (name: string) => void;
    }
    export const useAIConfigStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<ConfigState>, "persist"> & {
        persist: {
            setOptions: (options: Partial<import("zustand/middleware").PersistOptions<ConfigState, unknown>>) => void;
            clearStorage: () => void;
            rehydrate: () => void | Promise<void>;
            hasHydrated: () => boolean;
            onHydrate: (fn: (state: ConfigState) => void) => () => void;
            onFinishHydration: (fn: (state: ConfigState) => void) => () => void;
            getOptions: () => Partial<import("zustand/middleware").PersistOptions<ConfigState, unknown>>;
        };
    }>;
}
declare module "apps/web-app/settings/ai/hooks" {
    export enum TaskType {
        Embedding = "Embedding",
        Translation = "Translation",
        Coding = "Coding"
    }
    export const useModelTest: () => {
        testModel: (modelType: TaskType, model: string | undefined) => Promise<any[]>;
        isEmbeddingLoading: boolean;
        isTranslationLoading: boolean;
        isCodingLoading: boolean;
    };
}
declare module "hooks/use-ai-config" {
    import { TaskType } from "apps/web-app/settings/ai/hooks";
    import { LanguageModelV1 } from "ai";
    export const useAiConfig: () => {
        getConfigByModel: (model: string) => {
            baseUrl: string;
            apiKey: string;
            modelId: string;
            type: import("@/lib/ai/helper").LLMProviderType;
        };
        getLLModel: (model: string) => LanguageModelV1;
        hasAvailableModels: boolean;
        findFirstAvailableModel: () => string;
        findAvailableModel: (task: TaskType) => string;
        codingModel: string;
        textModel: string;
        embeddingModel: string;
    };
}
declare module "hooks/use-embedding" {
    export const useEmbedding: () => {
        embedding: (text: string) => Promise<number[] | undefined>;
        hasEmbeddingModel: boolean;
        embeddingTexts: (text: string[]) => Promise<number[][] | undefined>;
    };
}
declare module "packages/lib/ai/doc_loader/base" {
    export abstract class BaseLoader {
        abstract load(docId: string): Promise<{
            content: string;
            meta: Record<string, any>;
        }[]>;
    }
}
declare module "packages/lib/ai/doc_loader/doc" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    import { BaseLoader } from "packages/lib/ai/doc_loader/base";
    export class DocLoader implements BaseLoader {
        private dataSpace;
        constructor(dataSpace: DataSpace);
        load(docId: string): Promise<{
            content: string;
            meta: Record<string, any>;
        }[]>;
    }
}
declare module "packages/lib/ai/vec_search" {
    export const getHnswIndex: (model: string, filename: string) => Promise<{
        vectorHnswIndex: import("hnswlib-wasm/dist/hnswlib-wasm").HierarchicalNSW;
        exists: boolean;
    }>;
}
declare module "hooks/use-hnsw" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    import { IEmbedding } from "packages/worker/web-worker/meta-table/embedding";
    import { LLMBaseVendor } from "packages/lib/ai/llm_vendors/base";
    export class EmbeddingManager {
        dataSpace: DataSpace;
        spaceName: string;
        constructor(dataSpace: DataSpace, spaceName: string);
        /**
         * @param model
         * @param source for hnswlib, it's the filename. for query, it's scope param
         */
        filterEmbeddings(model: string, source: string): Promise<{
            embeddings: number[][];
            embeddingIndexMap: Map<number, IEmbedding>;
        }>;
        getMetadata(ids: string[]): Promise<any[]>;
        clearEmbeddings(model: string, source: string): Promise<void>;
        query(query: string, model: string, k: number, provider: LLMBaseVendor): Promise<IEmbedding[]>;
        createEmbedding(id: string, type: "doc" | "table" | "file", model: string, provider: LLMBaseVendor): Promise<void>;
    }
    export const useHnsw: (_space?: string) => {
        createEmbedding: (data: {
            id: string;
            type: "doc" | "table" | "file";
            model: string;
            provider: LLMBaseVendor;
        }) => Promise<void>;
        queryEmbedding: (data: {
            query: string;
            model: string;
            k?: number;
            provider: LLMBaseVendor;
        }) => Promise<IEmbedding[] | undefined>;
    };
}
declare module "components/cmdk/hooks" {
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    export type ISearchNodes = ITreeNode & {
        result?: string;
        mode: "node" | "fts";
    };
    export const useCMDKStore: import("zustand").UseBoundStore<import("zustand").StoreApi<{
        input: string;
        setInput: (input: string) => void;
        searchNodes: ISearchNodes[];
        setSearchNodes: (searchNodes: ISearchNodes[]) => void;
    }>>;
    export const useCMDKGoto: () => (path: string) => () => void;
    export const useInput: () => {
        input: string;
        setInput: (input: string) => void;
        mode: string;
    };
}
declare module "hooks/use-query-node" {
    import { ISearchNodes } from "components/cmdk/hooks";
    export const useQueryNode: () => {
        queryNodes: (q: string) => Promise<ISearchNodes[] | undefined>;
        getNode: (id: string) => Promise<import("@/lib/store/ITreeNode").ITreeNode>;
        fullTextSearch: (q: string) => Promise<ISearchNodes[] | undefined>;
    };
}
declare module "components/doc/blocks/sync/component" {
    export const SyncBlockComponent: (props: {
        id: string;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/sync/node" {
    import { ReactNode } from "react";
    import { DecoratorNode, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from "lexical";
    export type SerializedSyncBlockNode = Spread<{
        id: string;
    }, SerializedLexicalNode>;
    export class SyncBlockNode extends DecoratorNode<ReactNode> {
        __id: string;
        static getType(): string;
        static clone(node: SyncBlockNode): SyncBlockNode;
        constructor(id: string, key?: NodeKey);
        getTextContent(): string;
        createDOM(): HTMLElement;
        updateDOM(): false;
        static importJSON(data: SerializedSyncBlockNode): SyncBlockNode;
        exportJSON(): SerializedSyncBlockNode;
        decorate(_editor: LexicalEditor, config: EditorConfig): ReactNode;
        canInsertTextBefore(): boolean;
        canInsertTextAfter(): boolean;
    }
    export function $createSyncBlockNode(id: string): SyncBlockNode;
    export function $isSyncBlockNode(node: LexicalNode | null | undefined): node is SyncBlockNode;
}
declare module "components/doc/blocks/mention/plugin/MentionTypeaheadOption" {
    import { MenuOption } from "@lexical/react/LexicalTypeaheadMenuPlugin";
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    export class MentionTypeaheadOption extends MenuOption {
        name: string;
        id: string;
        rawData: ITreeNode;
        constructor(name: string, id: string, rawData: ITreeNode);
    }
}
declare module "hooks/use-goto" {
    export const useLink: () => {
        getLink: (pathname: string) => string;
    };
    export const useGotoCurrentSpaceHome: () => () => void;
    export const useGoto: () => (space: string, tableName?: string, rowId?: string) => void;
}
declare module "components/sidebar/tree/create-node-trigger" {
    export const CreateNodeTrigger: ({ parent_id }: {
        parent_id?: string;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "apps/web-app/[database]/[node]/node-icon" {
    import { DOMAttributes } from "react";
    type CustomElement<T> = Partial<T & DOMAttributes<T> & {
        children: any;
    }>;
    type Emoji = {
        id: string;
        shortCode: string;
        native: string;
        size: string;
        fallback: string;
        set: string;
        skin: string;
    };
    global {
        namespace JSX {
            interface IntrinsicElements {
                ["em-emoji"]: CustomElement<Emoji>;
            }
        }
    }
    export const NodeIconEditor: (props: {
        icon?: string;
        nodeId: string;
        size?: string;
        customTrigger?: React.ReactNode;
        className?: string;
        disabled?: boolean;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "hooks/use-node-tree" {
    export const useNodeTree: () => {
        setNode: (node: Partial<import("@/lib/store/ITreeNode").ITreeNode> & {
            id: string;
        }) => void;
        addNode: (node: import("@/lib/store/ITreeNode").ITreeNode) => void;
        delNode: (nodeId: string) => void;
        pin: (id: string) => void;
        unpin: (id: string) => void;
    };
}
declare module "components/ui/context-menu" {
    import * as React from "react";
    import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
    const ContextMenu: React.FC<ContextMenuPrimitive.ContextMenuProps>;
    const ContextMenuTrigger: React.ForwardRefExoticComponent<ContextMenuPrimitive.ContextMenuTriggerProps & React.RefAttributes<HTMLSpanElement>>;
    const ContextMenuGroup: React.ForwardRefExoticComponent<ContextMenuPrimitive.ContextMenuGroupProps & React.RefAttributes<HTMLDivElement>>;
    const ContextMenuPortal: React.FC<ContextMenuPrimitive.ContextMenuPortalProps>;
    const ContextMenuSub: React.FC<ContextMenuPrimitive.ContextMenuSubProps>;
    const ContextMenuRadioGroup: React.ForwardRefExoticComponent<ContextMenuPrimitive.ContextMenuRadioGroupProps & React.RefAttributes<HTMLDivElement>>;
    const ContextMenuSubTrigger: React.ForwardRefExoticComponent<Omit<ContextMenuPrimitive.ContextMenuSubTriggerProps & React.RefAttributes<HTMLDivElement>, "ref"> & {
        inset?: boolean;
    } & React.RefAttributes<HTMLDivElement>>;
    const ContextMenuSubContent: React.ForwardRefExoticComponent<Omit<ContextMenuPrimitive.ContextMenuSubContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const ContextMenuContent: React.ForwardRefExoticComponent<Omit<ContextMenuPrimitive.ContextMenuContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const ContextMenuItem: React.ForwardRefExoticComponent<Omit<ContextMenuPrimitive.ContextMenuItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & {
        inset?: boolean;
    } & React.RefAttributes<HTMLDivElement>>;
    const ContextMenuCheckboxItem: React.ForwardRefExoticComponent<Omit<ContextMenuPrimitive.ContextMenuCheckboxItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const ContextMenuRadioItem: React.ForwardRefExoticComponent<Omit<ContextMenuPrimitive.ContextMenuRadioItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const ContextMenuLabel: React.ForwardRefExoticComponent<Omit<ContextMenuPrimitive.ContextMenuLabelProps & React.RefAttributes<HTMLDivElement>, "ref"> & {
        inset?: boolean;
    } & React.RefAttributes<HTMLDivElement>>;
    const ContextMenuSeparator: React.ForwardRefExoticComponent<Omit<ContextMenuPrimitive.ContextMenuSeparatorProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const ContextMenuShortcut: {
        ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    export { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup, };
}
declare module "components/node-name" {
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    export const NodeName: ({ node }: {
        node: ITreeNode;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/ui/command" {
    import * as React from "react";
    import { type DialogProps } from "@radix-ui/react-dialog";
    const Command: React.ForwardRefExoticComponent<Omit<{
        children?: React.ReactNode;
    } & React.HTMLAttributes<HTMLDivElement> & {
        label?: string;
        shouldFilter?: boolean;
        filter?: (value: string, search: string) => number;
        defaultValue?: string;
        value?: string;
        onValueChange?: (value: string) => void;
        loop?: boolean;
        vimBindings?: boolean;
    } & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const CommandDialog: ({ children, ...props }: DialogProps) => import("react/jsx-runtime").JSX.Element;
    const CommandInput: React.ForwardRefExoticComponent<Omit<Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
        value?: string;
        onValueChange?: (search: string) => void;
    } & React.RefAttributes<HTMLInputElement>, "ref"> & React.RefAttributes<HTMLInputElement>>;
    const CommandList: React.ForwardRefExoticComponent<Omit<{
        children?: React.ReactNode;
    } & React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const CommandEmpty: React.ForwardRefExoticComponent<Omit<{
        children?: React.ReactNode;
    } & React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const CommandGroup: React.ForwardRefExoticComponent<Omit<{
        children?: React.ReactNode;
    } & Omit<React.HTMLAttributes<HTMLDivElement>, "value" | "heading"> & {
        heading?: React.ReactNode;
        value?: string;
        forceMount?: boolean;
    } & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const CommandSeparator: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLDivElement> & {
        alwaysRender?: boolean;
    } & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const CommandItem: React.ForwardRefExoticComponent<Omit<{
        children?: React.ReactNode;
    } & Omit<React.HTMLAttributes<HTMLDivElement>, "value" | "disabled" | "onSelect"> & {
        disabled?: boolean;
        onSelect?: (value: string) => void;
        value?: string;
        forceMount?: boolean;
    } & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const CommandShortcut: {
        ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator, };
}
declare module "components/ui/scroll-area" {
    import * as React from "react";
    import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
    const ScrollArea: React.ForwardRefExoticComponent<Omit<ScrollAreaPrimitive.ScrollAreaProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const ScrollBar: React.ForwardRefExoticComponent<Omit<ScrollAreaPrimitive.ScrollAreaScrollbarProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    export { ScrollArea, ScrollBar };
}
declare module "components/node-menu/move-into" {
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    export const NodeMoveInto: ({ node }: {
        node: ITreeNode;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "packages/lib/web/file" {
    export const downloadFile: (file: Blob, name: string) => void;
}
declare module "components/node-menu/node-export" {
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    export const NodeExportContextMenu: ({ node }: {
        node: ITreeNode;
    }) => import("react/jsx-runtime").JSX.Element;
    export const NodeExport: ({ node }: {
        node: ITreeNode;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/sidebar/tree/store" {
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    export interface IHoverTarget extends ITreeNode {
        index: number;
        direction: "up" | "down";
        depth: number;
    }
    interface FolderState {
        currentCut: string | null;
        setCut: (id: string | null) => void;
        targetFolderId: string | null;
        setTargetFolderId: (id: string | null) => void;
        target: IHoverTarget | null;
        setTarget: (target: IHoverTarget | null) => void;
    }
    export const useFolderStore: () => {
        folders: Record<string, boolean>;
        toggleFolder: (id: string) => void;
        closeFolder: (id: string) => void;
        currentCut: string | null;
        setCut: (id: string | null) => void;
        targetFolderId: string | null;
        setTargetFolderId: (id: string | null) => void;
        target: IHoverTarget | null;
        setTarget: (target: IHoverTarget | null) => void;
    };
    export const useFolderActionStore: import("zustand").UseBoundStore<import("zustand").StoreApi<FolderState>>;
    export const usePersistFolderStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<{
        folders: Record<string, boolean>;
        toggleFolder: (id: string) => void;
        closeFolder: (id: string) => void;
    }>, "persist"> & {
        persist: {
            setOptions: (options: Partial<import("zustand/middleware").PersistOptions<{
                folders: Record<string, boolean>;
                toggleFolder: (id: string) => void;
                closeFolder: (id: string) => void;
            }, {
                folders: Record<string, boolean>;
                toggleFolder: (id: string) => void;
                closeFolder: (id: string) => void;
            }>>) => void;
            clearStorage: () => void;
            rehydrate: () => void | Promise<void>;
            hasHydrated: () => boolean;
            onHydrate: (fn: (state: {
                folders: Record<string, boolean>;
                toggleFolder: (id: string) => void;
                closeFolder: (id: string) => void;
            }) => void) => () => void;
            onFinishHydration: (fn: (state: {
                folders: Record<string, boolean>;
                toggleFolder: (id: string) => void;
                closeFolder: (id: string) => void;
            }) => void) => () => void;
            getOptions: () => Partial<import("zustand/middleware").PersistOptions<{
                folders: Record<string, boolean>;
                toggleFolder: (id: string) => void;
                closeFolder: (id: string) => void;
            }, {
                folders: Record<string, boolean>;
                toggleFolder: (id: string) => void;
                closeFolder: (id: string) => void;
            }>>;
        };
    }>;
}
declare module "components/sidebar/tree/hooks" {
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    export const useTreeOperations: () => {
        handlePaste: (node?: ITreeNode) => void;
        handleCut: (targetId: string) => void;
    };
}
declare module "components/sidebar/tree/node-menu" {
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    interface INodeItemProps {
        databaseName: string;
        node: ITreeNode;
        depth: number;
        children?: React.ReactNode;
    }
    export function NodeItem({ databaseName, children, node, depth, }: INodeItemProps): string | number | boolean | import("react/jsx-runtime").JSX.Element | Iterable<import("react").ReactNode>;
}
declare module "components/sidebar/tree/card" {
    import { type FC } from "react";
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    import { IHoverTarget } from "components/sidebar/tree/store";
    export const ItemTypes: {
        CARD: string;
    };
    export interface CardProps {
        id: any;
        node: ITreeNode;
        index: number;
        depth: number;
        className?: string;
        setTarget: (target: IHoverTarget | null) => void;
        setTargetFolderId: (id: string | null) => void;
        onDrop: (dragItem: DragItem) => void;
    }
    export interface DragItem {
        index: number;
        id: string;
        type: string;
        depth: number;
        parent_id?: string;
    }
    export const Card: FC<CardProps>;
}
declare module "components/sidebar/tree/node-tree" {
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    export interface ContainerState {
        cards: ITreeNode[];
    }
    export const NodeTreeContainer: ({ nodes, depth, }: {
        nodes: ITreeNode[];
        depth?: number;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/sidebar/item-tree" {
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    export const CurrentItemTree: ({ allNodes, Icon, title, disableAdd, }: {
        allNodes: ITreeNode[];
        title: string;
        Icon: React.ReactNode;
        disableAdd?: boolean;
    }) => import("react/jsx-runtime").JSX.Element;
    export const ItemIcon: ({ type, className, }: {
        type: string;
        className?: string;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/mention/plugin/MentionsTypeaheadMenuItem" {
    import { MentionTypeaheadOption } from "components/doc/blocks/mention/plugin/MentionTypeaheadOption";
    export function MentionsTypeaheadMenuItem({ index, isSelected, onClick, onMouseEnter, option, }: {
        index: number;
        isSelected: boolean;
        onClick: (e: React.MouseEvent) => void;
        onMouseEnter: () => void;
        option: MentionTypeaheadOption;
    }): import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/mention/plugin/helper" {
    import { MenuTextMatch } from "@lexical/react/LexicalTypeaheadMenuPlugin";
    export const mentionsCache: Map<any, any>;
    export function getPossibleQueryMatch(text: string): MenuTextMatch | null;
}
declare module "components/doc/blocks/mention/plugin/useMentionLookupService" {
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    export function useMentionLookupService(mentionString: string | null, enabledCreate: boolean, currentDocId?: string): ITreeNode[];
}
declare module "components/doc/blocks/mention/plugin/index" {
    import { Placement } from "@floating-ui/react";
    import { MentionTypeaheadOption } from "components/doc/blocks/mention/plugin/MentionTypeaheadOption";
    export interface MentionPluginProps {
        onOptionSelectCallback?: (selectedOption: MentionTypeaheadOption) => void;
        placement?: Placement;
    }
    export default function NewMentionsPlugin(props: MentionPluginProps): JSX.Element | null;
}
declare module "components/ai-chat/ai-input-editor/plugins/auto-editable" {
    export const AutoEditable: ({ editable }: {
        editable: boolean;
    }) => any;
}
declare module "packages/lib/ai/functions/create-doc" {
    import { z } from "zod";
    const createDoc: {
        name: string;
        description: string;
        schema: z.ZodObject<{
            title: z.ZodString;
            markdown: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            title?: string;
            markdown?: string;
        }, {
            title?: string;
            markdown?: string;
        }>;
    };
    export default createDoc;
}
declare module "packages/lib/ai/functions/create-table" {
    import { z } from "zod";
    import { FieldType } from "packages/lib/fields/const";
    const createTable: {
        name: string;
        description: string;
        schema: z.ZodObject<{
            name: z.ZodString;
            fields: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                type: z.ZodEnum<[FieldType.Number, FieldType.Text, FieldType.Title, FieldType.Checkbox, FieldType.Date, FieldType.File, FieldType.MultiSelect, FieldType.Rating, FieldType.Select, FieldType.URL, FieldType.Formula, FieldType.Link, FieldType.Lookup, FieldType.CreatedTime, FieldType.CreatedBy, FieldType.LastEditedTime, FieldType.LastEditedBy]>;
            }, "strip", z.ZodTypeAny, {
                name?: string;
                type?: FieldType;
            }, {
                name?: string;
                type?: FieldType;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            fields?: {
                name?: string;
                type?: FieldType;
            }[];
        }, {
            name?: string;
            fields?: {
                name?: string;
                type?: FieldType;
            }[];
        }>;
    };
    export default createTable;
}
declare module "packages/lib/ai/functions/recorder" {
    import { z } from "zod";
    const startRecorder: {
        name: string;
        description: string;
        schema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    };
    const stopRecorder: {
        name: string;
        description: string;
        schema: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id?: string;
        }, {
            id?: string;
        }>;
    };
    export { startRecorder, stopRecorder };
}
declare module "packages/lib/ai/functions/save-file" {
    import { z } from "zod";
    const saveFile2EFS: {
        name: string;
        description: string;
        schema: z.ZodObject<{
            url: z.ZodString;
            subPath: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            filename: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            url?: string;
            filename?: string;
            subPath?: string[];
        }, {
            url?: string;
            filename?: string;
            subPath?: string[];
        }>;
    };
    export default saveFile2EFS;
}
declare module "packages/lib/ai/functions/sql-query" {
    import { z } from "zod";
    const sqlQuery: {
        name: string;
        description: string;
        schema: z.ZodObject<{
            sql: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            sql?: string;
        }, {
            sql?: string;
        }>;
    };
    export default sqlQuery;
}
declare module "packages/lib/ai/functions/index" {
    import { z } from "zod";
    export const allFunctions: {
        name: string;
        description: string;
        schema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    }[];
    export const functions: {
        name: string;
        description: string;
        parameters: import("zod-to-json-schema").JsonSchema7Type;
    }[];
    type FunctionParamsSchemaMap = {
        [funName: string]: z.ZodSchema<any>;
    };
    export const functionParamsSchemaMap: FunctionParamsSchemaMap;
}
declare module "packages/lib/ai/openai" {
    import OpenAI from "openai";
    import { IField } from "packages/lib/store/interface";
    export const getOpenAI: (token: string) => OpenAI;
    export const getPrompt: (baseSysPrompt: string, context: {
        uiColumns?: IField[];
        databaseName: string;
        tableName?: string;
        currentDocMarkdown?: string;
    }, useBlankPrompt?: boolean) => string;
    type IGetFunctionCallHandler = (handleFunctionCall: any) => any;
    export const getFunctionCallHandler: IGetFunctionCallHandler;
}
declare module "packages/lib/markdown" {
    export const getAllCodeBlocks: (markdown: string) => {
        code: string;
        lang: string;
    }[];
    /**
     * get all links from markdown, but not include image
     * @param markdown
     * @returns
     */
    export const getAllLinks: (markdown: string) => string[];
    export const getCodeFromMarkdown: (markdown: string) => {
        code: string;
        lang: string;
    }[];
}
declare module "packages/lib/sqlite/channel/http" {
    import { MsgType } from "packages/lib/const";
    import { ISqlite } from "packages/lib/sqlite/interface";
    interface IHttpSendData {
        type: MsgType.CallFunction;
        data: {
            method: string;
            params: any[];
            dbName: string;
            tableId?: string;
            userId?: string;
        };
        id: string;
    }
    export class HttpSqlite implements ISqlite<string, IHttpSendData> {
        connector: string;
        responseMap: Map<string, any>;
        constructor(connector: string);
        send(data: IHttpSendData): Promise<void>;
        onCallBack(thisCallId: string, timeout?: number, interval?: number): Promise<unknown>;
    }
}
declare module "packages/lib/sqlite/channel/local" {
    import { MsgType } from "packages/lib/const";
    import type { IpcRenderer } from 'electron';
    export interface ISqlite<T, D> {
        connector: T;
        send: (data: D) => void;
        onCallBack: (thisCallId: string) => Promise<any>;
    }
    export interface ILocalSendData {
        type: MsgType.CallFunction;
        data: {
            method: string;
            params: any[];
            dbName: string;
            tableId?: string;
            userId?: string;
        };
        id: string;
    }
    export class LocalSqlite implements ISqlite<Worker | IpcRenderer, ILocalSendData> {
        connector: Worker | IpcRenderer;
        channel: MessageChannel;
        channelMap: Map<string, MessageChannel>;
        dataMap: Map<string, any>;
        options?: {
            readonly?: boolean;
        };
        constructor(connector: Worker | IpcRenderer, options?: {
            readonly?: boolean;
        });
        getChannel(id: string): MessageChannel;
        destroyChannel(id: string): void;
        send(data: ILocalSendData): Promise<any>;
        onCallBack(thisCallId: string): Promise<unknown>;
    }
}
declare module "packages/lib/sqlite/worker" {
    export const getWorker: () => Worker;
}
declare module "packages/lib/collaboration/interface" {
    import { MsgType } from "packages/lib/const";
    import { IQueryResp } from "packages/lib/sqlite/interface";
    export interface ICollaborator {
        id: string;
        name: string;
    }
    export enum ECollaborationMsgType {
        JOIN = "JOIN",
        LEAVE = "LEAVE",
        MOVE_CURSOR = "MOVE_CURSOR",
        QUERY = "QUERY",
        QUERY_RESP = "QUERY_RESP",
        FORWARD = "FORWARD"
    }
    export interface IMsgJoin {
        type: ECollaborationMsgType.JOIN;
        payload: {
            collaborator: ICollaborator;
        };
    }
    export interface IMsgLeave {
        type: ECollaborationMsgType.LEAVE;
        payload: {
            collaborator: ICollaborator;
        };
    }
    export interface IMsgMoveCursor {
        type: ECollaborationMsgType.MOVE_CURSOR;
        payload: {
            collaboratorId: string;
            cursor: [number, number];
        };
    }
    export interface IMsgQuery {
        type: ECollaborationMsgType.QUERY;
        payload: {
            collaboratorId: string;
            query: {
                type: MsgType.CallFunction;
                data: {
                    method: string;
                    params: [string, string[]];
                    dbName: string;
                };
                id: string;
            };
        };
    }
    export interface IMsgForward {
        type: ECollaborationMsgType.FORWARD;
        payload: {
            collaboratorId: string;
            msg: any;
        };
    }
    export interface IMsgQueryResp {
        type: ECollaborationMsgType.QUERY_RESP;
        payload: IQueryResp;
    }
    export type IMsg = IMsgJoin | IMsgLeave | IMsgMoveCursor | IMsgQuery | IMsgForward;
}
declare module "packages/lib/sqlite/channel/webrtc" {
    import { DataConnection } from "peerjs";
    export interface ISqlite<T, D> {
        connector: T;
        send: (data: D) => void;
        onCallBack: (thisCallId: string) => Promise<any>;
    }
    export class RemoteSqlite implements ISqlite<DataConnection, any> {
        connector: DataConnection;
        bc: BroadcastChannel;
        constructor(connector: DataConnection);
        send(data: any): void;
        onCallBack(thisCallId: string): Promise<unknown>;
    }
}
declare module "packages/lib/sqlite/channel/index" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    import { DataConnection } from "peerjs";
    import { ILocalSendData } from "packages/lib/sqlite/channel/local";
    import { ISqlite } from "packages/lib/sqlite/interface";
    type IConfig = {
        isShareMode?: boolean;
        connection?: DataConnection;
        isReadonly?: boolean;
    };
    export const getSqliteChannel: (dbName: string, userId: string, config?: IConfig) => ISqlite<any, ILocalSendData>;
    export const getSqliteProxy: (dbName: string, userId: string, config?: IConfig) => DataSpace;
}
declare module "components/doc/nodes" {
    export const getAllNodes: () => any[];
}
declare module "hooks/use-doc-editor" {
    import type { DataSpace } from "packages/worker/web-worker/DataSpace";
    import type { Email } from "postal-mime";
    import "@/lib/prism-config";
    import { LexicalEditor } from "lexical";
    export const getHeadlessEditor: () => LexicalEditor;
    export const _getDocMarkdown: (articleEditorStateJSON: string) => Promise<string>;
    export const _convertEmail2State: (email: Email, space: string, userId?: string) => Promise<string>;
    export const _convertHtml2State: (html: string) => Promise<string>;
    export const _convertMarkdown2State: (markdown: string) => Promise<string>;
    export const useDocEditor: (sqlite: DataSpace | null) => {
        getDocMarkdown: (docId: string) => Promise<string>;
        convertMarkdown2State: (markdown: string) => Promise<string>;
    };
}
declare module "apps/web-app/[database]/store" {
    interface ISpaceAppState {
        apps: string[];
        setApps: (apps: string[]) => void;
        currentAppIndex: number;
        setCurrentAppIndex: (currentAppIndex: number) => void;
        isRightPanelOpen: boolean;
        setIsRightPanelOpen: (isAiOpen: boolean, index?: number) => void;
        isExtAppOpen: boolean;
        setIsExtAppOpen: (isExtAppOpen: boolean) => void;
        aiMessages: any[];
        setAiMessages: (aiMessages: any[]) => void;
        currentTableSchema: string;
        setCurrentTableSchema: (currentTableSchema: string) => void;
        currentQuery: string;
        setCurrentQuery: (currentQuery: string) => void;
        count: number;
        setCount: (count: number) => void;
        isMobileSidebarOpen: boolean;
        setMobileSidebarOpen: (isMobileSidebarOpen: boolean) => void;
    }
    interface IAppsState {
        apps: string[];
        setApps: (apps: string[]) => void;
        addApp: (app: string) => void;
        deleteApp: (app: string) => void;
        deleteByIndex: (index: number) => void;
    }
    export const useAppsStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<IAppsState>, "persist"> & {
        persist: {
            setOptions: (options: Partial<import("zustand/middleware").PersistOptions<IAppsState, IAppsState>>) => void;
            clearStorage: () => void;
            rehydrate: () => void | Promise<void>;
            hasHydrated: () => boolean;
            onHydrate: (fn: (state: IAppsState) => void) => () => void;
            onFinishHydration: (fn: (state: IAppsState) => void) => () => void;
            getOptions: () => Partial<import("zustand/middleware").PersistOptions<IAppsState, IAppsState>>;
        };
    }>;
    export const useSpaceAppStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ISpaceAppState>>;
}
declare module "components/table/fields/header-icons" {
    import { SpriteMap } from "@glideapps/glide-data-grid";
    export const makeHeaderIcons: (size: number) => SpriteMap;
    export const headerIcons: SpriteMap;
}
declare module "components/table/fields/field-selector" {
    import { IField } from "packages/lib/store/interface";
    interface IFieldSelectorProps {
        fields: IField[];
        value?: string;
        onChange: (value: string) => void;
    }
    export const FieldSelector: ({ fields, value, onChange, }: IFieldSelectorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/helper" {
    import { IField } from "packages/lib/store/interface";
    export const getShowColumns: (uiColumns: IField[], options: {
        orderMap?: Record<string, number>;
        hiddenFields?: string[];
    }) => IField[];
    export const TABLE_CONTENT_ELEMENT_ID = "table-content-area";
    export enum DataLevel {
        L1 = 10000,// 0 - 10,000
        L2 = 100000,// 10,000 - 100,000
        L3 = 1000000
    }
    export const getDataLevel: (count: number) => DataLevel;
}
declare module "components/table/views/grid/cells/helper" {
    import { BaseDrawArgs, BaseGridCell, Theme } from "@glideapps/glide-data-grid";
    import { LinkCellData } from "packages/lib/fields/link";
    interface CornerRadius {
        tl: number;
        tr: number;
        bl: number;
        br: number;
    }
    export function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number | CornerRadius): void;
    export const removeItemFromArray: (_arr: any[], item: any) => any[];
    /** @category Drawing */
    export function getMiddleCenterBias(ctx: CanvasRenderingContext2D, font: string | Theme): number;
    /** @category Drawing */
    export function measureTextCached(s: string, ctx: CanvasRenderingContext2D, font?: string): TextMetrics;
    export function drawDrilldownCell(args: BaseDrawArgs, data: readonly LinkCellData[]): void;
    export function drawImage(args: BaseDrawArgs, data: readonly string[], rounding?: number, contentAlign?: BaseGridCell["contentAlign"]): void;
}
declare module "components/table/views/grid/cells/link/link-cell-editor" {
    import { LinkCellData } from "packages/lib/fields/link";
    interface IGridProps {
        tableName: string;
        databaseName: string;
        value: LinkCellData[];
        onChange: (data: LinkCellData[]) => void;
    }
    export function LinkCellEditor(props: IGridProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/views/grid/cells/link/link-cell" {
    import { CustomCell, CustomRenderer } from "@glideapps/glide-data-grid";
    import { LinkCellData } from "packages/lib/fields/link";
    interface LinkCellProps {
        readonly kind: "link-cell";
        readonly value: LinkCellData[];
        readonly linkTable: string;
    }
    export type LinkCell = CustomCell<LinkCellProps>;
    export const linkCellRenderer: CustomRenderer<LinkCell>;
    export default linkCellRenderer;
}
declare module "packages/lib/fields/link" {
    import { LinkCell } from "components/table/views/grid/cells/link/link-cell";
    import { BaseField } from "packages/lib/fields/base";
    import { FieldType } from "packages/lib/fields/const";
    export type ILinkProperty = {
        linkTableName: string;
        linkColumnName: string;
    };
    export type LinkCellData = {
        id: string;
        title: string;
        img?: string;
    };
    export class LinkField extends BaseField<LinkCell, ILinkProperty> {
        static type: FieldType;
        rawData2JSON(rawData: string): string;
        get compareOperators(): any[];
        getCellContent(rawData: string, context?: {
            row?: Record<string, string>;
        }): LinkCell;
        cellData2RawData(cell: LinkCell): {
            rawData: string;
        };
    }
}
declare module "packages/lib/fields/lookup" {
    import { IField } from "packages/lib/store/interface";
    import { BaseField } from "packages/lib/fields/base";
    import { FieldType } from "packages/lib/fields/const";
    import { ILinkProperty } from "packages/lib/fields/link";
    export type ILookupProperty = {
        linkFieldId: string;
        lookupTargetFieldId: string;
    };
    /**
     * a -> b -> c -> d ....
     * if a&b&c&d are lookup field, we need to get the lookup fields map from a to d
     * walk through the lookup fields, and get the lookup fields map
     */
    export type ILookupContext = {
        linkField: IField<ILinkProperty> | null;
        lookupTargetFieldsMap: {
            [lookupTargetTableId: string]: {
                [fieldId: string]: {
                    field: IField<any>;
                    context: ILookupContext | null;
                };
            };
        };
    };
    export class LookupField extends BaseField<any, ILookupProperty, any, any, ILookupContext> {
        static type: FieldType;
        /**
         * get target field instance, no matter it is a lookup field or not
         * we will store all lookup cell data in database, if we want to get lookup cell data, we just need to get the target field
         * do not need to get the entity field instance
         * @returns
         */
        getTargetFieldInstance(): BaseField<any, any, any, any, any> | null;
        /**
         * for render, we need to get the entity field instance
         * a->b->c->d
         * maybe a&b&c are lookup field, but d is not a lookup field
         * we will get the target field recursively until the target field is not a lookup field
         * @returns
         */
        get entityFieldInstance(): BaseField<any, any, any, any, any> | LookupField | null;
        get displayType(): FieldType;
        rawData2JSON(rawData: any): any;
        get compareOperators(): any;
        getCellContent(rawData: string, context: any): any;
        cellData2RawData(cell: any): {
            rawData: any;
        };
    }
}
declare module "components/table/views/grid/hooks/use-lookup-context" {
    import { ILookupContext } from "packages/lib/fields/lookup";
    export const useLookupContext: (tableName: string, databaseName: string) => {
        contextMap: Record<string, ILookupContext>;
    };
}
declare module "components/table/hooks" {
    import { IView, ViewTypeEnum } from "packages/lib/store/IView";
    import { IField } from "packages/lib/store/interface";
    interface TableContextType {
        tableName: string;
        space: string;
        viewId?: string;
        isReadOnly?: boolean;
        udfs?: {
            id: string;
            name: string;
            code: string;
        }[];
    }
    export const TableContext: import("react").Context<TableContextType>;
    export const useUDFs: () => {
        id: string;
        name: string;
        code: string;
    }[];
    export const useViewOperation: () => {
        addView: (type?: ViewTypeEnum) => Promise<IView<any>>;
        delView: (viewId: string) => Promise<void>;
        updateView: (id: string, view: Partial<IView>) => Promise<void>;
        addSort: (view: IView, column: string, direction: "ASC" | "DESC") => void;
        moveViewPosition: (dragId: string, targetId: string, direction: "up" | "down") => Promise<void>;
        freezeColumn: (viewId: string, colIndex: number) => Promise<void>;
    };
    export const useCurrentView: <T = any>({ space, tableName, viewId, }: {
        space: string;
        tableName: string;
        viewId?: string;
    }) => {
        currentView: IView<T>;
        setCurrentViewId: import("react").Dispatch<import("react").SetStateAction<string>>;
        defaultViewId: string;
    };
    export const useShowColumns: (uiColumns: IField[], view: IView) => IField[];
    export const useView: <T = any>(viewId: string) => IView<T>;
    export const useFileFields: () => IField<any>[];
}
declare module "components/table/hooks/use-view-query" {
    import { SelectFromStatement } from "pgsql-ast-parser";
    import { IView } from "packages/lib/store/IView";
    export const useViewQuery: (view?: IView) => {
        sql: string;
        parsedSql: SelectFromStatement;
    };
}
declare module "components/table/view-sort-editor" {
    export type OrderByItem = {
        column: string;
        order: string | "ASC" | "DESC";
    };
    interface IViewEditorProps {
        onSortChange?: (sort: OrderByItem[]) => void;
    }
    export function ViewSortEditor(props: IViewEditorProps): import("react/jsx-runtime").JSX.Element;
}
declare module "packages/lib/sqlite/sql-sort-parser" {
    import { OrderByItem } from "components/table/view-sort-editor";
    import { IField } from "packages/lib/store/interface";
    export const getSortColumns: (query: string) => string[];
    /**
     * before call this function, the query sql must be transformed by transformQueryWithFormulaFields2Sql.
     * because orderBy may be included formula fields
     * @param query
     * @returns
     */
    export const rewriteQuery2getSortedRowIds: (query: string, useTempTable?: boolean) => string;
    export const _rewriteQuery2getSortedSqliteRowIds: (query: string) => string;
    export const rewriteQuery2getSortedSqliteRowIds: (query: string, totalCount: number, batchSize?: number) => string[];
    export const rewriteQueryWithSortedQuery: (query: string, sortedQuery: string) => string;
    export const rewriteQueryWithOffsetAndLimit: (query: string, offset: number, limit: number) => string;
    export const hasOrderBy: (query?: string) => boolean;
    export const transformQueryWithOrderBy2Sql: (orderBy: OrderByItem[], query: string, fieldMap: {
        [fieldId: string]: IField<any>;
    }) => string;
}
declare module "components/table/hooks/use-table-count" {
    export const useTableCount: (tableName: string) => {
        count: number;
        setCount: import("react").Dispatch<import("react").SetStateAction<number>>;
        loading: boolean;
    };
}
declare module "components/table/hooks/use-auto-index" {
    import { IView } from "packages/lib/store/IView";
    export const useAutoIndex: (view: IView) => void;
}
declare module "components/table/hooks/use-view-count" {
    import { IView } from "packages/lib/store/IView";
    interface ViewState {
        counts: Record<string, number>;
        increaseCount: (query: string) => void;
        reduceCount: (query: string) => void;
        setCount: (query: string, count: number) => void;
    }
    export const useViewStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ViewState>>;
    export const useViewCount: (view?: IView) => {
        count: number;
        setCount: (count: number) => void;
        loading: boolean;
        increaseCount: () => void;
        reduceCount: () => void;
    };
}
declare module "components/table/hooks/use-view-loading" {
    interface ViewLoadingState {
        loadingStates: Map<string, boolean>;
        setLoading: (qs: string, isLoading: boolean) => void;
        resetLoading: () => void;
        getLoading: (qs: string) => boolean;
    }
    export const useViewLoadingStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ViewLoadingState>>;
}
declare module "packages/lib/sqlite/sql-filter-parser" {
    import { ExprBinary } from "pgsql-ast-parser";
    import { FilterValueType } from "components/table/view-filter-editor/interface";
    import { BinaryOperator, CompareOperator } from "packages/lib/fields/const";
    export const isLogicOperator: (op: string) => op is BinaryOperator;
    export const reverseOpMap: Record<BinaryOperator | CompareOperator, string>;
    export const expr2FilterValue: (expr: ExprBinary) => FilterValueType;
    export const transformSql2FilterItems: (sql: string) => FilterValueType;
    export const transformFilterItems2SqlExpr: (filterItems: FilterValueType) => any;
    export const transformFilterItems2SqlString: (sql: string, filterItems: FilterValueType | null) => string;
    export const getFilterColumns: (query: string) => string[];
}
declare module "packages/lib/sqlite/sql-view-query" {
    export const isFieldsInQuery: (query: string, fields: string[]) => boolean;
    export const rewriteQueryWithRowId: (query: string) => string;
    export const rewriteQueryWithOffsetAndLimit: (query: string, offset?: number, limit?: number) => string;
}
declare module "hooks/use-current-sub-page" {
    export const useCurrentSubPage: () => {
        subPageId: string;
        clearSubPage: () => void;
        setSubPage: (id: string) => void;
    };
}
declare module "hooks/use-view-sort" {
    export const useViewSort: (query: string, useTempTable?: boolean) => {
        getViewSortedRows: () => Promise<any[]>;
    };
}
declare module "components/table/hooks/use-table-row-event" {
    import { EidosDataEventChannelMsg } from "packages/lib/const";
    type Row = EidosDataEventChannelMsg["payload"]["_new"];
    interface UseTableDataEventProps {
        tableName: string;
        onInsert?: (row: Row) => void;
        onUpdate?: (_new: Row, _old: Row) => void;
        onDelete?: (row: Row) => void;
    }
    export const useTableRowEvent: ({ tableName, onInsert, onUpdate, onDelete, }: UseTableDataEventProps) => void;
}
declare module "components/table/views/grid/store" {
    import { GridSelection, Rectangle } from "@glideapps/glide-data-grid";
    import { IField } from "packages/lib/store/interface";
    interface IMenu {
        col: number;
        bounds: Rectangle;
    }
    interface ITableAppState {
        isAddFieldEditorOpen: boolean;
        setIsAddFieldEditorOpen: (isAddFieldEditorOpen: boolean) => void;
        isFieldPropertiesEditorOpen: boolean;
        setIsFieldPropertiesEditorOpen: (isFieldPropertiesEditorOpen: boolean) => void;
        selectedFieldType: string;
        setSelectedFieldType: (selectedFieldType: string) => void;
        selection: GridSelection;
        setSelection: (selection: GridSelection) => void;
        clearSelection: () => void;
        menu?: IMenu;
        setMenu: (menu?: IMenu) => void;
        currentUiColumn?: IField;
        setCurrentUiColumn: (currentUiColumn?: IField) => void;
        currentPreviewIndex: number;
        setCurrentPreviewIndex: (currentPreviewIndex: number) => void;
        addedRowIds: Set<string>;
        addAddedRowId: (rowId: string) => void;
        removeAddedRowId: (rowId: string) => void;
        clearAddedRowIds: () => void;
    }
    export const useTableAppStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ITableAppState>>;
}
declare module "hooks/use-fs" {
    import { EidosFileSystemManager } from "packages/lib/storage/eidos-file-system";
    export const useEidosFileSystemManager: () => {
        efsManager: EidosFileSystemManager;
    };
}
declare module "packages/worker/service-worker/backup/provider/base" {
    export abstract class BaseBackupServer {
        pull(directoryPath: string): Promise<void>;
        private getOPFSManager;
        private getOPFSDatabaseFile;
        private pullDBFile;
        private pushDBFile;
        push(directoryPath: string): Promise<void>;
        getLocalFile(path: string): Promise<File | null>;
        walkLocalDirectory(directory: string): Promise<string[]>;
        save2LocalFile(path: string, file: File): Promise<string[]>;
        deleteLocalFile(path: string): Promise<void>;
        shouldUpload(localFileLastModifiedTime: Date, remoteFileLastModifiedTime: Date): boolean;
        abstract walk(directory: string): Promise<string[]>;
        abstract uploadFile(path: string, file: File): Promise<void>;
        abstract getFile(path: string): Promise<File | null>;
        abstract deleteFile(path: string): Promise<void>;
        abstract getLastModifiedTime(file: string): Promise<Date | null>;
    }
}
declare module "packages/worker/service-worker/backup/provider/github" {
    import { Octokit } from "@octokit/rest";
    import { BaseBackupServer } from "packages/worker/service-worker/backup/provider/base";
    export class GithubBackupServer extends BaseBackupServer {
        private token;
        private owner;
        private repo;
        octokit: Octokit;
        constructor(token: string, owner: string, repo: string);
        getFile(path: string): Promise<File | null>;
        deleteFile(path: string): Promise<void>;
        getLastModifiedTime(file: string): Promise<Date | null>;
        dirExists(path: string): Promise<boolean>;
        walk(directory: string): Promise<string[]>;
        _walk(directory: string): Promise<string[]>;
        uploadFile(path: string, file: File): Promise<void>;
    }
}
declare module "packages/worker/service-worker/backup/index" {
    export const getConfigFromOpfs: () => Promise<{
        spaceList?: string;
        Github__repo?: string;
        Github__token?: string;
        Github__enabled?: boolean;
        S3__endpointUrl?: string;
        S3__accessKeyId?: string;
        S3__secretAccessKey?: string;
        S3__enabled?: boolean;
        autoSaveGap?: number;
    }>;
    export const getLastSyncStatus: () => Promise<Record<string, string>>;
    export const updateLastSyncStatus: (syncStatus: Record<string, string>) => Promise<void>;
    export const backUpPushOnce: () => Promise<void>;
    export const backUpPullOnce: () => Promise<void>;
    export const autoBackup: () => Promise<void>;
    export const backupAllSpaceData: () => Promise<void>;
}
declare module "hooks/use-register-period-sync" {
    export const registerPeriodicSync: () => Promise<"unregistered" | "registered">;
    export const registerSpaceDatabaseSync: () => Promise<"unregistered" | "registered">;
    export const _registerSpaceDatabaseSync: () => Promise<NodeJS.Timer>;
    export const useRegisterPeriodicSync: () => void;
}
declare module "components/react-hook-form/form" {
    import * as React from "react";
    import * as LabelPrimitive from "@radix-ui/react-label";
    import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
    const Form: <TFieldValues extends FieldValues, TContext = any, TTransformedValues extends FieldValues = undefined>(props: import("react-hook-form").FormProviderProps<TFieldValues, TContext, TTransformedValues>) => React.JSX.Element;
    const FormField: <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ ...props }: ControllerProps<TFieldValues, TName>) => import("react/jsx-runtime").JSX.Element;
    const useFormField: () => {
        invalid: boolean;
        isDirty: boolean;
        isTouched: boolean;
        error?: import("react-hook-form").FieldError;
        id: string;
        name: string;
        formItemId: string;
        formDescriptionId: string;
        formMessageId: string;
    };
    const FormItem: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
    const FormLabel: React.ForwardRefExoticComponent<Omit<LabelPrimitive.LabelProps & React.RefAttributes<HTMLLabelElement>, "ref"> & React.RefAttributes<HTMLLabelElement>>;
    const FormControl: React.ForwardRefExoticComponent<Omit<import("@radix-ui/react-slot").SlotProps & React.RefAttributes<HTMLElement>, "ref"> & React.RefAttributes<HTMLElement>>;
    const FormDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
    const FormMessage: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
    export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField, };
}
declare module "apps/web-app/settings/backup/page" {
    import * as z from "zod";
    const backupServerFormSchema: z.ZodObject<{
        Github__repo: z.ZodOptional<z.ZodString>;
        Github__token: z.ZodOptional<z.ZodString>;
        Github__enabled: z.ZodOptional<z.ZodBoolean>;
        S3__endpointUrl: z.ZodOptional<z.ZodString>;
        S3__accessKeyId: z.ZodOptional<z.ZodString>;
        S3__secretAccessKey: z.ZodOptional<z.ZodString>;
        S3__enabled: z.ZodOptional<z.ZodBoolean>;
        spaceList: z.ZodOptional<z.ZodString>;
        autoSaveGap: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        spaceList?: string;
        Github__repo?: string;
        Github__token?: string;
        Github__enabled?: boolean;
        S3__endpointUrl?: string;
        S3__accessKeyId?: string;
        S3__secretAccessKey?: string;
        S3__enabled?: boolean;
        autoSaveGap?: number;
    }, {
        spaceList?: string;
        Github__repo?: string;
        Github__token?: string;
        Github__enabled?: boolean;
        S3__endpointUrl?: string;
        S3__accessKeyId?: string;
        S3__secretAccessKey?: string;
        S3__enabled?: boolean;
        autoSaveGap?: number;
    }>;
    export type BackupServerFormValues = z.infer<typeof backupServerFormSchema>;
    export function BackupServerForm(): import("react/jsx-runtime").JSX.Element;
    export const BackupSettings: () => import("react/jsx-runtime").JSX.Element;
}
declare module "packages/lib/web/crypto" {
    export const getKeyPair: () => Promise<CryptoKeyPair>;
    export const PUBLIC_KEY: {
        crv: string;
        ext: boolean;
        key_ops: string[];
        kty: string;
        x: string;
        y: string;
    };
    export function verifyMessage(payload: object, signature: ArrayBuffer): Promise<boolean>;
    /**
     * file checksum sha3-256
     * return checksum
     */
    export function fileChecksum(file: File): Promise<string>;
}
declare module "hooks/use-activation" {
    interface IActivationState {
        code: string;
        clientId?: string;
        isActivated: boolean;
        license?: string;
        setClientId: (clientId: string) => void;
        setCode: (code: string) => void;
        setIsActivated: (isActivated: boolean) => void;
        setLicense: (license: string) => void;
    }
    export const useActivationCodeStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<IActivationState>, "persist"> & {
        persist: {
            setOptions: (options: Partial<import("zustand/middleware").PersistOptions<IActivationState, IActivationState>>) => void;
            clearStorage: () => void;
            rehydrate: () => void | Promise<void>;
            hasHydrated: () => boolean;
            onHydrate: (fn: (state: IActivationState) => void) => () => void;
            onFinishHydration: (fn: (state: IActivationState) => void) => () => void;
            getOptions: () => Partial<import("zustand/middleware").PersistOptions<IActivationState, IActivationState>>;
        };
    }>;
    export const useActivation: () => {
        isActivated: boolean;
        active: (_key: string) => Promise<boolean>;
    };
}
declare module "components/ui/avatar" {
    import * as React from "react";
    import * as AvatarPrimitive from "@radix-ui/react-avatar";
    const Avatar: React.ForwardRefExoticComponent<Omit<AvatarPrimitive.AvatarProps & React.RefAttributes<HTMLSpanElement>, "ref"> & React.RefAttributes<HTMLSpanElement>>;
    const AvatarImage: React.ForwardRefExoticComponent<Omit<AvatarPrimitive.AvatarImageProps & React.RefAttributes<HTMLImageElement>, "ref"> & React.RefAttributes<HTMLImageElement>>;
    const AvatarFallback: React.ForwardRefExoticComponent<Omit<AvatarPrimitive.AvatarFallbackProps & React.RefAttributes<HTMLSpanElement>, "ref"> & React.RefAttributes<HTMLSpanElement>>;
    export { Avatar, AvatarImage, AvatarFallback };
}
declare module "packages/lib/auth-client" {
    import { createAuthClient } from "better-auth/react";
    export const authClient: ReturnType<typeof createAuthClient>;
}
declare module "components/ui/alert" {
    import * as React from "react";
    import { type VariantProps } from "class-variance-authority";
    const Alert: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & VariantProps<(props?: {
        variant?: "default" | "destructive";
    } & import("class-variance-authority/dist/types").ClassProp) => string> & React.RefAttributes<HTMLDivElement>>;
    const AlertTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLParagraphElement>>;
    const AlertDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
    export { Alert, AlertTitle, AlertDescription };
}
declare module "components/login-dialog" {
    interface LoginDialogProps {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        onSuccess?: () => void;
    }
    export function LoginDialog({ open, onOpenChange, onSuccess }: LoginDialogProps): import("react/jsx-runtime").JSX.Element;
}
declare module "apps/web-app/settings/general/account-section" {
    interface AccountSectionProps {
    }
    export function AccountSection({}: AccountSectionProps): import("react/jsx-runtime").JSX.Element;
}
declare module "apps/web-app/settings/general/profile-form" {
    import * as z from "zod";
    const profileFormSchema: z.ZodObject<{
        username: z.ZodString;
        userId: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        username?: string;
        avatar?: string;
        userId?: string;
    }, {
        username?: string;
        avatar?: string;
        userId?: string;
    }>;
    export type ProfileFormValues = z.infer<typeof profileFormSchema>;
    export function ProfileForm(): import("react/jsx-runtime").JSX.Element;
}
declare module "apps/web-app/settings/store" {
    import { BackupServerFormValues } from "apps/web-app/settings/backup/page";
    import { ProfileFormValues } from "apps/web-app/settings/general/profile-form";
    interface ConfigState {
        profile: ProfileFormValues;
        setProfile: (profile: ProfileFormValues) => void;
        backupServer: BackupServerFormValues;
        setBackupServer: (backupServer: BackupServerFormValues) => void;
    }
    export const useConfigStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<ConfigState>, "persist"> & {
        persist: {
            setOptions: (options: Partial<import("zustand/middleware").PersistOptions<ConfigState, ConfigState>>) => void;
            clearStorage: () => void;
            rehydrate: () => void | Promise<void>;
            hasHydrated: () => boolean;
            onHydrate: (fn: (state: ConfigState) => void) => () => void;
            onFinishHydration: (fn: (state: ConfigState) => void) => () => void;
            getOptions: () => Partial<import("zustand/middleware").PersistOptions<ConfigState, ConfigState>>;
        };
    }>;
}
declare module "hooks/use-user-map" {
    export const useUserMap: () => {
        userMap: {
            [x: string]: {
                name: string;
                avatar: string;
            };
        };
    };
}
declare module "components/table/fields/colums" {
    import { GridCellKind, GridColumnIcon } from "@glideapps/glide-data-grid";
    export const defaultAllColumnsHandle: ({
        title: string;
        width: number;
        icon: GridColumnIcon;
        hasMenu: boolean;
        kind: GridCellKind;
        getContent: (rawData: any) => {
            kind: GridCellKind;
            data: any;
            allowOverlay: boolean;
        };
    } | {
        title: string;
        width: number;
        icon: GridColumnIcon;
        hasMenu: boolean;
        kind: GridCellKind;
        getContent: () => {
            kind: GridCellKind;
            allowOverlay: boolean;
        };
    })[];
}
declare module "components/table/views/grid/helper" {
    import { DataEditorProps, GridCellKind } from "@glideapps/glide-data-grid";
    import { IField } from "packages/lib/store/interface";
    import { defaultAllColumnsHandle } from "components/table/fields/colums";
    export const defaultConfig: Partial<DataEditorProps>;
    export function getColumnsHandleMap(): {
        [kind: string]: Omit<(typeof defaultAllColumnsHandle)[0], "getContent"> & {
            getContent: (data: any) => any;
        };
    };
    export const columnsHandleMap: {
        [kind: string]: Omit<{
            title: string;
            width: number;
            icon: import("@glideapps/glide-data-grid").GridColumnIcon;
            hasMenu: boolean;
            kind: GridCellKind;
            getContent: (rawData: any) => {
                kind: GridCellKind;
                data: any;
                allowOverlay: boolean;
            };
        } | {
            title: string;
            width: number;
            icon: import("@glideapps/glide-data-grid").GridColumnIcon;
            hasMenu: boolean;
            kind: GridCellKind;
            getContent: () => {
                kind: GridCellKind;
                allowOverlay: boolean;
            };
        }, "getContent"> & {
            getContent: (data: any) => any;
        };
    };
    export const getShowColumns: (uiColumns: IField[], options: {
        fieldWidthMap?: Record<string, number>;
        orderMap?: Record<string, number>;
        hiddenFields?: string[];
    }) => IField[];
    export const guessCellKind: (value: any) => GridCellKind.Uri | GridCellKind.Text | GridCellKind.Number | GridCellKind.Boolean;
    export const createTemplateTableSql: (tableName: string) => string;
    export const createTemplateTableColumnsSql: () => string;
    export const getScrollbarWidth: () => number;
}
declare module "components/table/views/grid/hooks/use-col" {
    import { GridColumn } from "@glideapps/glide-data-grid";
    import { IGridViewProperties, IView } from "packages/lib/store/IView";
    import { IField } from "packages/lib/store/interface";
    export const useColumns: (uiColumns: IField[], view?: IView<IGridViewProperties>) => {
        onColumnResize: (col: GridColumn, _newSize: number, colIndex: number, newSizeWithGrow: number) => void;
        onColumnMoved: (sourceIndex: number, targetIndex: number) => Promise<void>;
        columns: GridColumn[];
        showColumns: IField[];
    };
}
declare module "components/table/views/grid/hooks/use-data-source" {
    import { RowEditedCallback } from "components/table/views/grid/hooks/use-async-data";
    export const useDataSource: (tableName: string, databaseName: string) => {
        toCell: (rowData: any, col: number) => any;
        onEdited: RowEditedCallback<any>;
        findRowIndexInView: (rowId: string) => Promise<number>;
    };
}
declare module "components/table/views/grid/hooks/use-data-mutation" {
    import { MutableRefObject } from "react";
    import { DataEditorRef, EditableGridCell, Item, Rectangle } from "@glideapps/glide-data-grid";
    import { IView } from "packages/lib/store/IView";
    interface IUseDataMutationProps {
        gridRef: MutableRefObject<DataEditorRef | null>;
        visiblePagesRef: MutableRefObject<Rectangle>;
        dataRef: MutableRefObject<string[]>;
        rowIdsRef: MutableRefObject<string[]>;
        getRowDataByIndex: (index: number) => any;
        view: IView;
    }
    export const useDataMutation: ({ view, gridRef, dataRef, rowIdsRef, visiblePagesRef, getRowDataByIndex, }: IUseDataMutationProps) => {
        handleAddRow: () => Promise<number>;
        handleDelRows: (ranges: {
            startIndex: number;
            endIndex: number;
        }[]) => Promise<void>;
        onCellEdited: (cell: Item, newVal: EditableGridCell) => void;
        onCellsEdited: (newValues: readonly {
            location: Item;
            value: EditableGridCell;
        }[]) => boolean;
    };
}
declare module "components/table/views/grid/hooks/use-async-data" {
    import { DataEditorProps, DataEditorRef, EditableGridCell, GridCell, Item } from "@glideapps/glide-data-grid";
    import { MutableRefObject } from "react";
    import { IView } from "packages/lib/store/IView";
    export type RowRange = readonly [number, number];
    type RowCallback<T> = (range: RowRange, qs?: string) => Promise<readonly T[]>;
    type RowToCell<T> = (row: T, col: number) => GridCell;
    export type RowEditedCallback<T> = (cell: Item, newVal: EditableGridCell, rowData: T) => T | undefined;
    export function useAsyncData<TRowType>(data: {
        tableName: string;
        pageSize: number;
        maxConcurrency: number;
        getRowData: RowCallback<string>;
        getRowDataById: (id: string) => TRowType;
        toCell: RowToCell<TRowType>;
        gridRef: MutableRefObject<DataEditorRef | null>;
        viewCount: number;
        view: IView;
    }): Pick<DataEditorProps, "getCellContent" | "onVisibleRegionChanged" | "onCellEdited" | "onCellsEdited" | "getCellsForSelection"> & {
        handleAddRow: () => void;
        handleDelRows: (range: {
            startIndex: number;
            endIndex: number;
        }[]) => void;
        getRowByIndex: (index: number) => TRowType | undefined;
        getIndexByRowId: (rowId: string) => number;
    };
}
declare module "hooks/use-sql-worker" {
    export const useSqlWorker: () => import("@/worker/web-worker/DataSpace").DataSpace;
}
declare module "hooks/use-table" {
    import { RowRange } from "components/table/views/grid/hooks/use-async-data";
    import { FieldType } from "packages/lib/fields/const";
    import { IField } from "packages/lib/store/interface";
    export const useTableFields: (tableIdOrName: string | undefined) => {
        fields: IField<any>[];
        fieldMap: {
            [fieldId: string]: IField<any>;
        };
    };
    export const useTableViews: (tableId: string, databaseName?: string) => import("@/lib/store/IView").IView<any>[];
    export const useTableOperation: (tableName: string, databaseName: string) => {
        deleteRowsByIds: (ids: string[], tableName: string) => Promise<void>;
        getRowData: (range: RowRange, query?: string) => Promise<string[]>;
        getRowDataById: (rowId: string) => Record<string, any>;
        updateCell: (rowId: string, fieldId: string, value: any) => Promise<void>;
        addField: (fieldName: string, fieldType: FieldType, property?: any) => Promise<void>;
        updateFieldName: (tableColumnName: string, newName: string) => Promise<void>;
        changeFieldType: (field: IField, newType: FieldType) => Promise<void>;
        updateFieldProperty: (field: IField, property: any) => Promise<void>;
        deleteField: (tableColumnName: string) => Promise<void>;
        addRow: (_uuid?: string, data?: Record<string, any>, options?: {
            useFieldId?: boolean;
        }) => Promise<Record<string, any>>;
        deleteRowsByRange: (range: {
            startIndex: number;
            endIndex: number;
        }[], tableName: string, query: string) => Promise<void>;
        tableSchema: string;
        runQuery: (querySql: string, _tableName?: string) => Promise<Record<string, any>[]>;
        reload: () => Promise<void>;
        sqlite: import("@/worker/web-worker/DataSpace").DataSpace;
        views: import("@/lib/store/IView").IView<any>[];
        updateViews: () => Promise<void>;
    };
}
declare module "hooks/use-ui-columns" {
    import { IField } from "packages/lib/store/interface";
    export const useCurrentUiColumns: () => {
        uiColumns: IField<any>[];
        uiColumnMap: Map<string, IField>;
        updateUiColumns: (_tableName?: string) => Promise<void>;
        nameRawIdMap: Map<string, string>;
        rawIdNameMap: Map<string, string>;
        fieldRawColumnNameFieldMap: Record<string, IField>;
    };
    export const useUiColumns: (tableName: string | undefined, _databaseName?: string) => {
        uiColumns: IField<any>[];
        uiColumnMap: Map<string, IField>;
        updateUiColumns: (_tableName?: string) => Promise<void>;
        nameRawIdMap: Map<string, string>;
        rawIdNameMap: Map<string, string>;
        fieldRawColumnNameFieldMap: Record<string, IField>;
    };
}
declare module "apps/web-app/[database]/scripts/hooks/use-all-table-fields" {
    import { IField } from "packages/lib/store/interface";
    interface TableState {
        uiColumnsMap: Record<string, IField[]>;
        setUiColumns: (tableId: string, uiColumns: IField[]) => void;
    }
    export const useTableStore: import("zustand").UseBoundStore<import("zustand").StoreApi<TableState>>;
    export const useTablesUiColumns: (tableNames: string[], databaseName?: string) => {
        uiColumnsMap: Record<string, IField[]>;
    };
}
declare module "components/ai-chat/hooks" {
    import { IEmbedding } from "packages/worker/web-worker/meta-table/embedding";
    import { ICommand, IScript } from "packages/worker/web-worker/meta-table/script";
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    export const sysPrompts: {
        base: string;
        eidosBaseHelper: string;
        eidosActionCreator: string;
    };
    export const useUserPrompts: () => {
        prompts: IScript[];
    };
    export const useSystemPrompt: (currentSysPrompt: string, contextNodes?: ITreeNode[], contextEmbeddings?: IEmbedding[]) => {
        systemPrompt: string;
    };
    type Store = {
        currentSysPrompt: keyof typeof sysPrompts | string;
        setCurrentSysPrompt: (value: keyof typeof sysPrompts | string) => void;
    };
    export const useAIChatStore: import("zustand").UseBoundStore<import("zustand").StoreApi<Store>>;
    export const usePrompt: (scriptId: string) => IScript;
    export const useScriptCall: () => {
        handleScriptActionCall: (action: IScript, input: any, command?: ICommand) => Promise<void>;
    };
}
declare module "components/ai-chat/ai-input-editor/plugins/switch-prompt" {
    export function SwitchPromptPlugin(): JSX.Element | null;
}
declare module "components/ai-chat/ai-input-editor/index" {
    import { IEmbedding } from "packages/worker/web-worker/meta-table/embedding";
    import { Attachment, ChatRequestOptions, CreateMessage } from "ai";
    import { Message } from "ai/react";
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    interface InputEditorProps {
        disabled?: boolean;
        enableRAG?: boolean;
        append: (message: Message | CreateMessage, chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
        appendHiddenMessage: (messages: Message) => void;
        isLoading?: boolean;
        setContextNodes?: (nodes: ITreeNode[]) => void;
        setContextEmbeddings?: (embeddings: IEmbedding[]) => void;
        attachments?: Attachment[];
        setAttachments?: (attachments: Attachment[]) => void;
        uploadQueue?: string[];
    }
    export const nodeInfoMap: Map<string, ITreeNode>;
    export const AIInputEditor: ({ disabled, append, enableRAG, appendHiddenMessage, isLoading, setContextNodes, setContextEmbeddings, attachments, setAttachments, uploadQueue, }: InputEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/hooks/use-ext-blocks" {
    import { IScript } from "packages/worker/web-worker/meta-table/script";
    import { DocBlock } from "components/doc/blocks/interface";
    export type ExtBlock = DocBlock;
    export const useExtBlocks: () => DocBlock[];
    export const useEnabledExtBlocks: () => {
        loading: boolean;
        scripts: IScript[];
    };
}
declare module "components/doc/plugins/AIEditorPlugin/index" {
    export const AIEditorPlugin: (props: any) => any;
}
declare module "components/ui/skeleton" {
    function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;
    export { Skeleton };
}
declare module "components/doc/hooks/use-all-nodes" {
    export const useAllEditorNodes: () => any[];
    export const useLoadingExtBlocks: () => boolean;
}
declare module "components/doc/hooks/useEditorContext" {
    import { RangeSelection } from "lexical";
    export const useEditorStore: import("zustand").UseBoundStore<import("zustand").StoreApi<{
        isToolbarVisible: boolean;
        setIsToolbarVisible: (isToolbarVisible: boolean) => void;
        aiSelection: RangeSelection | null;
        setAISelection: (aiSelection: RangeSelection | null) => void;
        isAIToolsOpen: boolean;
        setIsAIToolsOpen: (isAIToolsOpen: boolean) => void;
    }>>;
}
declare module "components/doc/hooks/use-ext-plugins" {
    export const useEnabledExtDocPlugins: (disableExtPlugins?: boolean) => {
        loading: boolean;
    };
}
declare module "components/ui/alert-dialog" {
    import * as React from "react";
    import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
    const AlertDialog: React.FC<AlertDialogPrimitive.AlertDialogProps>;
    const AlertDialogTrigger: React.ForwardRefExoticComponent<AlertDialogPrimitive.AlertDialogTriggerProps & React.RefAttributes<HTMLButtonElement>>;
    const AlertDialogPortal: React.FC<AlertDialogPrimitive.AlertDialogPortalProps>;
    const AlertDialogOverlay: React.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogOverlayProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const AlertDialogContent: React.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
    const AlertDialogHeader: {
        ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    const AlertDialogFooter: {
        ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    const AlertDialogTitle: React.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogTitleProps & React.RefAttributes<HTMLHeadingElement>, "ref"> & React.RefAttributes<HTMLHeadingElement>>;
    const AlertDialogDescription: React.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>, "ref"> & React.RefAttributes<HTMLParagraphElement>>;
    const AlertDialogAction: React.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogActionProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
    const AlertDialogCancel: React.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogCancelProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
    export { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, };
}
declare module "components/thinking" {
    export const Thinking: () => import("react/jsx-runtime").JSX.Element;
}
declare module "apps/web-app/[database]/scripts/helper" {
    import z from "zod";
    import { IScript } from "packages/worker/web-worker/meta-table/script";
    export const getDescriptionFromCode: (code: string) => string;
    export const PromptEnableCheck: z.ZodObject<{
        model: z.ZodEffects<z.ZodString, string, string>;
        actions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        model?: string;
        actions?: string[];
    }, {
        model?: string;
        actions?: string[];
    }>;
    export const checkPromptEnable: (data: unknown) => {
        model?: string;
        actions?: string[];
    };
    export const getEditorLanguage: (script: IScript) => "markdown" | "typescript" | "javascript" | "typescriptreact" | "python";
    interface RegistryFile {
        path: string;
        type: string;
        content: string;
    }
    export const getV0Block: (link: string) => Promise<RegistryFile>;
    export const getScriptFromV0: (link: string) => Promise<IScript>;
    export const getDynamicPrompt: (bindings: IScript["bindings"]) => any;
    export const getSuggestedActions: (type: IScript["type"]) => {
        title: string;
        label: string;
        action: string;
    }[];
}
declare module "apps/web-app/[database]/scripts/hooks/use-script" {
    import { IScript } from "packages/worker/web-worker/meta-table/script";
    export const useScript: () => {
        addScript: (script: IScript) => Promise<void>;
        deleteScript: (id: string) => Promise<void>;
        updateScript: (script: Partial<IScript>) => Promise<void>;
        installScript: (script: IScript) => Promise<void>;
        installLoading: boolean;
        enableScript: (id: string) => Promise<void>;
        disableScript: (id: string) => Promise<void>;
    };
    export const useScriptById: (id: string) => IScript;
}
declare module "components/doc/hooks/use-all-doc-blocks" {
    export const useAllDocBlocks: () => import("@/components/doc/blocks/interface").DocBlock[];
}
declare module "components/doc/plugins/AIToolsPlugin/ai-action-list" {
    export enum AIActionEnum {
        INSERT_BELOW = "insert_below",
        REPLACE = "replace",
        TRY_AGAIN = "try_again"
    }
    interface AIActionListProps {
        onSelect: (action: AIActionEnum) => void;
    }
    export function AIActionList({ onSelect }: AIActionListProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/themes/default" {
    import type { EditorThemeClasses } from "lexical";
    import "./eidos_editor_theme.css";
    const theme: EditorThemeClasses;
    export default theme;
}
declare module "components/doc/plugins/MarkdownLoaderPlugin/index" {
    export const MarkdownLoaderPlugin: ({ markdown }: {
        markdown: string;
    }) => any;
}
declare module "components/doc/plugins/AIToolsPlugin/ai-msg-editor" {
    import "prismjs/components/prism-mermaid";
    export const AIContentEditor: ({ markdown }: {
        markdown: string;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/plugins/AIToolsPlugin/hooks/use-generate-chart" {
    export const generateChartConfig: (prompt: string, config: any) => Promise<{
        data?: Record<string, any>[];
        style?: {
            fill?: string;
            opacity?: number;
            stroke?: string;
            strokeWidth?: number;
        };
        type?: "area" | "line" | "bar" | "pie" | "scatter" | "radar" | "composed" | "treemap" | "radialBar" | "funnel" | "sankey";
        height?: string | number;
        width?: string | number;
        xAxis?: {
            label?: string;
            style?: {
                fill?: string;
                opacity?: number;
                stroke?: string;
                strokeWidth?: number;
            };
            type?: "number" | "category";
            dataKey?: string;
            domain?: [string | number, string | number, ...unknown[]];
        };
        yAxis?: {
            label?: string;
            style?: {
                fill?: string;
                opacity?: number;
                stroke?: string;
                strokeWidth?: number;
            };
            type?: "number" | "category";
            dataKey?: string;
            domain?: [string | number, string | number, ...unknown[]];
        };
        series?: {
            style?: {
                fill?: string;
                opacity?: number;
                stroke?: string;
                strokeWidth?: number;
            };
            name?: string;
            type?: string;
            dataKey?: string;
            stack?: boolean;
            smooth?: boolean;
        }[];
        showGrid?: boolean;
        showTooltip?: boolean;
        showLegend?: boolean;
        themeConfig?: Record<string, {
            label?: string;
            color?: string;
        }>;
    }>;
    export const useGenerateChartConfig: () => {
        isLoading: boolean;
        error: Error;
        config: any;
        generateConfig: (userPrompt: string, model?: string) => Promise<any>;
    };
}
declare module "components/doc/plugins/AIToolsPlugin/hooks/use-update-location" {
    import { LexicalEditor, RangeSelection } from "lexical";
    export const useUpdateLocation: (editor: LexicalEditor, selectionRef: React.MutableRefObject<RangeSelection | null>, boxRef: React.MutableRefObject<HTMLDivElement | null>) => {
        editorWidth: number;
    };
}
declare module "components/doc/plugins/AIToolsPlugin/hooks/use-builtIn-prompts" {
    import { TaskType } from "apps/web-app/settings/ai/hooks";
    export const useBuiltInPrompts: () => ({
        id: string;
        name: string;
        type: TaskType;
        icon: string;
        content: string;
        parameters?: undefined;
    } | {
        id: string;
        name: string;
        type: TaskType;
        icon: string;
        content: string;
        parameters: {
            name: string;
            key: string;
            value: string[];
            type: string;
            description: string;
            required: boolean;
        }[];
    })[];
}
declare module "components/doc/plugins/AIToolsPlugin/prompt-list" {
    interface PromptListProps {
        onPromptSelect: (prompt: string, model?: string, isCustom?: boolean) => void;
        onMakeItReal: () => void;
        onGenerateChart: () => void;
    }
    export function PromptList({ onPromptSelect, onMakeItReal, onGenerateChart, }: PromptListProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/plugins/AIToolsPlugin/ai-tools" {
    export function AITools({ cancelAIAction, content, }: {
        cancelAIAction: (flag?: boolean) => void;
        content: string;
    }): import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/plugins/AIToolsPlugin/index" {
    import { LexicalCommand } from "lexical";
    export const INSERT_AI_COMMAND: LexicalCommand<string>;
    export const AIToolsPlugin: (props: any) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/plugins/AutoLinkPlugin/index" {
    export default function LexicalAutoLinkPlugin(): JSX.Element;
}
declare module "components/doc/plugins/CodeHighlightPlugin/index" {
    export function CodeHighlightPlugin(): any;
}
declare module "components/doc/plugins/ComponentPickerMenuPlugin/hook" {
    import { TriggerFn } from "@lexical/react/LexicalTypeaheadMenuPlugin";
    export function useBasicTypeaheadTriggerMatch(trigger: string, { minLength, maxLength }: {
        minLength?: number;
        maxLength?: number;
    }): TriggerFn;
}
declare module "components/doc/plugins/ComponentPickerMenuPlugin/index" {
    import "./index.css";
    export function ComponentPickerMenuPlugin(): JSX.Element;
}
declare module "components/file-manager/helper" {
    export const getDragFileInfo: (data?: string) => {
        url: string;
        type: string;
    };
    export const getDragFileUrl: (dataTransfer: DataTransfer | null) => undefined | {
        url: string;
        type: string;
    };
    export const makeDataTransferData: (url: string) => string;
}
declare module "components/doc/plugins/DragDropPaste/index" {
    export default function DragDropPaste(): null;
}
declare module "components/doc/plugins/DraggableBlockPlugin/advanced-list" {
    export default function AdvancedListPlugin(): any;
}
declare module "components/doc/utils/setFloatingElemPositionForLinkEditor" {
    export function setFloatingElemPositionForLinkEditor(targetRect: ClientRect | null, floatingElem: HTMLElement, anchorElem: HTMLElement, verticalGap?: number, horizontalOffset?: number): void;
}
declare module "components/doc/plugins/FloatingLinkEditorPlugin/index" {
    /**
     * Copyright (c) Meta Platforms, Inc. and affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     */
    import "./index.css";
    export default function FloatingLinkEditorPlugin({ anchorElem, }: {
        anchorElem?: HTMLElement;
    }): JSX.Element | null;
}
declare module "components/doc/plugins/ListMaxIndentLevelPlugin/index" {
    type Props = Readonly<{
        maxDepth: number | null | undefined;
    }>;
    export default function ListMaxIndentLevelPlugin({ maxDepth }: Props): null;
}
declare module "components/doc/utils/selection" {
    import { BaseSelection } from "lexical";
    export function $duplicateParagraph(isUp: boolean): void;
    /**
     *
     * @param selection
     * @returns
     */
    export function getMarkdownFromSelection(selection: BaseSelection | null): string;
}
declare module "components/doc/plugins/ShortcutPlugin/index" {
    export function ShortcutPlugin(): any;
}
declare module "components/doc/plugins/TableCellResizer/index" {
    /**
     * Copyright (c) Meta Platforms, Inc. and affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     */
    import { ReactPortal } from "react";
    import "./index.css";
    export default function TableCellResizerPlugin(): null | ReactPortal;
}
declare module "components/doc/plugins/TableHoverActionsPlugin/index" {
    /**
     * Copyright (c) Meta Platforms, Inc. and affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     */
    import * as React from "react";
    export default function TableHoverActionsPlugin({ anchorElem, }: {
        anchorElem?: HTMLElement;
    }): React.ReactPortal | null;
}
declare module "components/doc/plugins/index" {
    export const AllPlugins: ({ disableExtPlugins, }: {
        disableExtPlugins?: boolean;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/custom/menu" {
    import { LexicalEditor, NodeKey } from "lexical";
    export const CustomBlockMenu: ({ nodeKey, editor, }: {
        nodeKey: NodeKey | null;
        editor: LexicalEditor;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/file/menu" {
    import { LexicalEditor, NodeKey } from "lexical";
    export const FileMenu: ({ nodeKey, editor, }: {
        nodeKey: NodeKey | null;
        editor: LexicalEditor;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/utils/guard" {
    /**
     * Copyright (c) Meta Platforms, Inc. and affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     */
    export function isHTMLElement(x: unknown): x is HTMLElement;
}
declare module "components/doc/plugins/DraggableBlockPlugin/$moveNode" {
    import { LexicalEditor, LexicalNode } from "lexical";
    export function $moveNode(draggedNode: LexicalNode, targetNode: LexicalNode, shouldInsertAfter: boolean, editor: LexicalEditor, event?: MouseEvent): void;
}
declare module "components/doc/utils/point" {
    /**
     * Copyright (c) Meta Platforms, Inc. and affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     */
    export class Point {
        private readonly _x;
        private readonly _y;
        constructor(x: number, y: number);
        get x(): number;
        get y(): number;
        equals({ x, y }: Point): boolean;
        calcDeltaXTo({ x }: Point): number;
        calcDeltaYTo({ y }: Point): number;
        calcHorizontalDistanceTo(point: Point): number;
        calcVerticalDistance(point: Point): number;
        calcDistanceTo(point: Point): number;
    }
    export function isPoint(x: unknown): x is Point;
}
declare module "components/doc/utils/rect" {
    /**
     * Copyright (c) Meta Platforms, Inc. and affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     */
    import { Point } from "components/doc/utils/point";
    type ContainsPointReturn = {
        result: boolean;
        reason: {
            isOnTopSide: boolean;
            isOnBottomSide: boolean;
            isOnLeftSide: boolean;
            isOnRightSide: boolean;
        };
    };
    export class Rect {
        private readonly _left;
        private readonly _top;
        private readonly _right;
        private readonly _bottom;
        constructor(left: number, top: number, right: number, bottom: number);
        get top(): number;
        get right(): number;
        get bottom(): number;
        get left(): number;
        get width(): number;
        get height(): number;
        equals({ top, left, bottom, right }: Rect): boolean;
        contains({ x, y }: Point): ContainsPointReturn;
        contains({ top, left, bottom, right }: Rect): boolean;
        intersectsWith(rect: Rect): boolean;
        generateNewRect({ left, top, right, bottom, }: {
            left?: number;
            top?: number;
            right?: number;
            bottom?: number;
        }): Rect;
        static fromLTRB(left: number, top: number, right: number, bottom: number): Rect;
        static fromLWTH(left: number, width: number, top: number, height: number): Rect;
        static fromPoints(startPoint: Point, endPoint: Point): Rect;
        static fromDOM(dom: HTMLElement): Rect;
    }
}
declare module "components/doc/plugins/DraggableBlockPlugin/helper" {
    /**
     * Copyright (c) Meta Platforms, Inc. and affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     */
    import { LexicalEditor } from "lexical";
    export const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";
    export const DRAG_DATA_FORMAT = "application/x-lexical-drag-block";
    export function getBlockElement(anchorElem: HTMLElement, editor: LexicalEditor, event: MouseEvent, draggedElement?: HTMLElement): HTMLElement | null;
    export function isOnMenu(element: HTMLElement): boolean;
    export function setMenuPosition(targetElem: HTMLElement | null, floatingElem: HTMLElement, anchorElem: HTMLElement): void;
    export function setDragImage(dataTransfer: DataTransfer, draggableBlockElem: HTMLElement): void;
    export function setTargetLine(targetLineElem: HTMLElement, targetBlockElem: HTMLElement, mouseY: number, anchorElem: HTMLElement, event: MouseEvent): void;
    export function hideTargetLine(targetLineElem: HTMLElement | null): void;
}
declare module "components/doc/plugins/DraggableBlockPlugin/turn-into-menu" {
    import { LexicalEditor, NodeKey } from "lexical";
    export const TurnIntoMenu: ({ editor, currentNodeKey, }: {
        editor: LexicalEditor;
        currentNodeKey: NodeKey | null;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/plugins/DraggableBlockPlugin/index" {
    import "./index.css";
    export function DraggableBlockPlugin({ anchorElem, }: {
        anchorElem?: HTMLElement;
    }): JSX.Element;
}
declare module "components/ui/toggle" {
    import * as React from "react";
    import * as TogglePrimitive from "@radix-ui/react-toggle";
    import { type VariantProps } from "class-variance-authority";
    const toggleVariants: (props?: {
        variant?: "default" | "outline";
        size?: "default" | "sm" | "lg";
    } & import("class-variance-authority/dist/types").ClassProp) => string;
    const Toggle: React.ForwardRefExoticComponent<Omit<TogglePrimitive.ToggleProps & React.RefAttributes<HTMLButtonElement>, "ref"> & VariantProps<(props?: {
        variant?: "default" | "outline";
        size?: "default" | "sm" | "lg";
    } & import("class-variance-authority/dist/types").ClassProp) => string> & React.RefAttributes<HTMLButtonElement>>;
    export { Toggle, toggleVariants };
}
declare module "components/doc/utils/getDOMRangeRect" {
    /**
     * Copyright (c) Meta Platforms, Inc. and affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     */
    export function getDOMRangeRect(nativeSelection: Selection, rootElement: HTMLElement): DOMRect;
}
declare module "components/doc/utils/setFloatingElemPosition" {
    export function setFloatingElemPosition(targetRect: DOMRect | null, floatingElem: HTMLElement, anchorElem: HTMLElement, isLink?: boolean, verticalGap?: number, horizontalOffset?: number): void;
}
declare module "components/doc/plugins/FloatingTextFormatToolbarPlugin/color-picker" {
    import { LexicalEditor } from "lexical";
    export const ColorPicker: ({ activeEditor, }: {
        activeEditor: LexicalEditor;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/plugins/FloatingTextFormatToolbarPlugin/toolbar" {
    import { LexicalEditor } from "lexical";
    export function TextFormatFloatingToolbar({ editor, anchorElem, isLink, isBold, isItalic, isUnderline, isCode, isStrikethrough, isSubscript, isSuperscript, }: {
        editor: LexicalEditor;
        anchorElem: HTMLElement;
        isBold: boolean;
        isCode: boolean;
        isItalic: boolean;
        isLink: boolean;
        isStrikethrough: boolean;
        isSubscript: boolean;
        isSuperscript: boolean;
        isUnderline: boolean;
    }): JSX.Element;
}
declare module "components/doc/plugins/FloatingTextFormatToolbarPlugin/index" {
    import "./index.css";
    export default function FloatingTextFormatToolbarPlugin({ anchorElem, }: {
        anchorElem?: HTMLElement;
    }): JSX.Element | null;
}
declare module "components/doc/plugins/SafeBottomPaddingPlugin/index" {
    export const SafeBottomPaddingPlugin: () => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/plugins/SelectionPlugin/use-keyboard-selection" {
    export function useKeyboardSelection(): {
        selectedKeySet: Set<string>;
    };
}
declare module "components/doc/plugins/SelectionPlugin/use-mouse-selection" {
    type BoxStyle = {
        display: string;
        left: string;
        top: string;
        width: string;
        height: string;
        border?: string;
        backgroundColor?: string;
        position: "absolute" | "relative" | "fixed";
        opacity?: number;
    };
    export function useMouseSelection(getSelectionItems: () => NodeListOf<Element>): {
        selectedKeySet: Set<string>;
        isSelecting: boolean;
        boxStyle: BoxStyle;
    };
}
declare module "components/doc/plugins/SelectionPlugin/index" {
    export const SelectionPlugin: () => import("react").ReactPortal;
}
declare module "components/doc/utils/invariant" {
    /**
     * Copyright (c) Meta Platforms, Inc. and affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     */
    export default function invariant(cond?: boolean, message?: string, ...args: string[]): asserts cond;
}
declare module "components/doc/plugins/TableActionMenuPlugin/helper" {
    /**
     * Copyright (c) Meta Platforms, Inc. and affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     */
    import { TableCellNode, TableSelection } from "@lexical/table";
    import { type ElementNode, type LexicalEditor } from "lexical";
    import "./index.css";
    export function computeSelectionCount(selection: TableSelection): {
        columns: number;
        rows: number;
    };
    export function $canUnmerge(): boolean;
    export function $cellContainsEmptyParagraph(cell: TableCellNode): boolean;
    export function $selectLastDescendant(node: ElementNode): void;
    export function currentCellBackgroundColor(editor: LexicalEditor): null | string;
}
declare module "components/doc/plugins/TableActionMenuPlugin/TableActionMenu" {
    import { TableCellNode } from "@lexical/table";
    export type TableCellActionMenuProps = Readonly<{
        contextRef: {
            current: null | HTMLElement;
        };
        onClose: () => void;
        setIsMenuOpen: (isOpen: boolean) => void;
        showColorPickerModal: (title: string, showModal: (onClose: () => void) => JSX.Element) => void;
        tableCellNode: TableCellNode;
        cellMerge: boolean;
    }>;
    export function TableActionMenu({ onClose, tableCellNode: _tableCellNode, setIsMenuOpen, contextRef, cellMerge, showColorPickerModal, }: TableCellActionMenuProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/plugins/TableActionMenuPlugin/index" {
    import { ReactPortal } from "react";
    import "./index.css";
    export default function TableActionMenuPlugin({ anchorElem, cellMerge, }: {
        anchorElem?: HTMLElement;
        cellMerge?: boolean;
    }): null | ReactPortal;
}
declare module "components/doc/editor" {
    import React from "react";
    interface EditorProps {
        docId?: string;
        isEditable: boolean;
        isActive?: boolean;
        namespace?: string;
        placeholder?: string;
        autoFocus?: boolean;
        title?: string;
        showTitle?: boolean;
        disableManuallySave?: boolean;
        onTitleChange?: (title: string) => void;
        disableSelectionPlugin?: boolean;
        disableSafeBottomPaddingPlugin?: boolean;
        disableUpdateTitle?: boolean;
        className?: string;
        beforeTitle?: React.ReactNode;
        afterTitle?: React.ReactNode;
        titleStyle?: React.CSSProperties;
        topComponent?: React.ReactNode;
        coverComponent?: React.ReactNode;
        propertyComponent?: React.ReactNode;
        plugins?: React.ReactNode;
        disableExtPlugins?: boolean;
    }
    export function InnerEditor(props: EditorProps): import("react/jsx-runtime").JSX.Element;
    export function Editor(props: EditorProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/mention/component" {
    export const MentionComponent: (props: {
        id: string;
        title?: string;
        disablePreview?: boolean;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/mention/node" {
    import { ReactNode } from "react";
    import { DecoratorNode, EditorConfig, LexicalEditor, NodeKey } from "lexical";
    export class MentionNode extends DecoratorNode<ReactNode> {
        __id: string;
        __title?: string;
        static getType(): string;
        static clone(node: MentionNode): MentionNode;
        constructor(id: string, title?: string, key?: NodeKey);
        getTextContent(): string;
        createDOM(): HTMLElement;
        updateDOM(): false;
        decorate(_editor: LexicalEditor, config: EditorConfig): ReactNode;
        static importJSON(data: any): MentionNode;
        exportJSON(): {
            id: string;
            title: string;
            type: string;
            version: number;
        };
        canInsertTextBefore(): boolean;
        canInsertTextAfter(): boolean;
    }
    export function $createMentionNode(id: string, title?: string): MentionNode;
    export function $isMentionNode(node: MentionNode | null | undefined): node is MentionNode;
}
declare module "components/doc/blocks/mention/index" {
    import { DocBlock } from "components/doc/blocks/interface";
    const _default_10: DocBlock;
    export default _default_10;
}
declare module "components/doc/blocks/toc/helper" {
    /**
     * [h1,h2,h3,h1,h2,h3] => [1,2,3,1,2,3]
     * [h2,h3,h1,h2,h3] => [1,2,1,2,3]
     * [h3,h1,h2,h3] => [1,1,2,3]
     * @param tableOfContents
     */
    export const makeTitleLevels: (tableOfContents: string[]) => number[];
}
declare module "components/doc/blocks/toc/component" {
    export const TableOfContentsComponent: () => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/toc/node" {
    import { DecoratorBlockNode, SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
    import { EditorConfig, ElementFormatType, LexicalEditor, LexicalNode, NodeKey, Spread } from "lexical";
    export type SerializedTOCNode = Spread<{}, SerializedDecoratorBlockNode>;
    export class TableOfContentsNode extends DecoratorBlockNode {
        static getType(): string;
        static clone(node: TableOfContentsNode): TableOfContentsNode;
        constructor(format?: ElementFormatType, key?: NodeKey);
        isKeyboardSelectable(): boolean;
        getTextContent(): string;
        createDOM(): HTMLElement;
        updateDOM(): false;
        static importJSON(data: SerializedTOCNode): TableOfContentsNode;
        exportJSON(): SerializedTOCNode;
        decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element;
    }
    export function $createTableOfContentsNode(format?: ElementFormatType): TableOfContentsNode;
    export function $isTableOfContentsNode(node: LexicalNode | null | undefined): node is TableOfContentsNode;
}
declare module "components/doc/blocks/toc/plugin" {
    import { LexicalCommand } from "lexical";
    export const INSERT_TOC_COMMAND: LexicalCommand<string>;
    export const TableOfContentsPlugin: () => any;
}
declare module "components/doc/blocks/toc/index" {
    import { DocBlock } from "components/doc/blocks/interface";
    const _default_11: DocBlock;
    export default _default_11;
}
declare module "components/doc/blocks/sync/plugin" {
    import { LexicalCommand } from "lexical";
    export const INSERT_SYNC_BLOCK_COMMAND: LexicalCommand<string>;
    export const SyncBlockPlugin: () => any;
}
declare module "components/doc/blocks/sync/index" {
    import { DocBlock } from "components/doc/blocks/interface";
    const _default_12: DocBlock;
    export default _default_12;
}
declare module "packages/lib/sqlite/sql-alter-column-type" {
    /**
     * 1. add new column with new type
     * 2. copy data from old column to new column
     * 3. rename old column to old column + "_old"
     * 4. rename new column to old column
     * 5. drop old column
     * @param tableName
     * @param columnName
     * @param newType
     */
    export const alterColumnType: (tableName: string, columnName: string, newType: "TEXT" | "REAL" | "INT") => string;
}
declare module "packages/worker/web-worker/meta-table/column" {
    import { FieldType } from "packages/lib/fields/const";
    import { IField } from "packages/lib/store/interface";
    import { BaseServerDatabase } from "packages/lib/sqlite/interface";
    import { BaseTable, BaseTableImpl } from "packages/worker/web-worker/meta-table/base";
    /**
     * define
     * 1. column: a real column in table
     * 2. field: a wrapper of column, with some additional properties which control the UI behavior
     *
     * this table is used to manage the mapping between column and field
     */
    export class ColumnTable extends BaseTableImpl implements BaseTable<IField> {
        name: string;
        createTableSql: string;
        JSONFields: string[];
        static getColumnTypeByFieldType(type: FieldType): any;
        add(data: IField): Promise<IField>;
        addField(data: IField): Promise<IField>;
        getColumn<T = any>(tableName: string, tableColumnName: string): Promise<IField<T> | null>;
        set(id: string, data: Partial<IField>): Promise<boolean>;
        del(id: string): Promise<boolean>;
        deleteField(tableName: string, tableColumnName: string): Promise<string[]>;
        /**
         * @param tableName tb_<uuid>
         */
        deleteByRawTableName(tableName: string, db?: BaseServerDatabase): Promise<void>;
        /**
         * Update formula column and handle dependencies
         * @param tableName Table name
         * @param tableColumnName Column name
         * @param property New property
         * @param fields All fields
         * @param db Database connection
         */
        private updateFormulaColumn;
        updateProperty(data: {
            tableName: string;
            tableColumnName: string;
            property: any;
            type: FieldType;
        }): Promise<void>;
        list(q: {
            table_name: string;
        }): Promise<IField[]>;
        static isColumnTypeChanged(oldType: FieldType, newType: FieldType): boolean;
        changeType(tableName: string, tableColumnName: string, newType: FieldType): Promise<void>;
    }
}
declare module "packages/lib/fields/helper" {
    import { FieldType } from "packages/lib/fields/const";
    export const isComputedField: (columnType: FieldType) => boolean;
    export const isAutoGeneratedField: (columnType: FieldType) => boolean;
}
declare module "hooks/use-sqlite-table-subscribe" {
    export const useSqliteTableSubscribe: (tableName: string) => void;
}
declare module "components/eui/sub-page-dialog" {
    import * as React from "react";
    import * as DialogPrimitive from "@radix-ui/react-dialog";
    const Dialog: React.FC<DialogPrimitive.DialogProps>;
    const DialogTrigger: React.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & React.RefAttributes<HTMLButtonElement>>;
    const DialogContent: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & {
        hideCloseButton?: boolean;
        hideMaximizeButton?: boolean;
        onMaximize?: () => void;
    } & React.RefAttributes<HTMLDivElement>>;
    const DialogHeader: {
        ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    const DialogFooter: {
        ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    const DialogTitle: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogTitleProps & React.RefAttributes<HTMLHeadingElement>, "ref"> & React.RefAttributes<HTMLHeadingElement>>;
    const DialogDescription: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>, "ref"> & React.RefAttributes<HTMLParagraphElement>>;
    export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, };
}
declare module "hooks/use-emoji" {
    export const useEmoji: () => {
        getEmoji: (value?: string) => Promise<any>;
    };
}
declare module "components/table/cell-editor/common" {
    import { SelectOption } from "packages/lib/fields/select";
    export const EmptyValue: () => import("react/jsx-runtime").JSX.Element;
    export const SelectOptionItem: ({ option, theme, }: {
        option: SelectOption;
        theme?: string;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/views/grid/cells/select-cell" {
    import { CustomCell, CustomRenderer, ProvideEditorCallback } from "@glideapps/glide-data-grid";
    import { SelectOption } from "packages/lib/fields/select";
    interface SelectCellProps {
        readonly kind: "select-cell";
        readonly value: string | null;
        readonly allowedValues: readonly SelectOption[];
        readonly readonly?: boolean;
    }
    export type SelectCell = CustomCell<SelectCellProps>;
    export const Editor: ReturnType<ProvideEditorCallback<SelectCell>>;
    const renderer: CustomRenderer<SelectCell>;
    export default renderer;
}
declare module "components/table/views/grid/cells/multi-select-cell" {
    import { CustomCell, CustomRenderer, ProvideEditorCallback } from "@glideapps/glide-data-grid";
    import { SelectOption } from "packages/lib/fields/select";
    interface MultiSelectCellProps {
        readonly kind: "multi-select-cell";
        readonly values: readonly string[] | null;
        readonly readonly?: boolean;
        readonly allowedValues: readonly SelectOption[];
    }
    export type MultiSelectCell = CustomCell<MultiSelectCellProps>;
    export const Editor: ReturnType<ProvideEditorCallback<MultiSelectCell>>;
    const renderer: CustomRenderer<MultiSelectCell>;
    export default renderer;
}
declare module "packages/lib/fields/multi-select" {
    import { MultiSelectCell } from "components/table/views/grid/cells/multi-select-cell";
    import { BaseField } from "packages/lib/fields/base";
    import { CompareOperator, FieldType } from "packages/lib/fields/const";
    import { SelectProperty } from "packages/lib/fields/select";
    type MultiSelectProperty = SelectProperty;
    export class MultiSelectField extends BaseField<MultiSelectCell, MultiSelectProperty, string> {
        static type: FieldType;
        get compareOperators(): CompareOperator[];
        get type(): FieldType;
        get options(): import("@/lib/fields/select").SelectOption[];
        addOption(name: string): import("@/lib/fields/select").SelectOption[];
        rawData2JSON(rawData: string | null): string[];
        /**
         * in database we store the tags as a string, so we need to convert it to an array of strings
         * e.g.
         * "tag1,tag2,tag3" => ["tag1", "tag2", "tag3"]
         * "tag1, tag2 with space" => ["tag1", "tag2 with space"]
         * @param rawData
         * @returns
         */
        getCellContent(rawData: string): MultiSelectCell;
        /**
         * @param text tag1,tag2
         * return tag1id,tag2id
         */
        cellData2RawData(cell: MultiSelectCell): {
            rawData: any;
            shouldUpdateColumnProperty?: undefined;
        } | {
            rawData: string;
            shouldUpdateColumnProperty: boolean;
        };
        createFieldProperty(): {
            options: any[];
        };
    }
}
declare module "packages/lib/fields/select" {
    import type { SelectCell } from "components/table/views/grid/cells/select-cell";
    import { BaseField } from "packages/lib/fields/base";
    import { CompareOperator, FieldType } from "packages/lib/fields/const";
    import { MultiSelectCell } from "components/table/views/grid/cells/multi-select-cell";
    export type SelectOption = {
        id: string;
        name: string;
        color: string;
    };
    export type SelectProperty = {
        options: SelectOption[];
        defaultOption?: string;
    };
    export class SelectField extends BaseField<SelectCell, SelectProperty> {
        static type: FieldType;
        static colors: {
            light: {
                name: string;
                value: string;
            }[];
            dark: {
                name: string;
                value: string;
            }[];
        };
        static defaultColor: string;
        static colorNameValueMap: {
            light: Record<string, string>;
            dark: Record<string, string>;
        };
        /**
         * @param colorName name of the color. eg "default" | "gray"
         * @param theme theme of the color. eg "light" | "dark"
         * @returns hex value of the color. eg "#cccccc"
         */
        static getColorValue(colorName: string, theme?: "light" | "dark", opacity?: number): string;
        get compareOperators(): CompareOperator[];
        get options(): SelectOption[];
        rawData2JSON(rawData: any): string;
        getCellContent(rawData: string): SelectCell;
        /**
         * getCellContentViaLookup is used when the field is used as a lookup target field.
         * lookup will convert the raw data to a multi-select cell, value split by comma.
         * @param rawData
         * @returns
         */
        getCellContentViaLookup(rawData: string): MultiSelectCell;
        cellData2RawData(cell: SelectCell): {
            rawData: string;
            shouldUpdateColumnProperty?: undefined;
        } | {
            rawData: string;
            shouldUpdateColumnProperty: boolean;
        };
        static getDefaultFieldProperty(): {
            options: any[];
        };
        static generateOptionsByNames(names: string[]): {
            id: string;
            name: string;
            color: string;
        }[];
        changeOptionName(id: string, newName: string): void;
        changeOptionColor(id: string, newColor: string): void;
        static getNextAvailableColor(existingOptions: SelectOption[]): string;
        addOption(name: string): SelectOption[];
        deleteOption(id: string): void;
    }
}
declare module "components/ui/checkbox" {
    import * as React from "react";
    import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
    const Checkbox: React.ForwardRefExoticComponent<Omit<CheckboxPrimitive.CheckboxProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
    export { Checkbox };
}
declare module "components/table/hooks/use-change-effect" {
    const useChangeEffect: typeof import("react").useEffect | typeof import("react").useLayoutEffect;
    export default useChangeEffect;
}
declare module "components/table/cell-editor/checkbox-editor" {
    interface ICheckboxEditorProps {
        value: boolean;
        onChange: (value: boolean) => void;
        isEditing: boolean;
    }
    export const CheckboxEditor: ({ value, onChange }: ICheckboxEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/cell-editor/date-editor" {
    interface IDateEditorProps {
        value: string;
        onChange: (value: string) => void;
        isEditing: boolean;
    }
    export const DateEditor: ({ value, onChange, isEditing, }: IDateEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/cell-editor/file-editor" {
    import { FileCell } from "components/table/views/grid/cells/file/file-cell";
    interface IFileEditorProps {
        value: FileCell;
        onChange: (value: FileCell) => void;
    }
    export const FileEditor: ({ value, onChange, }: IFileEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/cell-editor/multi-select-editor" {
    import { SelectOption } from "packages/lib/fields/select";
    interface IMultiSelectEditorProps {
        value: string;
        onChange: (value: string) => void;
        options: SelectOption[];
        isEditing: boolean;
    }
    export const MultiSelectEditor: ({ value, onChange, options, isEditing, }: IMultiSelectEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/cell-editor/rating-editor" {
    interface IRatingEditorProps {
        value: number;
        onChange: (value: number) => void;
        isEditing: boolean;
    }
    export const RatingEditor: ({ value, onChange }: IRatingEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/cell-editor/select-editor" {
    import { SelectOption } from "packages/lib/fields/select";
    interface ISelectEditorProps {
        value: string;
        onChange: (value: string) => void;
        options: SelectOption[];
        isEditing: boolean;
    }
    export const SelectEditor: ({ value, onChange, options, isEditing, }: ISelectEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/cell-editor/text-base-editor" {
    interface ITextBaseEditorProps {
        value: string | null;
        onChange: (value: string | null) => void;
        type?: "text" | "number" | "url";
        isEditing: boolean;
    }
    export const TextBaseEditor: ({ value, isEditing, onChange, type, }: ITextBaseEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/cell-editor/url-editor" {
    interface IUrlEditorProps {
        value: string | null;
        onChange: (value: string | null) => void;
        isEditing: boolean;
    }
    export const UrlEditor: ({ value, isEditing, onChange }: IUrlEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/cell-editor/user-profile-editor" {
    interface IUserProfileEditorProps {
        value: string;
        onChange: (value: string) => void;
        isEditing: boolean;
    }
    export const UserProfileEditor: ({ value }: IUserProfileEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/cell-editor/index" {
    import { FieldType } from "packages/lib/fields/const";
    import { IField } from "packages/lib/store/interface";
    export const CellEditorMap: Record<FieldType, React.FC<{
        isEditing: boolean;
        value: any;
        type?: any;
        onChange: (value: any) => void;
    }> | null>;
    interface ICellEditorProps {
        field: IField;
        value: any;
        onChange: (value: any) => void;
        className?: string;
        editorMode?: boolean;
        disableTextBaseEditor?: boolean;
        disabled?: boolean;
    }
    export const CellEditor: ({ field, value, onChange, className, editorMode, disableTextBaseEditor, disabled, }: ICellEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc-property/hook" {
    export const useRowDataOperation: () => {
        getProperty: (tableId: string, rowId: string) => Promise<Record<string, any>>;
        setProperty: (tableId: string, rowId: string, data: Record<string, any>) => Promise<void>;
    };
    export const useDocProperty: (data: {
        tableId: string;
        docId: string;
    }) => {
        properties: {
            [x: string]: any;
        };
        setProperty: (data: Record<string, any>) => Promise<void>;
    };
}
declare module "components/doc-property/index" {
    interface IDocPropertyProps {
        docId: string;
        tableId: string;
    }
    export const DocProperty: (props: IDocPropertyProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/folder/folder" {
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    export const FolderComponent: ({ folderId, setFolder: appendFolder, currentNode, index, folderList, setCurrentNode, setCurrentIndex, }: {
        folderList: (string | undefined)[];
        index: number;
        folderId?: string;
        setFolder: (fid: string, index: number) => void;
        currentNode: ITreeNode | null;
        setCurrentNode: (node: ITreeNode) => void;
        setCurrentIndex: (index: number) => void;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/folder/node-detail" {
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    export const NodeDetail: ({ currentNode, }: {
        currentNode: ITreeNode | null;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/folder/index" {
    export const FolderTree: ({ folderId }: {
        folderId?: string;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "apps/web-app/[database]/[node]/hooks/use-generate-title" {
    export function useGenerateTitle(): {
        generateTitle: (content: string) => Promise<string>;
        isLoading: boolean;
        title: string;
    };
}
declare module "apps/web-app/[database]/[node]/node-cover" {
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    export const NodeCover: (props: {
        node: ITreeNode;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "apps/web-app/[database]/[node]/node-restore" {
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    export const NodeRestore: ({ node }: {
        node: ITreeNode | null;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "apps/web-app/[database]/[node]/page" {
    export const NodeComponent: ({ nodeId, isRootPage, }: {
        nodeId?: string;
        isRootPage?: boolean;
    }) => import("react/jsx-runtime").JSX.Element;
    export default function TablePage(): import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/hooks/use-table-search-store" {
    export interface SearchMatch {
        column: string;
        snippet: string;
    }
    export interface SearchResult {
        row: Record<string, any>;
        matches: SearchMatch[];
        rowIndex: number;
    }
    export interface SemanticSearchResultData extends Record<string, any> {
        _id: string;
        title: string;
        _distance?: number;
    }
    export interface SemanticSearchResult {
        meta: {
            page: number;
            pageSize: number;
            embeddingFieldId: string;
        };
        results: SemanticSearchResultData[];
    }
    interface TableSearchState {
        searchQuery: string;
        showSearch: boolean;
        searchResults: SearchResult[];
        currentSearchIndex: number;
        totalMatches: number;
        searchTime: number;
        currentPage: number;
        totalPages: number;
        isLoadingMore: boolean;
        isSemanticSearchActive: boolean;
        isSemanticSearching: boolean;
        semanticSearchResult: SemanticSearchResult;
        semanticSearchSelectedIndex: number;
        setSearchQuery: (query: string) => void;
        setShowSearch: (show: boolean) => void;
        setSearchResults: (results: SearchResult[], startIndex: number) => void;
        initializeSearchResults: (total: number) => void;
        setCurrentSearchIndex: (value: number | ((prev: number) => number)) => void;
        setTotalMatches: (total: number) => void;
        setSearchTime: (time: number) => void;
        setCurrentPage: (page: number) => void;
        clearSearchResults: () => void;
        clearSearch: () => void;
        setIsSemanticSearchActive: (active: boolean) => void;
        setIsSemanticSearching: (searching: boolean) => void;
        setSemanticSearchResult: (results: SemanticSearchResult) => void;
        setSemanticSearchSelectedIndex: (index: number | ((prev: number) => number)) => void;
    }
    export const useTableSearchStore: import("zustand").UseBoundStore<import("zustand").StoreApi<TableSearchState>>;
}
declare module "components/common-menu-item" {
    export const CommonMenuItem: ({ className, ...props }: any) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/view-field/view-field-item" {
    import { type FC } from "react";
    import "./index.css";
    import { IField } from "packages/lib/store/interface";
    export const ItemTypes: {
        CARD: string;
    };
    export interface CardProps {
        id: any;
        text: string;
        index: number;
        isHidden: boolean;
        field: IField;
        moveCard: (dragIndex: number, hoverIndex: number) => void;
        onToggleHidden: (id: any) => void;
    }
    export const FieldItemCard: FC<CardProps>;
}
declare module "components/table/view-field/view-field" {
    import { IView } from "packages/lib/store/IView";
    import { IField } from "packages/lib/store/interface";
    export interface ContainerState {
        cards: IField[];
    }
    export const ViewField: (props: {
        view?: IView;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/view-filter-editor/view-filter-group-editor" {
    import { BinaryOperator } from "packages/lib/fields/const";
    import { IField } from "packages/lib/store/interface";
    import { IGroupFilterValue } from "components/table/view-filter-editor/interface";
    interface IViewFilterGroupEditorProps {
        value: IGroupFilterValue;
        onChange: (value: IGroupFilterValue) => void;
        fields: IField[];
        depth?: number;
        parentOperator: BinaryOperator;
    }
    export const ViewFilterGroupEditor: ({ value: _value, onChange, fields, depth, parentOperator, }: IViewFilterGroupEditorProps) => import("react/jsx-runtime").JSX.Element;
    export const OpSelector: ({ value, onChange, }: {
        value: BinaryOperator;
        onChange: (value: BinaryOperator) => void;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/fields/field-compare-selector" {
    import { CompareOperator } from "packages/lib/fields/const";
    import { IField } from "packages/lib/store/interface";
    interface IFieldCompareSelectorProps {
        field?: IField;
        value: CompareOperator;
        onChange: (value: CompareOperator) => void;
    }
    export const FieldCompareSelector: ({ field, value, onChange, }: IFieldCompareSelectorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/view-filter-editor/view-filter-item-editor" {
    import { IField } from "packages/lib/store/interface";
    import { IFilterValue } from "components/table/view-filter-editor/interface";
    interface IViewFilterItemEditorProps {
        value?: IFilterValue;
        onChange: (value: IFilterValue) => void;
        onDelete?: () => void;
        fields: IField[];
    }
    export const ViewFilterItemEditor: ({ value, onChange, onDelete, fields, }: IViewFilterItemEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/view-filter-editor/view-filter-editor" {
    import { IField } from "packages/lib/store/interface";
    import "./filter.css";
    import { IFilterValue, IGroupFilterValue } from "components/table/view-filter-editor/interface";
    interface IViewFilterEditorProps {
        value: IFilterValue | IGroupFilterValue;
        onChange: (value: IFilterValue | IGroupFilterValue) => void;
        fields: IField[];
        handleClearFilter?: () => void;
        depth?: number;
    }
    export const ViewFilterEditor: ({ value: _value, onChange, fields, handleClearFilter, depth, }: IViewFilterEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/view-filter" {
    import { IView } from "packages/lib/store/IView";
    export const ViewFilter: (props: {
        view: IView;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/ui/collapsible" {
    import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
    const Collapsible: import("react").ForwardRefExoticComponent<CollapsiblePrimitive.CollapsibleProps & import("react").RefAttributes<HTMLDivElement>>;
    const CollapsibleTrigger: import("react").ForwardRefExoticComponent<CollapsiblePrimitive.CollapsibleTriggerProps & import("react").RefAttributes<HTMLButtonElement>>;
    const CollapsibleContent: import("react").ForwardRefExoticComponent<CollapsiblePrimitive.CollapsibleContentProps & import("react").RefAttributes<HTMLDivElement>>;
    export { Collapsible, CollapsibleTrigger, CollapsibleContent };
}
declare module "components/table/views/doc-list/properties" {
    export const DocListViewProperties: (props: any) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/views/shared/cover-preview-field" {
    import { useForm } from "react-hook-form";
    interface CoverPreviewFieldProps {
        form: ReturnType<typeof useForm>;
        viewId: string;
        tableId: string;
        updateView: (viewId: string, data: any) => void;
        viewProperties: any;
        namespace?: "gallery" | "kanban";
    }
    export const CoverPreviewField: ({ form, viewId, tableId, updateView, viewProperties, namespace, }: CoverPreviewFieldProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/views/gallery/properties" {
    export interface IGalleryViewProperties {
        hideEmptyFields?: boolean;
        coverPreview?: null | string | "content" | "cover";
        fitContent?: boolean;
    }
    export const GalleryViewProperties: (props: {
        viewId: string;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/views/grid/properties" {
    export const GridViewProperties: (props: any) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/views/kanban/properties" {
    export interface IKanbanViewProperties {
        groupByField?: string;
        cardSize?: "small" | "medium" | "large";
    }
    export const KanbanViewProperties: ({ viewId }: {
        viewId: string;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/view-editor/view-layout" {
    import React from "react";
    import { ViewTypeEnum } from "packages/lib/store/IView";
    export const ViewLayout: (props: {
        icon: React.FC;
        viewType: ViewTypeEnum;
        viewId: string;
        title: string;
        isActive?: boolean;
        disabled?: boolean;
        onClick?: () => void;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/view-editor/view-editor" {
    import { IView } from "packages/lib/store/IView";
    interface IViewEditorProps {
        setEditDialogOpen: (open: boolean) => void;
        view: IView;
    }
    export const ViewEditor: ({ setEditDialogOpen, view }: IViewEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/view-item" {
    import { IView } from "packages/lib/store/IView";
    interface IViewItemProps {
        view: IView;
        isActive: boolean;
        jump2View: (viewId: string) => void;
        deleteView: () => void;
        disabledDelete?: boolean;
    }
    export const ViewIconMap: {
        grid: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
        gallery: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
        doc_list: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
        kanban: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    };
    export const ViewItem: ({ view, isActive, jump2View, deleteView, disabledDelete, }: IViewItemProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "hooks/use-readonly-sqlite" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    interface SqliteStore {
        readonlySqlite: DataSpace | undefined;
        setReadSqliteProxy: (proxy: DataSpace) => void;
    }
    export const useReadSqliteStore: import("zustand").UseBoundStore<import("zustand").StoreApi<SqliteStore>>;
    export const useReadonlySqlite: () => DataSpace;
}
declare module "components/table/hooks/use-table-search" {
    export const useTableSearch: (viewId: string) => {
        searchQuery: string;
        setSearchQuery: (query: string) => void;
        showSearch: boolean;
        setShowSearch: (show: boolean) => void;
        isSearching: boolean;
    };
}
declare module "components/table/hooks/use-table-semantic-search" {
    export const useTableSemanticSearch: () => {
        search: (params: {
            query: string;
            viewId?: string;
            page?: number;
            pageSize?: number;
        }) => Promise<{
            meta: {
                embeddingFieldId: string;
                page: number;
                pageSize: number;
            };
            results: any;
        }>;
    };
}
declare module "components/ui/aspect-ratio" {
    import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";
    const AspectRatio: import("react").ForwardRefExoticComponent<AspectRatioPrimitive.AspectRatioProps & import("react").RefAttributes<HTMLDivElement>>;
    export { AspectRatio };
}
declare module "components/table/semantic-search-results-list" {
    import { RefObject } from "react";
    import { SemanticSearchResult, SemanticSearchResultData } from "components/table/hooks/use-table-search-store";
    interface SemanticSearchResultsListProps {
        isSearching: boolean;
        results: SemanticSearchResultData[] | undefined;
        meta: SemanticSearchResult["meta"] | undefined;
        selectedIndex: number;
        onResultClick: (result: SemanticSearchResultData) => void;
        onResultMouseEnter: (index: number) => void;
        listRef: RefObject<HTMLUListElement>;
    }
    export const SemanticSearchResultsList: ({ isSearching, results, meta, selectedIndex, onResultClick, onResultMouseEnter, listRef, }: SemanticSearchResultsListProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/view-search" {
    import { IView } from "packages/lib/store/IView";
    export const ViewSearch: (props: {
        view: IView;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/view-sort" {
    import { IView } from "packages/lib/store/IView";
    export const ViewSort: ({ view }: {
        view?: IView;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/view-toolbar" {
    export const ViewToolbar: (props: {
        tableName: string;
        space: string;
        isEmbed: boolean;
        isReadOnly?: boolean;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "packages/lib/sqlite/sql-parser" {
    export const getColumnsFromQuery: (sql?: string) => import("pgsql-ast-parser").SelectedColumn[];
    export const replaceQueryTableName: (query: string, tableNameMap: Record<string, string>) => string;
    export const replaceWithFindIndexQuery: (query: string, rowId: string) => string;
    /**
     * transform sql query replace column name with columnNameMap
     * @param sql
     * @param columnNameMap
     * @returns transformed sql
     */
    export const transformSql: (sql: string, rawTableName: string, columnNameMap: Map<string, string>) => string;
}
declare module "components/table/views/gallery/hooks" {
    import { IView } from "packages/lib/store/IView";
    type RowData = Record<string, any> & {
        _id: string;
        title?: string;
    };
    export const useGalleryViewData: (view: IView) => {
        data: string[];
        list: RowData[];
        loading: boolean;
    };
}
declare module "components/table/views/doc-list/index" {
    import { IView } from "packages/lib/store/IView";
    interface IDocListViewProps {
        space: string;
        tableName: string;
        view: IView;
    }
    export function DocListView(props: IDocListViewProps): import("react/jsx-runtime").JSX.Element;
}
declare module "hooks/use-all-extensions" {
    import { IScript } from "packages/worker/web-worker/meta-table/script";
    export const useAllExtensions: (space: string) => IScript[];
}
declare module "components/table/views/grid/script-context-menu" {
    export const ScriptContextMenu: ({ getRows, }: {
        getRows: () => any[] | undefined;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/utils/helper" {
    import { EditorState, Klass, LexicalNode, NodeMap } from "lexical";
    import { ExtBlock } from "components/doc/hooks/use-ext-blocks";
    /**
     * some extension blocks want to transform the code with specific language to their own node
     * we cant use $convertFromMarkdownString to transform the code block, cause there are some bugs in lexical
     * https://github.com/facebook/lexical/issues/2564
     * we need to transform the code block manually, after the markdown string is converted to nodes.
     * we can replace the code block with the node created by the extension block
     *
     * if a ext block define `markdownLanguage`, it will be used to match the code block with the same language
     * @param extBlocks
     */
    export const $transformExtCodeBlock: (extBlocks: ExtBlock[]) => void;
    export type TypeToNodeMap = Map<string, NodeMap>;
    export function getCachedTypeToNodeMap(editorState: EditorState): TypeToNodeMap;
    export function getNodesOfType<T extends LexicalNode>(klass: Klass<T>, editorState: EditorState): Array<T>;
    export const getFirstImageUrl: (editorState: EditorState) => string;
}
declare module "components/table/views/shared/card-cover" {
    import { IField } from "packages/lib/store/interface";
    interface GalleryCardCoverProps {
        item: any;
        coverField?: IField;
        coverPreview?: string;
        fitContent?: boolean;
        rawIdNameMap: Map<string, string>;
    }
    export const GalleryCardCover: ({ item, coverField, coverPreview, rawIdNameMap, fitContent, }: GalleryCardCoverProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/views/shared/data-card" {
    import { IField } from "packages/lib/store/interface";
    import { IGalleryViewProperties } from "components/table/views/gallery/properties";
    interface DataCardProps {
        item: Record<string, any>;
        coverField?: IField;
        rawIdNameMap: Map<string, string>;
        style?: React.CSSProperties;
        hiddenFields?: string[];
        properties?: IGalleryViewProperties;
        showFields: IField[];
        tableId: string;
        space: string;
        uiColumnMap: Map<string, IField>;
        padding?: number;
        cardClassName?: string;
        hideCover?: boolean;
    }
    export const DataCard: ({ item, coverField, rawIdNameMap, style, hiddenFields, properties, showFields, tableId, space, uiColumnMap, padding, cardClassName, hideCover, }: DataCardProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/views/gallery/gallery-card" {
    import { IField } from "packages/lib/store/interface";
    import { IGalleryViewProperties } from "components/table/views/gallery/properties";
    interface ICardProps<T> {
        columnIndex: number;
        rowIndex: number;
        style: React.CSSProperties;
        data: T;
    }
    export interface IGalleryCardProps {
        properties?: IGalleryViewProperties;
        items: string[];
        columnCount: number;
        uiColumns: IField[];
        showFields: IField[];
        uiColumnMap: Map<string, IField>;
        rawIdNameMap: Map<string, string>;
        tableId: string;
        space: string;
        hiddenFieldIcon?: boolean;
        hiddenField?: boolean;
        hiddenFields?: string[];
    }
    export const GalleryCard: ({ columnIndex, rowIndex, style, data, }: ICardProps<IGalleryCardProps>) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/views/gallery/utils" {
    import { IField } from "packages/lib/store/interface";
    export const getColumnWidthAndCount: (containerWith: number, isMobile?: boolean) => {
        cardWidth: number;
        columnCount: number;
    };
    export const computeCardHeight: (allColumnSize: number) => number;
    export const shouldShowField: (value: any, field: IField) => boolean;
}
declare module "components/table/views/gallery/index" {
    import { IView } from "packages/lib/store/IView";
    import { IGalleryViewProperties } from "components/table/views/gallery/properties";
    interface IGalleryViewProps {
        space: string;
        tableName: string;
        view: IView<IGalleryViewProperties>;
    }
    export default function GalleryView({ tableName, space, view, }: IGalleryViewProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/views/grid/cells/rating-cell" {
    import { CustomCell, CustomRenderer } from "@glideapps/glide-data-grid";
    interface RatingCellProps {
        readonly kind: "rating-cell";
        readonly rating: number;
    }
    export type RatingCell = CustomCell<RatingCellProps>;
    const renderer: CustomRenderer<RatingCell>;
    export default renderer;
}
declare module "components/table/views/grid/cells/range-cell" {
    import { type CustomCell, type CustomRenderer } from "@glideapps/glide-data-grid";
    interface RangeCellProps {
        readonly kind: "range-cell";
        readonly value: number;
        readonly min: number;
        readonly max: number;
        readonly step: number;
        readonly label?: string;
        readonly measureLabel?: string;
        readonly color?: string;
    }
    export type RangeCell = CustomCell<RangeCellProps>;
    const renderer: CustomRenderer<RangeCell>;
    export default renderer;
}
declare module "components/table/views/grid/cells/index" {
    export const customCells: (import("@glideapps/glide-data-grid").CustomRenderer<import("@/components/table/views/grid/cells/user-profile-cell").UserProfileCell> | import("@glideapps/glide-data-grid").CustomRenderer<import("@/components/table/views/grid/cells/date-picker-cell").DatePickerCell> | import("@glideapps/glide-data-grid").CustomRenderer<import("@/components/table/views/grid/cells/link/link-cell").LinkCell> | import("@glideapps/glide-data-grid").CustomRenderer<import("@/components/table/views/grid/cells/select-cell").SelectCell> | import("@glideapps/glide-data-grid").CustomRenderer<import("@/components/table/views/grid/cells/multi-select-cell").MultiSelectCell> | import("@glideapps/glide-data-grid").CustomRenderer<import("@/components/table/views/grid/cells/rating-cell").RatingCell> | import("@glideapps/glide-data-grid").CustomRenderer<import("@/components/table/views/grid/cells/range-cell").RangeCell> | import("@glideapps/glide-data-grid").CustomRenderer<import("@/components/table/views/grid/cells/file/file-cell").FileCell>)[];
    export const cellRenderMap: any;
}
declare module "components/table/views/grid/grid-context-menu" {
    import { IField } from "packages/lib/store/interface";
    export function GridContextMenu({ children, handleDelRows, getRowByIndex, getFieldByIndex, openAItools, }: {
        getFieldByIndex: (index: number) => IField;
        handleDelRows: (ranges: {
            startIndex: number;
            endIndex: number;
        }[]) => void;
        getRowByIndex: (index: number) => any;
        children: React.ReactNode;
        openAItools: () => void;
    }): import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/views/grid/hooks/use-drop" {
    import { GridCell, Item } from "@glideapps/glide-data-grid";
    interface IProps {
        setCellValue: (col: number, row: number, value: any) => void;
        getCellContent: (cell: Item) => GridCell;
    }
    export const useDrop: (props: IProps) => {
        onDragLeave: () => void;
        onDrop: (cell: Item, dataTransfer: DataTransfer | null) => void;
        onDragOverCell: (cell: Item, dataTransfer: DataTransfer | null) => void;
        highlights: readonly import("@glideapps/glide-data-grid").Highlight[];
    };
}
declare module "components/table/views/grid/hooks/use-freeze-line" {
    import { GridColumn } from "@glideapps/glide-data-grid";
    import React from "react";
    import { IGridViewProperties, IView } from "packages/lib/store/IView";
    interface UseFreezeLineProps {
        gridRef: React.RefObject<HTMLElement | null>;
        currentView: IView<IGridViewProperties> | null | undefined;
        columns: readonly GridColumn[] | undefined;
    }
    export const ROW_NUMBER_COL_WIDTH = 48;
    export function useFreezeLine({ gridRef, currentView, columns, }: UseFreezeLineProps): {
        freezeHandleRef: React.MutableRefObject<HTMLDivElement>;
        freezeHandleLeft: number;
        freezeColumns: number;
        handleMouseDown: (event: React.MouseEvent) => void;
        isDragging: boolean;
        isHovering: boolean;
        handleMouseEnter: () => void;
        handleMouseLeave: () => void;
        HOVER_TARGET_WIDTH: number;
        previewFreezeColumns: number;
        previewLinePosition: number;
    };
}
declare module "components/table/views/grid/hooks/use-grid-search" {
    import { IField } from "packages/lib/store/interface";
    import { Item } from "@glideapps/glide-data-grid";
    export const useGridSearch: (showColumns: IField[], getColumnIndexByColumnName: (fieldName: string) => number) => {
        formattedSearchResults: Item[];
        currentCell: Item;
    };
}
declare module "components/table/views/grid/hooks/use-highlight-row" {
    import { DataEditorProps } from "@glideapps/glide-data-grid";
    import { IField } from "packages/lib/store/interface";
    /**
     * Custom hook to subscribe to highlight row events from the worker.
     *
     * This hook internally manages the custom highlight regions state.
     *
     * @param tableName - The current table name.
     * @param getIndexByRowId - Callback to get the row index by a given row id.
     * @param showColumns - The list of columns to display.
     * @returns The current custom highlight regions.
     */
    export function useHighlightRow(tableName: string, getIndexByRowId: (rowId: any) => number, showColumns: IField<any>[]): {
        customHighlightRegions: DataEditorProps["highlightRegions"];
        setCustomHighlightRegions: React.Dispatch<React.SetStateAction<DataEditorProps["highlightRegions"]>>;
    };
}
declare module "components/table/views/grid/hooks/use-hover" {
    import { GridMouseEventArgs } from "@glideapps/glide-data-grid";
    export const useHover: ({ theme }: {
        theme?: string;
    }) => {
        onItemHovered: (args: GridMouseEventArgs) => void;
        getRowThemeOverride: any;
    };
}
declare module "packages/lib/ai/generate" {
    export const generateText: ({ prompt, modelId, systemPrompt, config, }: {
        prompt: string;
        systemPrompt?: string;
        modelId: string;
        config: {
            apiKey: string;
            baseURL: string;
        };
    }) => Promise<string>;
}
declare module "components/table/views/grid/plugins/ai-tools" {
    import { DataEditorProps, GridSelection } from "@glideapps/glide-data-grid";
    import { IField } from "packages/lib/store/interface";
    export const AITools: ({ close, fields, selection, getRowByIndex, getFieldByIndex, setAIHighlightRegions, }: {
        close: () => void;
        fields: IField[];
        selection: GridSelection;
        getRowByIndex: (index: number) => Record<string, any>;
        getFieldByIndex: (index: number) => IField;
        setAIHighlightRegions: (regions: DataEditorProps["highlightRegions"]) => void;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "packages/lib/fields/formula" {
    import type { TextCell } from "@glideapps/glide-data-grid";
    import { BaseField } from "packages/lib/fields/base";
    import { FieldType } from "packages/lib/fields/const";
    export type FormulaProperty = {
        formula: string;
        displayType?: FieldType;
    };
    export class FormulaField extends BaseField<TextCell, FormulaProperty> {
        static type: FieldType;
        get compareOperators(): any[];
        get displayType(): FieldType;
        rawData2JSON(rawData: string): string;
        getCellContent(rawData: string): TextCell;
        cellData2RawData(cell: TextCell): {
            rawData: string;
        };
    }
}
declare module "hooks/use-formula-update" {
    import { IField } from "packages/lib/store/interface";
    import { FormulaProperty } from "packages/lib/fields/formula";
    import { FieldType } from "packages/lib/fields/const";
    export function useFormulaUpdate(uiColumn: IField<FormulaProperty> | null, onPropertyChange: (property: FormulaProperty) => void): {
        error: string;
        rawFormula: string;
        updateFormula: (input: string, displayType?: FieldType) => boolean;
    };
}
declare module "hooks/use-formula-validation" {
    import { IField } from "packages/lib/store/interface";
    import { FormulaProperty } from "packages/lib/fields/formula";
    export function useFormulaValidation(): (formula: string, currentField: IField<FormulaProperty> | null) => {
        isValid: boolean;
        error: string | null;
        result: string | null;
    };
}
declare module "hooks/use-preview-table-formula" {
    export const usePreviewTableFormula: () => {
        preview: ({ tableName, formula, rowId, }: {
            tableName: string;
            formula: string;
            rowId: string | null;
        }) => Promise<any>;
    };
}
declare module "components/formula-editor/functions/json" {
    /**
     * SQLite JSON Functions Reference
     *
     * This module documents the JSON functions available in SQLite 3.38.0 and later.
     * All functions accept both JSON text and JSONB (binary JSON) format unless otherwise noted.
     */
    /**
     * Core JSON Functions
     */
    export const JSON_FUNCTIONS: {
        json: {
            description: string;
            example: string;
        };
        jsonb: {
            description: string;
            example: string;
        };
        json_pretty: {
            description: string;
            example: string;
        };
        json_valid: {
            description: string;
            example: string;
        };
        json_error_position: {
            description: string;
            example: string;
        };
        json_array: {
            description: string;
            example: string;
        };
        json_object: {
            description: string;
            example: string;
        };
        json_extract: {
            description: string;
            example: string;
        };
        json_type: {
            description: string;
            example: string;
        };
        json_insert: {
            description: string;
            example: string;
        };
        json_replace: {
            description: string;
            example: string;
        };
        json_set: {
            description: string;
            example: string;
        };
        json_patch: {
            description: string;
            example: string;
        };
        json_remove: {
            description: string;
            example: string;
        };
        json_array_length: {
            description: string;
            example: string;
        };
        json_group_array: {
            description: string;
            example: string;
        };
        json_group_object: {
            description: string;
            example: string;
        };
    };
    /**
     * JSON Path Operators
     */
    export const JSON_OPERATORS: {
        "->": {
            description: string;
            example: string;
        };
        "->>": {
            description: string;
            example: string;
        };
    };
}
declare module "components/formula-editor/tooltip" {
    /**
     * Creates a custom tooltip component for UDF code
     * @param code The UDF code to extract documentation from
     * @returns A DOM element containing the formatted documentation
     */
    export function createUdfTooltip(code: string): HTMLElement;
}
declare module "components/formula-editor/completions" {
    import { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
    export interface UiColumn {
        name: string;
        type?: string;
    }
    export interface Udf {
        id: string;
        name: string;
        code: string;
    }
    export const getCompletions: (uiColumns: UiColumn[], udfs: Udf[]) => any[];
    /**
     * Creates SQL expression completions for the formula editor
     */
    export function sqlCompletions(context: CompletionContext, uiColumns: UiColumn[], udfs: Udf[]): CompletionResult | null;
}
declare module "components/formula-editor/hooks" {
    import { EditorView } from "codemirror";
    import { Udf, UiColumn } from "components/formula-editor/completions";
    export interface UseEditorProps {
        editorRef: React.RefObject<HTMLDivElement>;
        editorViewRef: React.MutableRefObject<EditorView | null>;
        initializedRef: React.MutableRefObject<boolean>;
        value: string;
        onChange: (value: string) => void;
        onSave?: (value: string) => void;
        onEsc?: () => void;
        columns?: UiColumn[];
        udfs?: Udf[];
        createEditorView: (element: HTMLElement, value: string, onChange: (value: string) => void, onSave?: (value: string) => void, uiColumns?: UiColumn[], udfs?: Udf[], language?: string, onEsc?: () => void, height?: string, onCurrentTokenChange?: (token: {
            text: string;
            type: string;
        } | null) => void, onArrowUp?: () => void, onArrowDown?: () => void, onEnter?: () => void, placeholder?: string, disableAutocompletion?: boolean) => EditorView;
        language?: string;
        theme?: "light" | "dark";
        height?: string;
        onCurrentTokenChange?: (token: {
            text: string;
            type: string;
        } | null) => void;
        onArrowUp?: () => void;
        onArrowDown?: () => void;
        onEnter?: () => void;
        onAiComplete?: (prompt: string) => void;
        placeholder?: string;
        disableAutocompletion?: boolean;
    }
    /**
     * Custom hook to manage the CodeMirror editor instance
     */
    export function useEditor({ editorRef, editorViewRef, initializedRef, value, onChange, onSave, onEsc, columns, udfs, createEditorView, language, theme, height, onCurrentTokenChange, onArrowUp, onArrowDown, onEnter, onAiComplete, placeholder, disableAutocompletion, }: UseEditorProps): {
        isAiPromptMode: boolean;
    };
}
declare module "components/formula-editor/codemirror-editor" {
    import { Udf, UiColumn } from "components/formula-editor/completions";
    export interface CodeMirrorFormulaEditorProps {
        value: string;
        language?: string;
        onChange: (value: string) => void;
        onSave?: (value: string) => void;
        udfs?: Udf[];
        columns?: UiColumn[];
        onEsc?: () => void;
        height?: string;
        onCurrentTokenChange?: (token: {
            text: string;
            type: string;
        } | null) => void;
        onArrowUp?: () => void;
        onArrowDown?: () => void;
        onEnter?: () => void;
        onAiComplete?: (prompt: string) => void;
        placeholder?: string;
        disableAutocompletion?: boolean;
        onAiPromptModeChange?: (isAiPromptMode: boolean) => void;
        isGeneratingFormula?: boolean;
    }
    /**
     * Expose a focus method to the parent component using forwardRef.
     */
    export interface CodeMirrorFormulaEditorRef {
        focus: () => void;
        insertText: (text: string) => void;
        getCurrentToken: () => {
            text: string;
            type: string;
        } | null;
    }
    export const CodeMirrorFormulaEditor: import("react").ForwardRefExoticComponent<CodeMirrorFormulaEditorProps & import("react").RefAttributes<CodeMirrorFormulaEditorRef>>;
}
declare module "components/table/views/grid/plugins/use-generate-formula" {
    export const generateFormula: (prompt: string, config: any, tableFields?: string[]) => Promise<{
        formula?: string;
        explanation?: string;
    }>;
    export const useGenerateFormula: () => {
        isLoading: boolean;
        error: Error;
        formula: {
            formula: string;
            explanation?: string;
        };
        generateFormulaConfig: (userPrompt: string, tableFields?: string[], model?: string) => Promise<any>;
    };
}
declare module "components/table/views/grid/plugins/formula-editor" {
    import { FormulaProperty } from "packages/lib/fields/formula";
    import { IField } from "packages/lib/store/interface";
    import { CodeMirrorFormulaEditorRef } from "components/formula-editor/codemirror-editor";
    import { UiColumn } from "components/formula-editor/completions";
    export const FormulaEditor: ({ editorRef, closeEditor, formulaField, uiColumns, rowId, }: {
        editorRef: React.RefObject<CodeMirrorFormulaEditorRef>;
        closeEditor: () => void;
        formulaField: IField<FormulaProperty> | null;
        uiColumns: UiColumn[];
        rowId: string | null;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/views/grid/plugins/use-formula-editor" {
    import { CodeMirrorFormulaEditorRef } from "components/formula-editor/codemirror-editor";
    import { FormulaProperty } from "packages/lib/fields/formula";
    import { IField } from "packages/lib/store/interface";
    import { DataEditorRef, GridSelection, Item } from "@glideapps/glide-data-grid";
    export const useFormulaEditor: (showColumns: IField<any>[], glideDataGridRef: React.RefObject<DataEditorRef>, formulaEditorRef: React.RefObject<HTMLDivElement>, selection: GridSelection) => {
        onCellActivated: (cell: Item) => void;
        showEditor: boolean;
        editorRef: import("react").MutableRefObject<CodeMirrorFormulaEditorRef>;
        handleFocus: () => void;
        closeEditor: () => void;
        formulaField: IField<FormulaProperty>;
        rowIndex: number;
        refreshEditorPosition: () => void;
    };
}
declare module "components/table/views/grid/index" {
    import "@glideapps/glide-data-grid/dist/index.css";
    import { IGridViewProperties, IView } from "packages/lib/store/IView";
    import "./styles.css";
    interface IGridProps {
        tableName: string;
        databaseName: string;
        view?: IView<IGridViewProperties>;
        isEmbed?: boolean;
        isEditable?: boolean;
        className?: string;
    }
    export default function GridView(props: IGridProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/fields/field-delete" {
    import { IField } from "packages/lib/store/interface";
    interface IFieldDeleteProps {
        field: IField;
        deleteField: (fieldId: string) => void;
        children: React.ReactNode;
    }
    export const FieldDelete: ({ field, children, deleteField, }: IFieldDeleteProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/fields/helper" {
    import { IField } from "packages/lib/store/interface";
    export const checkNewFieldNameIsOk: (name: string, currentField: IField, columns: IField[]) => boolean;
}
declare module "components/table/fields/field-name-edit" {
    import { IField } from "packages/lib/store/interface";
    interface IFieldNameEditProps {
        field: IField;
        tableName: string;
        databaseName: string;
        onEditEnd?: () => void;
    }
    export const FieldNameEdit: ({ field, tableName, databaseName, onEditEnd, }: IFieldNameEditProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/fields/field-icon" {
    import { FieldType } from "packages/lib/fields/const";
    export const FieldIcon: ({ type }: {
        type: FieldType;
    }) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/fields/field-type-select" {
    import { FieldType } from "packages/lib/fields/const";
    interface IFieldTypeSelectProps {
        value: FieldType;
        onChange: (value: FieldType) => void;
    }
    export function FieldTypeSelect({ value, onChange }: IFieldTypeSelectProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/fields/property/file/file-property-editor" {
    import { FileProperty } from "packages/lib/fields/file";
    import { IField } from "packages/lib/store/interface";
    interface IFieldPropertyEditorProps {
        uiColumn: IField<FileProperty>;
        onPropertyChange: (property: FileProperty) => void;
        onSave?: () => void;
        isCreateNew?: boolean;
    }
    export const FilePropertyEditor: (props: IFieldPropertyEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/ui/toggle-group" {
    import * as React from "react";
    import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
    import { type VariantProps } from "class-variance-authority";
    const ToggleGroup: React.ForwardRefExoticComponent<((Omit<ToggleGroupPrimitive.ToggleGroupSingleProps & React.RefAttributes<HTMLDivElement>, "ref"> | Omit<ToggleGroupPrimitive.ToggleGroupMultipleProps & React.RefAttributes<HTMLDivElement>, "ref">) & VariantProps<(props?: {
        variant?: "default" | "outline";
        size?: "default" | "sm" | "lg";
    } & import("class-variance-authority/dist/types").ClassProp) => string>) & React.RefAttributes<HTMLDivElement>>;
    const ToggleGroupItem: React.ForwardRefExoticComponent<Omit<ToggleGroupPrimitive.ToggleGroupItemProps & React.RefAttributes<HTMLButtonElement>, "ref"> & VariantProps<(props?: {
        variant?: "default" | "outline";
        size?: "default" | "sm" | "lg";
    } & import("class-variance-authority/dist/types").ClassProp) => string> & React.RefAttributes<HTMLButtonElement>>;
    export { ToggleGroup, ToggleGroupItem };
}
declare module "components/table/fields/property/formula/formula-property-editor" {
    import { FormulaProperty } from "packages/lib/fields/formula";
    import { IField } from "packages/lib/store/interface";
    interface IFieldPropertyEditorProps {
        uiColumn: IField<FormulaProperty>;
        onPropertyChange: (property: FormulaProperty) => void;
        isCreateNew?: boolean;
    }
    export const FormulaPropertyEditor: (props: IFieldPropertyEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/fields/property/link/link-property-editor" {
    import { ILinkProperty } from "packages/lib/fields/link";
    import { IField } from "packages/lib/store/interface";
    interface IFieldPropertyEditorProps {
        uiColumn: IField<ILinkProperty>;
        onPropertyChange: (property: ILinkProperty) => void;
        onSave?: () => void;
        isCreateNew?: boolean;
    }
    export const LinkPropertyEditor: (props: IFieldPropertyEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/fields/property/lookup/lookup-property-editor" {
    import { ILookupProperty } from "packages/lib/fields/lookup";
    import { IField } from "packages/lib/store/interface";
    interface IFieldPropertyEditorProps {
        uiColumn: IField<ILookupProperty>;
        onPropertyChange: (property: any) => void;
        onSave?: () => void;
        isCreateNew?: boolean;
    }
    export const LookupPropertyEditor: (props: IFieldPropertyEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "packages/lib/fields/number" {
    import type { NumberCell } from "@glideapps/glide-data-grid";
    import { RangeCell } from "components/table/views/grid/cells/range-cell";
    import { BaseField } from "packages/lib/fields/base";
    import { FieldType } from "packages/lib/fields/const";
    export type NumberProperty = {
        format: "number" | "percent" | "currency";
        showAs: "number" | "bar" | "ring";
        color: string;
        divideBy: number;
        showNumber: boolean;
    };
    export class NumberField extends BaseField<NumberCell | RangeCell, NumberProperty, number> {
        static type: FieldType;
        get compareOperators(): import("@/lib/fields/const").CompareOperator[];
        rawData2JSON(rawData: number): number;
        getCellContent(rawData: number | undefined): NumberCell | RangeCell;
        cellData2RawData(cell: NumberCell | RangeCell): {
            rawData: number;
        };
    }
}
declare module "components/table/fields/property/number/number-property-editor" {
    import { NumberProperty } from "packages/lib/fields/number";
    import { IField } from "packages/lib/store/interface";
    interface IFieldPropertyEditorProps {
        uiColumn: IField<NumberProperty>;
        onPropertyChange: (property: NumberProperty) => void;
        isCreateNew?: boolean;
    }
    export const NumberPropertyEditor: (props: IFieldPropertyEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/fields/property/select/select-option" {
    import { SelectOption as ISelectOption } from "packages/lib/fields/select";
    interface ISelectOptionProps {
        option: ISelectOption;
        container: HTMLDivElement | null;
        onNameChange: (id: string, name: string) => void;
        onDelete: (id: string) => void;
        onColorChange: (id: string, color: string) => void;
        children?: React.ReactNode;
    }
    export const SelectOption: ({ option, container, ...props }: ISelectOptionProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/fields/property/select/select-property-editor" {
    import { IField } from "packages/lib/store/interface";
    interface IFieldPropertyEditorProps {
        uiColumn: IField;
        onPropertyChange: (property: any) => void;
        isCreateNew?: boolean;
    }
    export const SelectPropertyEditor: (props: IFieldPropertyEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "packages/worker/web-worker/sdk/service/text" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    import { TableManager } from "packages/worker/web-worker/sdk/table";
    import { IField } from "packages/lib/store/interface";
    import { TextProperty } from "packages/lib/fields/text";
    export interface IVecMeta {
        updateAt: number;
        outOfDate: boolean;
    }
    export class TextFieldService {
        private table;
        dataSpace: DataSpace;
        constructor(table: TableManager);
        queryEmbedding: (fieldId: string, query: string, limit?: number) => Promise<any>;
        updateEmbedding: (fieldId: string, data: {
            recordId: string;
            value: string;
        }[]) => Promise<void>;
        resetEmbedding: (fieldId: string) => Promise<void>;
        onPropertyChange: (oldField: IField<TextProperty>, property: TextProperty) => Promise<void>;
        /**
     * when user delete a link field, we also need to delete the paired link field and delete relation data
     */
        beforeDeleteColumn(tableName: string, columnName: string, db?: import("@/lib/sqlite/interface").BaseServerDatabase): Promise<void>;
        /**
         * Get statistics about the embedding status for a text field
         * @param fieldId The field ID to get statistics for
         * @returns Statistics about vectorization status
         */
        getEmbeddingStats(fieldId: string): Promise<{
            total: number;
            vectorized: number;
            outdated: number;
            upToDate: number;
            vectorizedPercentage: number;
            outdatedPercentage: number;
            upToDatePercentage: number;
        }>;
    }
}
declare module "packages/lib/fields/text" {
    import type { TextCell } from "@glideapps/glide-data-grid";
    import { BaseField } from "packages/lib/fields/base";
    import { FieldType } from "packages/lib/fields/const";
    export interface TextProperty {
        model?: string | null;
        enableEmbedding?: boolean | null;
        enableColorHint?: boolean | null;
    }
    interface CellContext {
        row: Record<string, any>;
        theme?: 'dark' | 'light';
    }
    export class TextField extends BaseField<TextCell, TextProperty> {
        static type: FieldType;
        get compareOperators(): import("@/lib/fields/const").CompareOperator[];
        rawData2JSON(rawData: string): string;
        getCellContent(rawData: string | null, context?: CellContext): TextCell;
        cellData2RawData(cell: TextCell): {
            rawData: string;
        };
    }
}
declare module "components/embedding-stats-progress" {
    interface EmbeddingStatsProgressProps {
        className?: string;
        stats?: {
            total: number;
            vectorized: number;
            outdated: number;
            upToDate: number;
            vectorizedPercentage: number;
            outdatedPercentage: number;
            upToDatePercentage: number;
        };
    }
    export function EmbeddingStatsProgress({ className, stats, }: EmbeddingStatsProgressProps): import("react/jsx-runtime").JSX.Element;
}
declare module "hooks/use-toast" {
    import * as React from "react";
    import type { ToastActionElement, ToastProps } from "components/ui/toast";
    type ToasterToast = ToastProps & {
        id: string;
        title?: React.ReactNode;
        description?: React.ReactNode;
        action?: ToastActionElement;
    };
    const actionTypes: {
        readonly ADD_TOAST: "ADD_TOAST";
        readonly UPDATE_TOAST: "UPDATE_TOAST";
        readonly DISMISS_TOAST: "DISMISS_TOAST";
        readonly REMOVE_TOAST: "REMOVE_TOAST";
    };
    type ActionType = typeof actionTypes;
    type Action = {
        type: ActionType["ADD_TOAST"];
        toast: ToasterToast;
    } | {
        type: ActionType["UPDATE_TOAST"];
        toast: Partial<ToasterToast>;
    } | {
        type: ActionType["DISMISS_TOAST"];
        toastId?: ToasterToast["id"];
    } | {
        type: ActionType["REMOVE_TOAST"];
        toastId?: ToasterToast["id"];
    };
    interface State {
        toasts: ToasterToast[];
    }
    export const reducer: (state: State, action: Action) => State;
    type Toast = Omit<ToasterToast, "id">;
    function toast({ ...props }: Toast): {
        id: string;
        dismiss: () => void;
        update: (props: ToasterToast) => void;
    };
    function useToast(): {
        toast: typeof toast;
        dismiss: (toastId?: string) => void;
        toasts: ToasterToast[];
    };
    export { useToast, toast };
}
declare module "components/table/fields/property/text/hooks" {
    import { TextProperty } from "packages/lib/fields/text";
    type ProgressCallback = (progress: {
        processed: number;
        total: number;
        percentage: number;
    }) => void;
    export const usePreview: (updateProperty: (property: TextProperty) => void) => {
        process: (tableId: string, viewId: string, fieldId: string, onProgress?: ProgressCallback) => Promise<void>;
        queryEmbedding: (tableId: string, fieldId: string, query: string) => Promise<any>;
        resetEmbedding: (tableId: string, fieldId: string) => Promise<void>;
        getEmbeddingStats: (tableId: string, fieldId: string) => Promise<{
            total: number;
            vectorized: number;
            outdated: number;
            upToDate: number;
            vectorizedPercentage: number;
            outdatedPercentage: number;
            upToDatePercentage: number;
        }>;
    };
}
declare module "components/table/fields/property/text/text-property-editor" {
    import { TextProperty } from "packages/lib/fields/text";
    import { IField } from "packages/lib/store/interface";
    interface IFieldPropertyEditorProps {
        uiColumn: IField<TextProperty>;
        onPropertyChange: (property: TextProperty) => void;
        isCreateNew?: boolean;
    }
    export const TextPropertyEditor: (props: IFieldPropertyEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/fields/field-property-editor" {
    import React from "react";
    import { FieldType } from "packages/lib/fields/const";
    import { IField } from "packages/lib/store/interface";
    export const PropertyEditorTypeMap: {
        [type: string]: React.FC<{
            uiColumn: IField<any>;
            onPropertyChange: (property: any) => void;
            onSave?: () => void;
            isCreateNew?: boolean;
        }>;
    };
    export const NotImplementEditor: () => any;
    interface IFieldPropertyEditorProps {
        updateFieldProperty: (fieldName: IField, property: any) => void;
        changeFieldType: (field: IField, type: FieldType) => void;
        tableName: string;
        databaseName: string;
        deleteField: (fieldId: string) => void;
    }
    export const FieldPropertyEditor: ({ updateFieldProperty, changeFieldType, tableName, databaseName, deleteField, }: IFieldPropertyEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/fields/field-append-panel" {
    import { FieldType } from "packages/lib/fields/const";
    import { IField } from "packages/lib/store/interface";
    export function FieldAppendPanel({ addField, uiColumns, }: {
        addField: (fieldName: string, fieldType: FieldType, property?: any) => Promise<void>;
        uiColumns: IField[];
    }): import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/fields/field-editor-dropdown" {
    import { IView } from "packages/lib/store/IView";
    interface IFieldEditorDropdownProps {
        tableName: string;
        databaseName: string;
        view: IView;
        deleteField: (fieldId: string) => void;
    }
    export const FieldEditorDropdown: (props: IFieldEditorDropdownProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/fields/index" {
    import { IView } from "packages/lib/store/IView";
    interface IFieldEditorProps {
        tableName: string;
        databaseName: string;
        view: IView;
    }
    export const FieldEditor: (props: IFieldEditorProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/ui/kibo-ui/kanban/index" {
    import React, { type ReactNode } from "react";
    import { type DragEndEvent } from "@dnd-kit/core";
    export type { DragEndEvent } from "@dnd-kit/core";
    export type Status = {
        id: string;
        name: string;
        color: string;
    };
    export type KanbanBoardProps = {
        id: Status["id"];
        children: ReactNode;
        className?: string;
        style?: React.CSSProperties;
    };
    export const KanbanBoard: ({ id, children, className, style, }: KanbanBoardProps) => import("react/jsx-runtime").JSX.Element;
    export type KanbanCardProps = {
        id: string;
        name: string;
        index: number;
        parent: string;
        children?: ReactNode;
        className?: string;
    };
    export const KanbanCard: ({ id, name, index, parent, children, className, }: KanbanCardProps) => import("react/jsx-runtime").JSX.Element;
    export type KanbanCardsProps = {
        children: ReactNode;
        className?: string;
        ref?: React.RefObject<HTMLDivElement>;
    };
    export const KanbanCards: React.ForwardRefExoticComponent<Omit<KanbanCardsProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
    export type KanbanHeaderProps = {
        children: ReactNode;
    } | {
        name: Status["name"];
        color: Status["color"];
        className?: string;
    };
    export const KanbanHeader: (props: KanbanHeaderProps) => string | number | boolean | import("react/jsx-runtime").JSX.Element | Iterable<React.ReactNode>;
    export type KanbanProviderProps = {
        children: ReactNode;
        onDragEnd: (event: DragEndEvent) => void;
        className?: string;
    };
    export const KanbanProvider: ({ children, onDragEnd, className, }: KanbanProviderProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/views/kanban/hooks" {
    import { IView } from "packages/lib/store/IView";
    export type KanbanItem = {
        id: string;
        status: string;
        [key: string]: any;
    };
    export type StatusCount = {
        status: string;
        count: number;
        color?: string;
    };
    export const NULL_STATUS = "EIDOS_NULL_STATUS";
    export const useKanbanViewData: (view: IView) => {
        items: KanbanItem[];
        loading: boolean;
        statusCounts: StatusCount[];
        updateItemStatus: (itemId: string, newStatus: string) => Promise<void>;
    };
    export const useKanbanItemOperations: (tableId: string, space: string, groupByField?: string) => {
        createItem: (title: string, status: string) => Promise<Record<string, any>>;
    };
}
declare module "components/table/views/kanban/kanban-board" {
    import { IField } from "packages/lib/store/interface";
    import { IGalleryViewProperties } from "components/table/views/gallery/properties";
    import { KanbanItem, StatusCount } from "components/table/views/kanban/hooks";
    import { IKanbanViewProperties } from "components/table/views/kanban/properties";
    export const KanbanBoard: import("react").MemoExoticComponent<({ status, items, showFields, uiColumnMap, rawIdNameMap, tableId, space, properties, hiddenFields, }: {
        status: StatusCount;
        items: KanbanItem[];
        showFields: IField[];
        uiColumnMap: Map<string, IField>;
        rawIdNameMap: Map<string, string>;
        tableId: string;
        space: string;
        properties?: IGalleryViewProperties & IKanbanViewProperties;
        hiddenFields?: string[];
    }) => import("react/jsx-runtime").JSX.Element>;
}
declare module "components/table/views/kanban/index" {
    import { IView } from "packages/lib/store/IView";
    export const KanbanView: ({ space, tableName, view, }: {
        space: string;
        tableName: string;
        view: IView;
    }) => import("react/jsx-runtime").JSX.Element;
    export default KanbanView;
}
declare module "components/table/index" {
    interface ITableProps {
        space: string;
        tableName: string;
        viewId?: string;
        isEmbed?: boolean;
        isEditable?: boolean;
        isReadOnly?: boolean;
    }
    export const Table: ({ tableName, space, viewId, isEmbed, isEditable, isReadOnly, }: ITableProps) => import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/database/component" {
    import { ElementFormatType, NodeKey } from "lexical";
    type DatabaseTableComponentProps = Readonly<{
        className: Readonly<{
            base: string;
            focus: string;
        }>;
        format: ElementFormatType | null;
        nodeKey: NodeKey;
        id: string;
    }>;
    export function DatabaseTableComponent({ className, format, nodeKey, id, }: DatabaseTableComponentProps): import("react/jsx-runtime").JSX.Element;
}
declare module "components/doc/blocks/database/node" {
    import { DecoratorBlockNode, SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
    import type { DOMConversionMap, DOMExportOutput, EditorConfig, ElementFormatType, LexicalEditor, LexicalNode, NodeKey, Spread } from "lexical";
    export type SerializedDatabaseTableNode = Spread<{
        id: string;
    }, SerializedDecoratorBlockNode>;
    export class DatabaseTableNode extends DecoratorBlockNode {
        __id: string;
        static getType(): string;
        static clone(node: DatabaseTableNode): DatabaseTableNode;
        static importJSON(serializedNode: SerializedDatabaseTableNode): DatabaseTableNode;
        constructor(id: string, format?: ElementFormatType, key?: NodeKey);
        exportJSON(): SerializedDatabaseTableNode;
        exportDOM(): DOMExportOutput;
        static importDOM(): DOMConversionMap | null;
        updateDOM(): false;
        getId(): string;
        decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element;
    }
    export function $createDatabaseTableNode(id: string): DatabaseTableNode;
    export function $isDatabaseTableNode(node: DatabaseTableNode | LexicalNode | null | undefined): node is DatabaseTableNode;
}
declare module "components/doc/blocks/database/plugin" {
    import { LexicalCommand } from "lexical";
    export const INSERT_DATABASE_TABLE_COMMAND: LexicalCommand<{
        id: string;
    }>;
    export const DatabaseTablePlugin: () => any;
}
declare module "components/doc/blocks/database/index" {
    import { DocBlock } from "components/doc/blocks/interface";
    const _default_13: DocBlock;
    export default _default_13;
}
declare module "components/doc/blocks/index" {
    import { DocBlock } from "components/doc/blocks/interface";
    export const BuiltInBlocks: DocBlock[];
    export const getBuiltInNodes: () => any[];
}
declare module "components/doc/plugins/MarkdownTransformers" {
    /**
     * https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/plugins/MarkdownTransformers/index.ts
     * Copyright (c) Meta Platforms, Inc. and affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     */
    import { ElementTransformer } from '@lexical/markdown';
    export const HR: ElementTransformer;
    export const TABLE: ElementTransformer;
}
declare module "components/doc/plugins/const" {
    import { Transformer } from "@lexical/markdown";
    import { BookmarkPayload } from "components/doc/blocks/bookmark/node";
    export const allTransformers: Transformer[];
    export const fgColors: {
        name: string;
        value: string;
    }[];
    export const bgColors: {
        name: string;
        value: string;
    }[];
    export const markdownLinkInfoMap: Map<string, BookmarkPayload>;
}
declare module "components/doc/plugins/AutoLoadSaveFocusPlugin/index" {
    /**
     * Check if the cursor is at the start of the document
     * Handles different node structures:
     * 1. root => paragraph => text
     * 2. root => list => listitem => text
     */
    export function $isAtDocumentStart(): boolean;
    interface AutoSavePluginProps {
        docId: string;
        disableManuallySave?: boolean;
        isEditable?: boolean;
    }
    export const DefaultState: {
        root: {
            children: {
                children: any[];
                direction: any;
                format: string;
                indent: number;
                type: string;
                version: number;
            }[];
            direction: any;
            format: string;
            indent: number;
            type: string;
            version: number;
        };
    };
    export function EidosAutoLoadSaveFocusPlugin(props: AutoSavePluginProps): any;
}
declare module "hooks/use-sqlite" {
    import type { DataSpace } from "packages/worker/web-worker/DataSpace";
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    import { IView } from "packages/lib/store/IView";
    import { IDataStore, IField } from "packages/lib/store/interface";
    interface SqliteState {
        isInitialized: boolean;
        setInitialized: (isInitialized: boolean) => void;
        currentNode: ITreeNode | null;
        setCurrentNode: (node: ITreeNode | null) => void;
        dataStore: IDataStore;
        setAllNodes: (tables: ITreeNode[]) => void;
        setNode: (node: Partial<ITreeNode> & {
            id: string;
        }) => void;
        delNode: (nodeId: string) => void;
        addNode: (node: ITreeNode) => void;
        allUiColumns: IField[];
        setAllUiColumns: (columns: IField[]) => void;
        setViews: (tableId: string, views: IView[]) => void;
        setFields: (tableId: string, fields: IField[]) => void;
        setRows: (tableId: string, rows: Record<string, any>[]) => void;
        delRows: (tableId: string, rowIds: string[]) => void;
        getRowById: (tableId: string, rowId: string) => Record<string, any> | null;
        getRowIds: (tableId: string) => string[];
        setView: (tableId: string, viewId: string, view: Partial<IView>) => void;
        cleanFieldData: (tableId: string, fieldId: string) => void;
        selectedTable: string;
        setSelectedTable: (table: string) => void;
        spaceList: string[];
        setSpaceList: (spaceList: string[]) => void;
        sqliteProxy: DataSpace | null;
        setSqliteProxy: (sqlWorker: DataSpace) => void;
    }
    export const useSqliteStore: import("zustand").UseBoundStore<import("zustand").StoreApi<SqliteState>>;
    export const useSqlite: (dbName?: string) => {
        sqlite: DataSpace;
        createTable: (tableName: string, parent_id?: string) => Promise<string>;
        deleteTable: (tableId: string) => Promise<void>;
        createFolder: (parent_id?: string) => Promise<string>;
        duplicateTable: (oldTableName: string, newTableName: string) => Promise<void>;
        queryAllTables: () => Promise<ITreeNode[]>;
        updateNodeList: () => Promise<void>;
        createTableWithSql: (createTableSql: string, insertSql?: string) => Promise<void>;
        createTableWithSqlAndInsertSqls: (props: {
            tableId: string;
            tableName: string;
            createTableSql: string;
            insertSql?: any[];
            callback?: (progress: number) => void;
        }) => Promise<void>;
        updateTableData: (sql: string) => Promise<void>;
        handleSql: (sql: string) => Promise<boolean>;
        undo: () => Promise<void>;
        redo: () => Promise<void>;
        createDoc: (docName: string, parent_id?: string, nodeId?: string) => Promise<string>;
        updateDoc: (docId: string, content: string, markdown: string) => Promise<void>;
        renameNode: (nodeId: string, newName: string) => Promise<void>;
        getDoc: (docId: string) => Promise<string>;
        getDocMarkdown: (docId: string) => Promise<string>;
        deleteNode: (node: ITreeNode) => Promise<void>;
        restoreNode: (node: ITreeNode) => Promise<void>;
        toggleNodeFullWidth: (node: ITreeNode) => Promise<void>;
        toggleNodeLock: (node: ITreeNode) => Promise<void>;
        permanentlyDeleteNode: (node: ITreeNode) => Promise<void>;
        getOrCreateTableSubDoc: (data: {
            docId: string;
            tableId: string;
            title: string;
        }) => Promise<ITreeNode>;
        updateNodeName: (nodeId: string, newName: string) => Promise<void>;
        rebuildFTS: (tableId: string) => Promise<void>;
    };
}
declare module "hooks/use-current-node" {
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    export const useNodeMap: () => {
        [nodeId: string]: ITreeNode;
    };
    export const useCurrentNode: () => ITreeNode;
    export type INodePath = ITreeNode & {
        path?: string;
    };
    export const useCurrentNodePath: ({ nodeId, parentId, }: {
        nodeId?: string;
        parentId?: string;
    }) => INodePath[];
}
declare module "hooks/use-current-pathinfo" {
    export const useCurrentPathInfo: () => {
        database: string;
        space: string;
        tableName: string;
        tableId: string;
        viewId: string;
        docId?: undefined;
    } | {
        database: string;
        space: string;
        docId: string;
        tableName?: undefined;
        tableId?: undefined;
        viewId?: undefined;
    };
}
declare module "hooks/use-files" {
    import { IFile } from "packages/worker/web-worker/meta-table/file";
    /**
     * every upload file will be record meta data in `eidos__files` table, but we can't pass file via postMessage,
     * so we expose this hook to handle file upload\delete\update
     * every mutation about file must be done via this hook.
     */
    export const useFileSystem: (rootDir?: FileSystemDirectoryHandle) => {
        isRootDir: boolean;
        entries: FileSystemFileHandle[];
        refresh: () => Promise<void>;
        addFiles: (files: File[], useUuId?: boolean) => Promise<IFile[]>;
        addDir: (name: string) => Promise<void>;
        uploadDir: (dirHandle: FileSystemDirectoryHandle, _parentPath?: string[]) => Promise<void>;
        enterDir: (dir: string) => void;
        backDir: () => void;
        currentPath: string[];
        enterPathByIndex: (index: number) => void;
        goRootDir: () => void;
        getFileUrlPath: (name: string) => string;
        deleteFiles: (names: {
            name: string;
            isDir: boolean;
        }[]) => Promise<void>;
        addSelectedEntry: (name: string, isDir: boolean) => void;
        removeSelectedEntry: (name: string) => void;
        selectedEntries: Map<string, boolean>;
        setSelectedEntries: (selectedEntries: Map<string, boolean>) => void;
        prevSelectedEntries: Map<string, boolean>;
        setPrevSelectedEntries: (prevSelectedEntries: Map<string, boolean>) => void;
    };
    export const useFiles: () => {
        files: IFile[];
    };
}
declare module "components/file-selector" {
    export const DefaultColors: string[];
    export function FileSelector(props: {
        onSelected: (url: string, close?: boolean) => void;
        onRemove: () => void;
        disableColor?: boolean;
        hideRemove?: boolean;
        height?: number;
        onlyImage?: boolean;
        hideGallery?: boolean;
        showBlock?: boolean;
    }): import("react/jsx-runtime").JSX.Element;
}
declare module "components/table/views/grid/cells/file/file-cell-eidtor" {
    import { type FC } from "react";
    export interface CardProps {
        id: any;
        text: string;
        originalUrl: string;
        index: number;
        moveCard: (dragIndex: number, hoverIndex: number) => void;
        setCurrentPreviewIndex: (i: number) => void;
        deleteByUrl: (index: number) => void;
    }
    export const Card: FC<CardProps>;
}
declare module "components/table/views/grid/cells/file/file-preview" {
    export const FilePreview: ({ url, type, onClose, }: {
        url: string;
        type: string;
        onClose: () => void;
    }) => import("react").ReactPortal;
}
declare module "components/table/views/grid/cells/file/file-cell" {
    import { CustomCell, CustomRenderer, ProvideEditorCallback } from "@glideapps/glide-data-grid";
    interface FileCellDataProps {
        readonly kind: "file-cell";
        readonly data: string[];
        readonly displayData: string[];
        readonly allowAdd?: boolean;
        readonly proxyUrl?: string;
    }
    export type FileCell = CustomCell<FileCellDataProps>;
    export const FileCellEditor: ReturnType<ProvideEditorCallback<FileCell & {
        className?: string;
    }>>;
    export const FileCellRenderer: CustomRenderer<FileCell>;
}
declare module "packages/lib/fields/file" {
    import type { FileCell } from "components/table/views/grid/cells/file/file-cell";
    import { BaseField } from "packages/lib/fields/base";
    import { CompareOperator, FieldType } from "packages/lib/fields/const";
    export type FileProperty = {
        proxyUrl?: string;
    };
    export class FileField extends BaseField<FileCell, FileProperty, string> {
        static type: FieldType;
        rawData2JSON(rawData: string): string;
        get compareOperators(): CompareOperator[];
        static getDefaultFieldProperty(): {
            proxyUrl: string;
        };
        /**
         * we need to proxy the image to avoid CORS issue. if the image is a remote url, we will proxy it
         */
        getProxyData: (data: string[]) => string[];
        private encodeComma;
        private decodeComma;
        getCellContent(rawData: string): FileCell;
        cellData2RawData(cell: FileCell): {
            rawData: string;
        };
    }
}
declare module "packages/lib/fields/last-edited-by" {
    import { UserProfileCell } from "components/table/views/grid/cells/user-profile-cell";
    import { BaseField } from "packages/lib/fields/base";
    import { CompareOperator, FieldType } from "packages/lib/fields/const";
    import { UserFieldContext } from "packages/lib/fields/created-by";
    type LastEditedByProperty = {};
    export class LastEditedByField extends BaseField<UserProfileCell, LastEditedByProperty, string, UserFieldContext> {
        static type: FieldType;
        rawData2JSON(rawData: string): string;
        get compareOperators(): CompareOperator[];
        getCellContent(rawData: string | undefined, context?: UserFieldContext): UserProfileCell;
        cellData2RawData(cell: UserProfileCell): {
            rawData: import("@/components/table/views/grid/cells/user-profile-cell").UserProfileCellProps;
        };
    }
}
declare module "packages/lib/fields/last-edited-time" {
    import { TextCell } from "@glideapps/glide-data-grid";
    import { BaseField } from "packages/lib/fields/base";
    import { CompareOperator, FieldType } from "packages/lib/fields/const";
    type DateProperty = {};
    export class LastEditedTimeField extends BaseField<TextCell, DateProperty, string> {
        static type: FieldType;
        rawData2JSON(rawData: string): string;
        get compareOperators(): CompareOperator[];
        getCellContent(rawData: string | undefined): TextCell;
        cellData2RawData(cell: TextCell): {
            rawData: string;
        };
    }
}
declare module "packages/lib/fields/rating" {
    import type { RatingCell } from "components/table/views/grid/cells/rating-cell";
    import { BaseField } from "packages/lib/fields/base";
    import { CompareOperator, FieldType } from "packages/lib/fields/const";
    type RatingProperty = {};
    export class RatingField extends BaseField<RatingCell, RatingProperty, number> {
        static type: FieldType;
        get compareOperators(): CompareOperator[];
        rawData2JSON(rawData: number): number;
        getCellContent(rawData: number): RatingCell;
        cellData2RawData(cell: RatingCell): {
            rawData: number;
        };
    }
}
declare module "packages/lib/fields/title" {
    import type { TextCell } from "@glideapps/glide-data-grid";
    import { BaseField } from "packages/lib/fields/base";
    import { CompareOperator, FieldType } from "packages/lib/fields/const";
    type TitleProperty = {};
    export class TitleField extends BaseField<TextCell, TitleProperty> {
        static type: FieldType;
        get compareOperators(): CompareOperator[];
        rawData2JSON(rawData: string): string;
        getCellContent(rawData: string): TextCell;
        cellData2RawData(cell: TextCell): {
            rawData: string;
        };
    }
}
declare module "packages/lib/fields/url" {
    import type { UriCell } from "@glideapps/glide-data-grid";
    import { BaseField } from "packages/lib/fields/base";
    import { FieldType } from "packages/lib/fields/const";
    type URLProperty = {};
    type URLCell = UriCell;
    export class URLField extends BaseField<URLCell, URLProperty> {
        static type: FieldType;
        get compareOperators(): import("@/lib/fields/const").CompareOperator[];
        rawData2JSON(rawData: string): string;
        getCellContent(rawData: string): URLCell;
        cellData2RawData(cell: URLCell): {
            rawData: string;
        };
    }
}
declare module "packages/lib/fields/index" {
    import { IField } from "packages/lib/store/interface";
    import { BaseField } from "packages/lib/fields/base";
    import { CheckboxField } from "packages/lib/fields/checkbox";
    import { FieldType } from "packages/lib/fields/const";
    import { CreatedByField } from "packages/lib/fields/created-by";
    import { CreatedTimeField } from "packages/lib/fields/created-time";
    import { DateField } from "packages/lib/fields/date";
    import { FileField } from "packages/lib/fields/file";
    import { FormulaField } from "packages/lib/fields/formula";
    import { LinkField } from "packages/lib/fields/link";
    import { LookupField } from "packages/lib/fields/lookup";
    import { MultiSelectField } from "packages/lib/fields/multi-select";
    import { NumberField } from "packages/lib/fields/number";
    import { RatingField } from "packages/lib/fields/rating";
    import { SelectField } from "packages/lib/fields/select";
    import { TextField } from "packages/lib/fields/text";
    import { URLField } from "packages/lib/fields/url";
    const baseFieldTypes: (typeof CheckboxField | typeof CreatedByField | typeof CreatedTimeField | typeof DateField | typeof LinkField | typeof FileField | typeof MultiSelectField | typeof NumberField | typeof RatingField | typeof SelectField | typeof TextField | typeof URLField | typeof FormulaField)[];
    type FieldTypeAndClsMap = {
        [key in FieldType]: (typeof baseFieldTypes)[number];
    } & {
        [FieldType.Lookup]: typeof LookupField;
    };
    export const allFieldTypesMap: FieldTypeAndClsMap;
    export function getFieldInstance<T = BaseField<any, any, any, any, any>>(field: IField<any>, context?: any): T;
}
declare module "packages/worker/web-worker/store" {
    export const workerStore: {
        currentCallUserId: string | null;
    };
}
declare module "packages/worker/web-worker/sdk/rows" {
    import type { IField } from "packages/lib/store/interface";
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    import { TableManager } from "packages/worker/web-worker/sdk/table";
    export class RowsManager {
        private table;
        dataSpace: DataSpace;
        fieldMap?: {
            fieldRawColumnNameFieldMap: Record<string, IField>;
            fieldNameRawColumnNameMap: Record<string, string>;
        };
        tableManager: TableManager;
        constructor(table: TableManager);
        static getReadableRows(rows: Record<string, any>[], fields: IField[]): Record<string, any>[];
        getFieldMap(): Promise<{
            fieldRawColumnNameFieldMap: Record<string, IField>;
            fieldNameRawColumnNameMap: Record<string, string>;
        }>;
        static rawData2Json(row: Record<string, any>, fieldRawColumnNameFieldMap: Record<string, IField>): Record<string, any>;
        transformData(data: Record<string, any>, context: {
            fieldNameRawColumnNameMap: Record<string, string>;
            fieldRawColumnNameFieldMap: Record<string, IField>;
        }, options?: {
            useFieldId?: boolean;
        }): {
            notExistKeys: string[];
            rawData: {
                [k: string]: any;
            };
        };
        /**
         * get row by id
         * @param id
         * @returns
         */
        get(id: string, options?: {
            raw?: boolean;
            withRowId?: boolean;
        }): Promise<any>;
        /**
         * @param filter a filter object, the key is field name, the value is field value
         * @param options
         * @returns
         */
        query(filter?: Record<string, any>, options?: {
            viewId?: string;
            limit?: number;
            offset?: number;
            raw?: boolean;
            select?: string[];
            rawQuery?: string;
        }): Promise<Record<string, any>[]>;
        getCreateData(data: Record<string, any>): Record<string, any>;
        getUpdateData(data: Record<string, any>): {
            _last_edited_time: string;
            _last_edited_by: string;
        };
        /**
         * for high performance, use transaction
         * @param datas
         * @param fieldMap
         * @param options
         * @returns
         */
        batchSyncCreate(datas: Record<string, any>[], fieldMap: {
            fieldRawColumnNameFieldMap: Record<string, IField>;
            fieldNameRawColumnNameMap: Record<string, string>;
        }, options?: {
            useFieldId?: boolean;
        }): Record<string, any>[];
        create(data: Record<string, any>, options?: {
            useFieldId?: boolean;
        }): Promise<Record<string, any>>;
        delete(id: string): Promise<boolean>;
        batchDelete(ids: string[]): Promise<boolean>;
        private updateCellSideEffect;
        update(id: string, data: Record<string, any>, options?: {
            useFieldId?: boolean;
        }): Promise<{
            _last_edited_time: string;
            _last_edited_by: string;
            id: string;
        }>;
        /**
         * highlight the row if it is in the current view
         * @param id row id
         */
        highlight(id: string): Promise<void>;
    }
}
declare module "packages/worker/web-worker/sdk/service/link" {
    import { FieldType } from "packages/lib/fields/const";
    import { ILinkProperty } from "packages/lib/fields/link";
    import { IField } from "packages/lib/store/interface";
    import { DataSpace, EidosDatabase } from "packages/worker/web-worker/DataSpace";
    import { TableManager } from "packages/worker/web-worker/sdk/table";
    interface IRelation {
        self: string;
        ref: string;
        link_field_id: string;
    }
    export class LinkFieldService {
        private table;
        dataSpace: DataSpace;
        db: EidosDatabase;
        constructor(table: TableManager);
        getEffectRowsByRelationDeleted: (relationTableName: string, relation: IRelation, db?: import("@/lib/sqlite/interface").BaseServerDatabase) => Promise<{
            [x: string]: any;
        }>;
        /**
         * get diff between new value and old value
         * eg: new value is "1,2,3", old value is "1,2,3,4" => added: [], removed: [4]
         * eg: new value is "1,2,3,4", old value is "1,3" => added: [2,4], removed: []
         * eg: new value is "1,2,3,4", old value is "1,2,3,4" => added: [], removed: []
         * eg: new value is null, old value is "1,2,3,4" => added: [], removed: [1,2,3,4]
         * eg: new value is "1,2,3,4", old value is null => added: [1,2,3,4], removed: []
         * eg: new value is "1,3,4,5", old value is "1,2,3,4" => added: [5], removed: [2]
         * eg: new value is "1", old value is "2" => added: [1], removed: [2]
         * @param newValue
         * @param oldValue
         */
        getDiff: (newValue: string | null, oldValue: string | null) => {
            added: string[];
            removed: string[];
        };
        getEffectRows: (table_name: string, rowIds: string[], db?: import("@/lib/sqlite/interface").BaseServerDatabase) => Promise<Record<string, string[]>>;
        getTableNodeName: (tableName: string) => Promise<string>;
        getPairedLinkField: (data: IField<ILinkProperty>) => Promise<{
            name: string;
            type: FieldType;
            table_name: string;
            table_column_name: string;
            property: ILinkProperty;
        }>;
        getRelationTableName: (field: IField<ILinkProperty>) => string;
        getParentRelationTableName: (field: IField<ILinkProperty>) => string;
        getLinkCellTitle: (field: IField<ILinkProperty>, value: string | null) => Promise<string | null>;
        private getLinkCellValue;
        updateLinkCell: (tableName: string, tableColumnName: string, rowIds: string[]) => Promise<void>;
        /**
         * when user setCell, we also need to update the paired link field and update relation table
         * @param field
         * @param rowId
         * @param value
         * @param oldValue
         */
        updateLinkRelation: (field: IField<ILinkProperty>, rowId: string, value: string | null, oldValue: string | null) => Promise<void>;
        /**
         * when user add a link field, we also need to add a paired link field and create relation table and set trigger
         * @param data
         * @param db
         * @returns
         */
        addField: (data: IField<ILinkProperty>, db?: import("@/lib/sqlite/interface").BaseServerDatabase) => Promise<import("@/lib/sqlite/interface").BaseServerDatabase>;
        /**
         * when user delete a table, we need check if there are link fields in the table, if so, we need to delete the paired link field and delete relation table and delete trigger
         */
        beforeDeleteTable(tableName: string, db?: import("@/lib/sqlite/interface").BaseServerDatabase): Promise<void>;
        /**
         * when user delete a link field, we also need to delete the paired link field and delete relation data
         */
        beforeDeleteColumn(tableName: string, columnName: string, db?: import("@/lib/sqlite/interface").BaseServerDatabase): Promise<void>;
    }
}
declare module "packages/worker/web-worker/sdk/service/lookup" {
    import { ILookupContext, ILookupProperty } from "packages/lib/fields/lookup";
    import { IField } from "packages/lib/store/interface";
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    import { TableManager } from "packages/worker/web-worker/sdk/table";
    import { BaseServerDatabase } from "packages/lib/sqlite/interface";
    export class LookupFieldService {
        private table;
        dataSpace: DataSpace;
        constructor(table: TableManager);
        /**
         * find all fields that lookup field depends on
         */
        getLookupContext: (tableName: string, tableColumnName: string) => Promise<ILookupContext | null>;
        onPropertyChange: (field: IField<ILookupProperty>, newProperty: ILookupProperty) => Promise<void>;
        /**
         * <linkField>__title field can be treated as a lookup field and the lookupTargetField is the title field
         */
        getLinkTitleContext: (tableName: string, tableColumnName: string) => Promise<{
            targetTableColumnName: string;
            targetTableName: string;
            linkFieldId: string;
        }>;
        _getLookupContext: (tableName: string, tableColumnName: string) => Promise<{
            targetTableColumnName: string;
            targetTableName: string;
            linkFieldId: string;
        }>;
        getFieldContext: (tableName: string, tableColumnName: string) => Promise<{
            targetTableColumnName: string;
            targetTableName: string;
            linkFieldId: string;
        }>;
        /**
         *
         * @param id table_column_name
         */
        updateColumn: (data: {
            tableName: string;
            tableColumnName: string;
            db?: BaseServerDatabase;
            rowIds?: string[];
        }) => Promise<void>;
    }
}
declare module "packages/worker/web-worker/sdk/service/multi-select" {
    import { SelectProperty } from "packages/lib/fields/select";
    import { IField } from "packages/lib/store/interface";
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    import { TableManager } from "packages/worker/web-worker/sdk/table";
    export class MultiSelectFieldService {
        private table;
        dataSpace: DataSpace;
        constructor(table: TableManager);
        updateFieldPropertyIfNeed: (field: IField<SelectProperty>, value: string) => Promise<void>;
        updateSelectOptionName: (field: IField<SelectProperty>, update: {
            from: string;
            to: string;
        }) => Promise<void>;
        deleteSelectOption: (field: IField<SelectProperty>, option: string) => Promise<void>;
    }
}
declare module "packages/worker/web-worker/sdk/service/select" {
    import { SelectProperty } from "packages/lib/fields/select";
    import { IField } from "packages/lib/store/interface";
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    import { TableManager } from "packages/worker/web-worker/sdk/table";
    export class SelectFieldService {
        private table;
        dataSpace: DataSpace;
        constructor(table: TableManager);
        static MAX_SELECT_OPTIONS: number;
        updateFieldPropertyIfNeed: (field: IField<SelectProperty>, value: string) => Promise<void>;
        updateSelectOptionName: (field: IField<SelectProperty>, update: {
            from: string;
            to: string;
        }) => Promise<void>;
        deleteSelectOption: (field: IField<SelectProperty>, option: string) => Promise<void>;
        beforeConvert: (field: IField<any>, db?: import("@/lib/sqlite/interface").BaseServerDatabase) => Promise<{
            id: string;
            name: string;
            color: string;
        }[]>;
    }
}
declare module "packages/worker/web-worker/sdk/service/index" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    import { TableManager } from "packages/worker/web-worker/sdk/table";
    import { LinkFieldService } from "packages/worker/web-worker/sdk/service/link";
    import { LookupFieldService } from "packages/worker/web-worker/sdk/service/lookup";
    import { MultiSelectFieldService } from "packages/worker/web-worker/sdk/service/multi-select";
    import { SelectFieldService } from "packages/worker/web-worker/sdk/service/select";
    import { TextFieldService } from "packages/worker/web-worker/sdk/service/text";
    export class FieldsManager {
        private table;
        dataSpace: DataSpace;
        constructor(table: TableManager);
        all(): Promise<import("@/lib/store/interface").IField[]>;
        get lookup(): LookupFieldService;
        get select(): SelectFieldService;
        get multiSelect(): MultiSelectFieldService;
        get link(): LinkFieldService;
        get text(): TextFieldService;
    }
}
declare module "packages/worker/web-worker/sdk/service/compute" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    export class ComputeService {
        private dataSpace;
        constructor(dataSpace: DataSpace);
        updateEffectCells: (signal: {
            table: string;
            rowId: string;
            diff: Record<string, {
                old: any;
                new: any;
            }>;
            diffKeys: string[];
        }) => Promise<void>;
    }
}
declare module "packages/worker/web-worker/sdk/table" {
    import { IView } from "packages/lib/store/IView";
    import { DataSpace, EidosDatabase } from "packages/worker/web-worker/DataSpace";
    import { IndexManager } from "packages/worker/web-worker/sdk/index-manager";
    import { RowsManager } from "packages/worker/web-worker/sdk/rows";
    import { FieldsManager } from "packages/worker/web-worker/sdk/service/index";
    import { ComputeService } from "packages/worker/web-worker/sdk/service/compute";
    import { FieldType } from "packages/lib/fields/const";
    interface ITable {
        id: string;
        name: string;
        views: IView[];
    }
    export class TableManager {
        id: string;
        dataSpace: DataSpace;
        rawTableName: string;
        db: EidosDatabase;
        constructor(id: string, dataSpace: DataSpace);
        get compute(): ComputeService;
        get rows(): RowsManager;
        get fields(): FieldsManager;
        get index(): IndexManager;
        isExist(id: string): Promise<boolean>;
        get(id: string): Promise<ITable | null>;
        del(id: string): Promise<boolean>;
        hasSystemColumn(tableId: string, column: string): Promise<any>;
        fixTable(tableId: string): Promise<void>;
        static generateCreateTableSql(fields: Array<{
            name: string;
            type: FieldType;
        }>): {
            tableId: string;
            createTableSql: string;
        };
    }
}
declare module "packages/worker/web-worker/data-pipeline/DataChangeEventHandler" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    export class DataChangeEventHandler {
        private dataSpace;
        constructor(dataSpace: DataSpace);
        handleLinkRelationChange: (data: {
            table: string;
            _old: Record<string, any>;
            _new: Record<string, any>;
        }) => Promise<void>;
        static getDiff: (oldData: Record<string, any> | undefined, newData: Record<string, any>) => Record<string, {
            old: any;
            new: any;
        }>;
    }
}
declare module "packages/worker/web-worker/data-pipeline/DataChangeTrigger" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    type IRegisterTrigger = {
        update: string;
        insert: string;
        delete: string;
    };
    export class DataChangeTrigger {
        triggerMap: Map<string, IRegisterTrigger>;
        constructor();
        private getRowJSONObj;
        registerTrigger(space: string, tableName: string, trigger: IRegisterTrigger): Promise<void>;
        unRegisterTrigger(space: string, tableName: string): Promise<void>;
        isTriggerChanged(space: string, tableName: string, trigger: IRegisterTrigger): boolean;
        setTrigger(dataspace: DataSpace, tableName: string, collist: any[], toDeleteColumns?: string[]): Promise<void>;
    }
}
declare module "packages/worker/web-worker/data-pipeline/LinkRelationUpdater" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    export class LinkRelationUpdater {
        private dataSpace;
        needUpdateCell: Record<string, Record<string, Set<string>>>;
        constructor(dataSpace: DataSpace, setInterval?: typeof global.setInterval);
        updateCells: () => Promise<void>;
        addCell: (tableName: string, tableColumnName: string, rowId: string) => void;
    }
}
declare module "packages/worker/web-worker/data-pipeline/TableFullTextSearch" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    export class TableFullTextSearch {
        private dataspace;
        private enableFTS;
        constructor(dataspace: DataSpace, enableFTS?: boolean);
        createDynamicFTS(tableName: string, temporary?: boolean, inTransaction?: boolean): Promise<void>;
        private createTriggers;
        search(tableName: string, query: string, viewId: string, page?: number, pageSize?: number): Promise<{
            results: {
                row: any;
                matches: any[];
                rowIndex: any;
            }[];
            searchTime: number;
            totalMatches: any;
            currentPage: number;
            totalPages: number;
        }>;
        updateTrigger(tableName: string, toDeleteColumns: string[]): Promise<void>;
        clearFTS(tableName: string): Promise<void>;
        dropFTS(tableName: string): Promise<void>;
        hasFTS(tableName: string): Promise<boolean>;
        rebuildFTS(tableName: string): Promise<void>;
    }
}
declare module "packages/worker/web-worker/data-pipeline/UndoRedo" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    interface StackEntry {
        begin: number;
        end: number;
    }
    interface UndoRedoState {
        active: boolean;
        undostack: StackEntry[];
        redostack: StackEntry[];
        pending?: any;
        firstlog: number;
        freeze?: number;
        startstate?: unknown;
    }
    export class SQLiteUndoRedo {
        undo: UndoRedoState;
        db: DataSpace;
        triggerNames: string[];
        constructor(db: DataSpace);
        activate(tables: string[]): void;
        deactivate(): void;
        freeze(): Promise<void>;
        unfreeze(): void;
        event(): void;
        barrier(): Promise<void>;
        callUndo(): void;
        callRedo(): void;
        refresh(): void;
        reload_all(): void;
        private _makeTriggersForTbl;
        private createTriggers;
        private _drop_triggers;
        private _start_interval;
        private _step;
    }
}
declare module "packages/worker/web-worker/db-migrator/DbMigrator" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    /**
     * auto migrate db schema when db schema changed
     */
    export class DbMigrator {
        private db;
        private draftDb;
        private allowDeletions;
        constructor(db: DataSpace, draftDb: DataSpace, allowDeletions?: boolean);
        private compareTables;
        private compareColumns;
        private migrateTables;
        private migrateTable;
        migrate(): Promise<void>;
        private cleanDraftDb;
    }
}
declare module "packages/worker/web-worker/helper" {
    export function timeit(threshold: number): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
}
declare module "packages/worker/web-worker/import-and-export/base" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    export abstract class BaseImportAndExport {
        abstract import(textFileLike: {
            name: string;
            content: string;
        }, dataSpace: DataSpace): Promise<string>;
        abstract export(nodeId: string, dataSpace: DataSpace): Promise<string>;
    }
}
declare module "packages/worker/web-worker/import-and-export/csv" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    import { BaseImportAndExport } from "packages/worker/web-worker/import-and-export/base";
    export class CsvImportAndExport extends BaseImportAndExport {
        useWal: boolean;
        constructor({ useWal }: {
            useWal?: boolean;
        });
        guessColumnType(content: string): Promise<{
            [name: string]: "String" | "Number" | "Date";
        }>;
        import(file: {
            name: string;
            content: string;
        }, dataSpace: DataSpace): Promise<string>;
        export(nodeId: string, dataSpace: DataSpace): Promise<string>;
    }
}
declare module "packages/worker/web-worker/import-and-export/markdown" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    import { BaseImportAndExport } from "packages/worker/web-worker/import-and-export/base";
    export class MarkdownImportAndExport extends BaseImportAndExport {
        import(file: {
            name: string;
            content: string;
        }, dataSpace: DataSpace): Promise<string>;
        export(nodeId: string, dataSpace: DataSpace): Promise<string>;
    }
}
declare module "packages/worker/web-worker/meta-table/action" {
    import { BaseTable, BaseTableImpl } from "packages/worker/web-worker/meta-table/base";
    type ParamType = "string" | "number" | "boolean";
    interface IFunction {
        name: string;
        params: {
            name: string;
            value: any;
        }[];
    }
    export interface IAction {
        id: string;
        name: string;
        params: {
            name: string;
            type: ParamType;
        }[];
        nodes: IFunction[];
    }
    export class ActionTable extends BaseTableImpl implements BaseTable<IAction> {
        name: string;
        createTableSql: string;
        JSONFields: string[];
        add(data: IAction): Promise<IAction>;
        set(id: string, data: IAction): Promise<boolean>;
        del(id: string): Promise<boolean>;
    }
}
declare module "packages/worker/web-worker/meta-table/chat" {
    import { BaseTable, BaseTableImpl } from "packages/worker/web-worker/meta-table/base";
    export type Chat = {
        id: string;
        created_at: string;
        title: string;
        user_id: string;
        project_id: string;
    };
    export class ChatTable extends BaseTableImpl<Chat> implements BaseTable<Chat> {
        name: string;
        createTableSql: string;
        getChatIdsByProjectId(projectId: string): Promise<string[]>;
        delete(chatId: string): Promise<void>;
    }
}
declare module "packages/worker/web-worker/meta-table/doc" {
    import { Email } from "postal-mime";
    import { MsgType } from "packages/lib/const";
    import { BaseTable, BaseTableImpl } from "packages/worker/web-worker/meta-table/base";
    export interface IDoc {
        id: string;
        content: string;
        markdown: string;
        is_day_page?: boolean;
        created_at?: string;
        updated_at?: string;
    }
    export class DocTable extends BaseTableImpl<IDoc> implements BaseTable<IDoc> {
        name: string;
        createFTSSql: string;
        createTableSql: string;
        /**
         * for now lexical's code node depends on the browser's dom, so we can't use lexical in worker.
         * wait for lexical improve code node to support worker
         * @param type
         * @param data
         * @returns
         */
        callMain: (type: MsgType.GetDocMarkdown | MsgType.ConvertMarkdown2State | MsgType.ConvertHtml2State | MsgType.ConvertEmail2State, data: any) => Promise<any>;
        rebuildIndex(opts: {
            refillNullMarkdown?: boolean;
            recreateFtsTable?: boolean;
        }): Promise<void>;
        listAllDayPages(): Promise<any>;
        listDayPage(page?: number): Promise<any>;
        del(id: string): Promise<boolean>;
        getMarkdown(id: string): Promise<string>;
        getBaseInfo(id: string): Promise<Partial<IDoc>>;
        search(query: string): Promise<{
            id: string;
            result: string;
        }[]>;
        createOrUpdateWithMarkdown(id: string, mdStr: string): Promise<{
            id: string;
            success: boolean;
            msg?: undefined;
        } | {
            id: string;
            success: boolean;
            msg: string;
        }>;
        createOrUpdate(data: {
            id: string;
            text: string | Email;
            type: "html" | "markdown" | "email";
            mode?: "replace" | "append" | "prepend";
        }): Promise<{
            id: string;
            success: boolean;
            msg?: undefined;
        } | {
            id: string;
            success: boolean;
            msg: string;
        }>;
        static mergeState: (oldState: string, newState: string) => string;
        _createOrUpdate(id: string, content: string, markdown: string, mode?: "replace" | "append" | "prepend"): Promise<{
            id: string;
            success: boolean;
            msg?: undefined;
        } | {
            id: string;
            success: boolean;
            msg: string;
        }>;
    }
}
declare module "packages/worker/web-worker/meta-table/message" {
    import { BaseTable, BaseTableImpl } from "packages/worker/web-worker/meta-table/base";
    export type ChatMessage = {
        id: string;
        chat_id: string;
        role: string;
        content: string;
        created_at?: string;
    };
    export class MessageTable extends BaseTableImpl<ChatMessage> implements BaseTable<ChatMessage> {
        name: string;
        createTableSql: string;
        deleteMessagesByChatId(chatId: string): Promise<void>;
        clearMessages(chatId: string): Promise<void>;
    }
}
declare module "packages/worker/web-worker/meta-table/reference" {
    import { IField } from "packages/lib/store/interface";
    import { BaseTable, BaseTableImpl } from "packages/worker/web-worker/meta-table/base";
    export interface IReference {
        self: string;
        ref: string;
        link: string;
        self_table_name: string;
        self_table_column_name: string;
        ref_table_name: string;
        ref_table_column_name: string;
        link_table_name: string;
        link_table_column_name: string;
    }
    /**
     * just for field reference relation, not for link cell
     */
    export class ReferenceTable extends BaseTableImpl implements BaseTable<IReference> {
        del(id: string): Promise<boolean>;
        name: string;
        createTableSql: string;
        getEffectedFields: (table_name: string, table_column_name: string) => Promise<IField[]>;
    }
}
declare module "packages/worker/web-worker/meta-table/tree" {
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    import { BaseTable, BaseTableImpl } from "packages/worker/web-worker/meta-table/base";
    export class TreeTable extends BaseTableImpl implements BaseTable<ITreeNode> {
        name: string;
        createTableSql: string;
        getNextRowId: () => Promise<any>;
        add(data: ITreeNode): Promise<ITreeNode>;
        get(id: string): Promise<ITreeNode | null>;
        updateName(id: string, name: string): Promise<boolean>;
        pin(id: string, is_pinned: boolean): Promise<boolean>;
        del(id: string, db?: import("@/lib/sqlite/interface").BaseServerDatabase): Promise<boolean>;
        makeProxyRow(row: any): ITreeNode;
        query(qs: {
            query?: string;
            withSubNode?: boolean;
        }): Promise<ITreeNode[]>;
        moveIntoTable(id: string, tableId: string, parentId?: string): Promise<boolean>;
        /**
         * id: uuid without '-'
         * miniId: last 8 char of id. most of time, it's enough to identify a node
         * @param idOrMiniId
         */
        getNode(idOrMiniId: string): Promise<ITreeNode | null>;
        checkLoop(id: string, parentId: string): Promise<void>;
        private getAdjacencyList;
        private dfs;
        getPosition(props: {
            parentId?: string;
            targetId: string;
            targetDirection: "up" | "down";
        }): Promise<number>;
    }
}
declare module "packages/worker/web-worker/meta-table/view" {
    import { IView, ViewTypeEnum } from "packages/lib/store/IView";
    import { BaseTable, BaseTableImpl } from "packages/worker/web-worker/meta-table/base";
    export class ViewTable extends BaseTableImpl implements BaseTable<IView> {
        name: string;
        createTableSql: string;
        JSONFields: string[];
        add(data: IView): Promise<IView>;
        del(id: string): Promise<boolean>;
        deleteByTableId(table_id: string, db?: import("@/lib/sqlite/interface").BaseServerDatabase): Promise<void>;
        updateQuery(id: string, query: string): Promise<void>;
        createDefaultView(table_id: string, type?: ViewTypeEnum): Promise<IView<any>>;
        isRowExistInQuery(table_id: string, rowId: string, query: string): Promise<boolean>;
        findRowIndexInQuery(table_id: string, rowId: string, query: string): Promise<number>;
        recompute(table_id: string, rowIds: string[]): Promise<any>;
        private getLastPosition;
        getPosition(props: {
            tableId: string;
            targetId: string;
            targetDirection: "up" | "down";
        }): Promise<number>;
        updatePosition(id: string, position: number): Promise<void>;
        /**
         * Update view position when dragging
         * @param dragId The id of the view being dragged
         * @param targetId The id of the target view
         * @param direction The direction relative to target ("up" | "down")
         * @param tableId The table id that these views belong to
         */
        movePosition(props: {
            dragId: string;
            targetId: string;
            direction: "up" | "down";
            tableId: string;
        }): Promise<void>;
        /**
         * Batch reorder views
         * @param viewIds Array of view ids in desired order (first = highest position)
         */
        reorderViews(viewIds: string[]): Promise<void>;
        private checkAndReorderIfNeeded;
    }
}
declare module "packages/worker/web-worker/udf/index" {
    export const withSqlite3AllUDF: (bc: {
        postMessage: (data: any) => void;
    }) => {
        ALL_UDF: {
            name: string;
            xFunc: (pCx: any, table: any, _new: any, _old: any) => void;
        }[];
        ALL_UDF_NO_CTX: {
            name: string;
            xFunc: (table: any, _new: any, _old: any) => void;
        }[];
    };
}
declare module "packages/worker/web-worker/data-pipeline/TableSemanticSearch" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    export class TableSemanticSearch {
        private readonly dataspace;
        constructor(dataspace: DataSpace);
        search(params: {
            tableName: string;
            query: string;
            viewId?: string;
            fieldId?: string;
            page?: number;
            pageSize?: number;
            method?: 'L2' | 'COSINE';
        }): Promise<{
            meta: {
                embeddingFieldId: string;
                page: number;
                pageSize: number;
            };
            results: any;
        }>;
    }
}
declare module "packages/worker/web-worker/DataSpace" {
    import { FieldType } from "packages/lib/fields/const";
    import { EidosFileSystemManager, FileSystemType } from "packages/lib/storage/eidos-file-system";
    import { ITreeNode } from "packages/lib/store/ITreeNode";
    import { IView, ViewTypeEnum } from "packages/lib/store/IView";
    import { IField } from "packages/lib/store/interface";
    import { BaseServerDatabase } from "packages/lib/sqlite/interface";
    import { Email } from "postal-mime";
    import { DataChangeEventHandler } from "packages/worker/web-worker/data-pipeline/DataChangeEventHandler";
    import { DataChangeTrigger } from "packages/worker/web-worker/data-pipeline/DataChangeTrigger";
    import { LinkRelationUpdater } from "packages/worker/web-worker/data-pipeline/LinkRelationUpdater";
    import { TableFullTextSearch } from "packages/worker/web-worker/data-pipeline/TableFullTextSearch";
    import { SQLiteUndoRedo } from "packages/worker/web-worker/data-pipeline/UndoRedo";
    import { ActionTable } from "packages/worker/web-worker/meta-table/action";
    import { BaseTable } from "packages/worker/web-worker/meta-table/base";
    import { ChatTable } from "packages/worker/web-worker/meta-table/chat";
    import { ColumnTable } from "packages/worker/web-worker/meta-table/column";
    import { DocTable } from "packages/worker/web-worker/meta-table/doc";
    import { EmbeddingTable, IEmbedding } from "packages/worker/web-worker/meta-table/embedding";
    import { FileTable, IFile } from "packages/worker/web-worker/meta-table/file";
    import { MessageTable } from "packages/worker/web-worker/meta-table/message";
    import { ReferenceTable } from "packages/worker/web-worker/meta-table/reference";
    import { IScript, ScriptStatus, ScriptTable } from "packages/worker/web-worker/meta-table/script";
    import { TreeTable } from "packages/worker/web-worker/meta-table/tree";
    import { ViewTable } from "packages/worker/web-worker/meta-table/view";
    import { TableManager } from "packages/worker/web-worker/sdk/table";
    import { TableSemanticSearch } from "packages/worker/web-worker/data-pipeline/TableSemanticSearch";
    export type EidosTable = DocTable | ActionTable | ScriptTable | TreeTable | ViewTable | ColumnTable | EmbeddingTable | FileTable;
    export type EidosDatabase = BaseServerDatabase;
    export class DataSpace {
        db: EidosDatabase;
        draftDb: DataSpace | undefined;
        undoRedoManager: SQLiteUndoRedo;
        activeUndoManager: boolean;
        dbName: string;
        doc: DocTable;
        action: ActionTable;
        script: ScriptTable;
        tree: TreeTable;
        view: ViewTable;
        column: ColumnTable;
        reference: ReferenceTable;
        embedding: EmbeddingTable;
        chat: ChatTable;
        message: MessageTable;
        file: FileTable;
        dataChangeTrigger: DataChangeTrigger;
        linkRelationUpdater: LinkRelationUpdater;
        allTables: BaseTable<any>[];
        hasLoadExtension: boolean;
        postMessage?: (data: any, transfer?: any[]) => void;
        callRenderer?: (type: any, data: any) => Promise<any>;
        dataEventChannel: BroadcastChannel;
        eventHandler: DataChangeEventHandler;
        efsManager?: EidosFileSystemManager;
        hasMigrated: boolean;
        tableFullTextSearch: TableFullTextSearch;
        tableSemanticSearch: TableSemanticSearch;
        isUDFWithCtx: boolean;
        context: {
            setInterval?: typeof setInterval;
            embedding?: (text: string) => Promise<Array<number>>;
        };
        constructor(config: {
            db: EidosDatabase;
            activeUndoManager: boolean;
            dbName: string;
            context: {
                setInterval?: typeof setInterval;
                embedding?: (text: string) => Promise<Array<number>>;
            };
            hasLoadExtension?: boolean;
            createUDF?: (db: EidosDatabase) => void;
            draftDb?: DataSpace;
            postMessage?: (data: any, transfer?: any[]) => void;
            callRenderer?: (type: any, data: any) => Promise<any>;
            efsManager?: EidosFileSystemManager;
            dataEventChannel: BroadcastChannel;
            cacheSize?: number;
            isUDFWithCtx?: boolean;
            enableFTS?: boolean;
        });
        semanticSearch: (params: {
            tableName: string;
            query: string;
            viewId?: string;
            fieldId?: string;
            page: number;
            pageSize: number;
        }) => Promise<{
            meta: {
                embeddingFieldId: string;
                page: number;
                pageSize: number;
            };
            results: any;
        }>;
        updateEmbedding: (tableId: string, fieldId: string, data: {
            recordId: string;
            value: string;
        }[]) => Promise<void>;
        queryEmbedding: (tableId: string, fieldId: string, query: string, limit?: number) => Promise<any>;
        getEmbeddingStats: (tableId: string, fieldId: string) => Promise<{
            total: number;
            vectorized: number;
            outdated: number;
            upToDate: number;
            vectorizedPercentage: number;
            outdatedPercentage: number;
            upToDatePercentage: number;
        }>;
        resetEmbedding: (tableId: string, fieldId: string) => Promise<void>;
        status(): Promise<{
            [key: string]: any;
        }>;
        pages(): Promise<{
            [key: string]: any;
        }>;
        pull(): Promise<{
            [key: string]: any;
        }>;
        reset(): Promise<{
            [key: string]: any;
        }>;
        close(): void;
        private setCacheSize;
        private initUDF;
        private initMetaTable;
        getUDFs(): Promise<{
            id: string;
            name: string;
            code: string;
        }[]>;
        onTableChange(space: string, tableName: string, toDeleteColumns?: string[]): Promise<void>;
        addEmbedding(embedding: IEmbedding): Promise<IEmbedding>;
        table(id: string): TableManager;
        createTableIndex(tableId: string, column: string): void;
        getLookupContext(tableName: string, columnName: string): Promise<import("@/lib/fields/lookup").ILookupContext>;
        updateLookupColumn(tableName: string, columnName: string): Promise<void>;
        deleteSelectOption: (field: IField, option: string) => Promise<void>;
        updateSelectOptionName: (field: IField, update: {
            from: string;
            to: string;
        }) => Promise<void>;
        setRow(tableId: string, rowId: string, data: any): Promise<{
            _last_edited_time: string;
            _last_edited_by: string;
            id: string;
        }>;
        setCell(data: {
            tableId: string;
            rowId: string;
            fieldId: string;
            value: any;
        }): Promise<void>;
        getRow(tableId: string, rowId: string): Promise<Record<string, any>>;
        /**
         * Starting from v0.5.0, we switched to using uuidv7 as the _id, and the logic of deleteRowsByRange changed from sorting by rowid to sorting by _id.
         * This function is suitable for old versions of tables where _id of row is uuidv4, and data cannot be deleted by selection, but by a list of _id values.
         * There are some limitations, such as the maximum number of records that can be deleted at once is limited by the sqlite bind parameter.
         * @param rowIds
         * @param tableId
         */
        deleteRowsByIds(ids: string[], tableName: string): Promise<void>;
        deleteRowsByRange(range: {
            startIndex: number;
            endIndex: number;
        }[], tableName: string, query: string): Promise<void>;
        addFile(file: IFile): Promise<IFile>;
        uploadDir(dirHandle: FileSystemDirectoryHandle, _parentPath?: string[]): Promise<void>;
        getFileById(id: string): Promise<IFile>;
        getFileByPath(path: string): Promise<IFile>;
        delFile(id: string): Promise<boolean>;
        delFileByPath(path: string): Promise<boolean>;
        deleteFileByPathPrefix(prefix: string): Promise<boolean>;
        updateFileVectorized(id: string, isVectorized: boolean): Promise<boolean>;
        saveFile2EFS(url: string, subDir?: string[], name?: string): Promise<IFile>;
        listFiles(): Promise<any[]>;
        walkFiles(): Promise<any[]>;
        transformFileSystem(sourceFs: FileSystemType, targetFs: FileSystemType): Promise<void>;
        listViews(tableId: string): Promise<IView[]>;
        addView(view: IView): Promise<IView<any>>;
        delView(viewId: string): Promise<boolean>;
        updateView(viewId: string, view: Partial<IView>): Promise<boolean>;
        createDefaultView(tableId: string, type?: ViewTypeEnum): Promise<IView<any>>;
        isRowExistInQuery(tableId: string, rowId: string, query: string): Promise<boolean>;
        getRecomputeRows(tableId: string, rowIds: string[]): Promise<any>;
        addField(data: IField): Promise<IField>;
        deleteField(tableName: string, tableColumnName: string): Promise<string[]>;
        changeColumnType(tableName: string, columnName: string, type: FieldType): Promise<void>;
        listRawColumns(tableName: string): Promise<{
            [columnName: string]: any;
        }[]>;
        updateColumnProperty(data: {
            tableName: string;
            tableColumnName: string;
            property: any;
            type: FieldType;
        }): Promise<void>;
        addRow(tableName: string, data: Record<string, any>, options?: {
            useFieldId?: boolean;
        }): Promise<Record<string, any>>;
        addAction(data: any): Promise<void>;
        listActions(): Promise<any[]>;
        addScript(data: IScript): Promise<void>;
        listScripts(status?: ScriptStatus): Promise<IScript[]>;
        getScript(id: string): Promise<IScript>;
        deleteScript(id: string): Promise<void>;
        updateScript(data: IScript): Promise<void>;
        enableScript(id: string): Promise<void>;
        disableScript(id: string): Promise<void>;
        rebuildIndex(refillNullMarkdown?: boolean): Promise<void>;
        rebuildFTS(tableId: string): Promise<void>;
        addDoc(docId: string, content: string, markdown: string, isDayPage?: boolean): Promise<void>;
        getDocBaseInfo(id: string): Promise<Partial<import("@/worker/web-worker/meta-table/doc").IDoc>>;
        updateDoc(docId: string, content: string, markdown: string, _isDayPage?: boolean): Promise<void>;
        getDoc(docId: string): Promise<string>;
        getDocMarkdown(docId: string, { withTitle, }?: {
            withTitle?: boolean;
        }): Promise<string>;
        /**
         * if you want to create or update a day page, you should pass a day page id. page id is like 2021-01-01
         * @param docId
         * @param mdStr
         * @param parent_id
         * @returns
         */
        createOrUpdateDocWithMarkdown(docId: string, mdStr: string, parent_id?: string, title?: string, mode?: "replace" | "append" | "prepend"): Promise<any>;
        createOrUpdateDoc(data: {
            docId: string;
            content: string;
            type: "html" | "markdown" | "email";
            parent_id?: string;
            title?: string;
            mode?: "replace" | "append" | "prepend";
        }): Promise<any>;
        deleteDoc(docId: string): Promise<void>;
        listAllDocIds(): Promise<string[]>;
        fullTextSearch(query: string): Promise<{
            id: string;
            result: string;
        }[]>;
        createTable(fields: Array<{
            name: string;
            type: FieldType;
        }>, name: string): Promise<string>;
        createTableViaSchema(id: string, name: string, tableSchema: string, parent_id?: string): Promise<void>;
        importCsv(file: {
            name: string;
            content: string;
        }): Promise<string>;
        exportCsv(tableId: string): Promise<string>;
        importMarkdown(file: {
            name: string;
            content: string;
        }): Promise<string>;
        exportMarkdown(nodeId: string): Promise<string>;
        fixTable(tableId: string): Promise<void>;
        hasSystemColumn(tableId: string, column: string): Promise<any>;
        restoreNode(id: string): Promise<void>;
        deleteNode(id: string): Promise<void>;
        isTableExist(id: string): Promise<boolean>;
        deleteTable(id: string): Promise<void>;
        listDays(page: number): Promise<any>;
        listAllDays(): Promise<any>;
        syncExec2(sql: string, bind?: any[], db?: BaseServerDatabase): Promise<any>;
        exec2(sql: string, bind?: any[]): Promise<any>;
        runAIgeneratedSQL(sql: string, tableName: string): Promise<Record<string, any>[]>;
        listTreeNodes(query?: string, withSubNode?: boolean): Promise<ITreeNode[]>;
        updateTreeNodePosition(id: string, position: number): Promise<boolean>;
        pinNode(id: string, isPinned: boolean): Promise<boolean>;
        toggleNodeFullWidth(id: string, isFullWidth: boolean): Promise<boolean>;
        toggleNodeLock(id: string, isLocked: boolean): Promise<boolean>;
        updateTreeNodeName(id: string, name: string): Promise<any>;
        addTreeNode(data: ITreeNode): Promise<ITreeNode>;
        getOrCreateTreeNode(data: ITreeNode): Promise<ITreeNode>;
        getTreeNode(id: string): Promise<ITreeNode>;
        moveDraftIntoTable(id: string, tableId: string, parentId?: string): Promise<boolean>;
        nodeChangeParent(id: string, parentId?: string, opts?: {
            targetId: string;
            targetDirection: "up" | "down";
        }): Promise<Partial<ITreeNode>>;
        listUiColumns(tableName: string): Promise<IField[]>;
        /**
         * this will return all ui columns in this space
         * @param tableName
         * @returns
         */
        listAllUiColumns(): Promise<any>;
        undo(): void;
        redo(): void;
        private activeTablesUndoRedo;
        execute(sql: string, bind?: any[]): Promise<{
            fetchone: () => any;
            fetchall: () => any[];
        }>;
        exec(sql: string, bind?: any[]): void;
        private execSqlWithBind;
        /**
         * it's a template string function, to execute sql. safe from sql injection
         * table name and column name need to be Symbol, like Symbol('table_name') or Symbol('column_name')
         *
         * example:
         * const tableName = "books"
         * const id = 42
         * sql`select ${Symbol("title")} from ${Symbol('table_name')} where id = ${id}`.then(logger.info)
         * @param strings
         * @param values
         * @returns
         */
        sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
        sql2: (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;
        sqlQuery: (sql: string, bind?: any[], rowMode?: "object" | "array") => Promise<any[]>;
        /**
         * Symbol can't be transformed between main thread and worker thread.
         * so we need to parse sql in main thread, then call this function. it will equal to call `sql` function in worker thread
         * be careful, it just parse sql before, the next logic need to be same with `sql` function
         * @param sql
         * @param bind
         * @returns
         */
        sql4mainThread(sql: string, bind?: any[], rowMode?: "object" | "array"): Promise<any[]>;
        sql4mainThread2(sql: string, bind?: any[]): Promise<any[]>;
        onUpdate(): void;
        notify(msg: {
            title: string;
            description: string;
        }): void;
        blockUIMsg(msg: string | null, data?: Record<string, any>): void;
        /**
         * 往指定邮箱发送邮件时，会被 cloudflare worker 拦截，
         * worker 再转发到 api-agent，最后 api-agent 调用 currentSpace.email() 方法
         * @param email
         */
        email(email: Email): void;
        createTableFTS(tableName: string, temporary?: boolean): Promise<void>;
        searchTableFTS(tableName: string, query: string, viewId: string, page?: number, pageSize?: number): Promise<{
            results: {
                row: any;
                matches: any[];
                rowIndex: any;
            }[];
            searchTime: number;
            totalMatches: any;
            currentPage: number;
            totalPages: number;
        }>;
        hasTableFTS(tableName: string): Promise<boolean>;
    }
}
declare module "@eidos.space/types" {
    import { DataSpace } from "packages/worker/web-worker/DataSpace";
    export interface Eidos {
        space(spaceName: string): DataSpace;
        currentSpace: DataSpace;
        /**
         * Script functionality
         */
        script: {
            /**
             * Call a specific script
             * @param scriptId The script ID
             * @param args Arguments to pass to the script
             * @returns The result of the script execution
             */
            call(scriptId: string, ...args: any[]): Promise<any>;
        };
        /**
         * AI-related functionality
         */
        AI: {
            /**
             * Generate text using AI
             * @param options Generation options including model and prompt
             * @param options.model The AI model to use
             * @param options.prompt The prompt text
             * @returns The generated text
             */
            generateText(options: {
                model?: string;
                prompt: string;
                [key: string]: any;
            }): Promise<string>;
        };
        utils: {
            /**
             * we can't use fetch directly in the iframe, so we need to use this method to fetch resource
             * Note: it return Blob, not Response
             *
             * for example:
             *
             * const blob = await eidos.fetchBlob("https://example.com/file.zip", {
             *   method: "GET",
             *   headers: {
             *     "Content-Type": "application/zip",
             *   },
             * })
             *
             * @param url
             * @param options
             * @returns
             */
            fetchBlob(url: string, options: RequestInit): Promise<Blob>;
            /**
             * highlight the row if it is in the current view
             * @param tableId
             * @param rowId
             * @param fieldId
             */
            tableHighlightRow(tableId: string, rowId: string, fieldId?: string): void;
        };
    }
    export interface EidosTable<T = Record<string, string>> {
        id: string;
        name: string;
        fieldsMap: T;
    }
}
