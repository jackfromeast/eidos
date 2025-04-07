import { BaseServerDatabase } from '@/lib/sqlite/interface';
import Database from '@eidos.space/better-sqlite3';
import console from 'electron-log';
import fs from 'fs';
import path from 'path';
import { generatePragmaList } from './config';


export interface NodeDomainDbInfo {
    type: 'node';
    config: {
        path: string;
        options?: Database.Options;
    };
}

export class NodeServerDatabase extends BaseServerDatabase {
    db: Database.Database;


    enableSimpleExtension(db: Database.Database, options: {
        libPath: string;
        dictPath: string;
    }) {
        db.loadExtension(options.libPath);
        const row = db.prepare('select simple_query(\'pinyin\') as query').get() as any;
        console.log(row.query);
        db.prepare("select jieba_dict(?)").run(options.dictPath);
    }
    constructor(config: NodeDomainDbInfo['config'], options: {
        enableSync: boolean,
        volumeId?: string,
        // for full text search
        simple: {
            libPath: string;
            dictPath: string;
        },
        // for sync
        graft?: {
            libPath: string;
        }
    }) {
        super();

        const graftFilePath = path.join(path.dirname(config.path), 'graft');
        console.log('graftFilePath:', graftFilePath);

        let isSyncDb = fs.existsSync(graftFilePath);

        console.log({
            enableSync: options.enableSync,
            path: config.path,
            isSyncDb
        });
        const tempDb = new Database(':memory:', config.options);

        try {
            // load extension 
            if (options.graft) {
                tempDb.loadExtension(options.graft.libPath);
            }
            if (fs.existsSync(options.simple.dictPath)) {
                this.enableSimpleExtension(tempDb, options.simple);
            } else {
                console.log('Dictionary file not found:', options.simple.dictPath);
            }

            tempDb.close();
            // default is local db, when enableSync is true, it will be sync db
            let dbUri = config.path;
            if (isSyncDb || options.enableSync) {
                dbUri = `file:${options.volumeId || 'random'}?vfs=graft`;
                if (config.path) {
                    let dbId = options.volumeId || null;
                    if (fs.existsSync(graftFilePath)) {
                        const _dbId = fs.readFileSync(graftFilePath, 'utf-8').trim();
                        if (_dbId) {
                            dbUri = `file:${_dbId}?vfs=graft`;
                            dbId = _dbId
                        }
                    }
                    if (!dbId) {
                        const memeryDb = new Database('file:random?vfs=graft');
                        const dbId = memeryDb.pragma('database_list')[0].file;
                        fs.writeFileSync(graftFilePath, dbId);
                        console.log('Saved database ID to graft file:', dbId);
                        memeryDb.close();
                        dbUri = `file:${dbId}?vfs=graft`;
                    }
                }
            }
            console.log('dbUri:', dbUri);
            this.db = new Database(dbUri);
            this.enableSimpleExtension(this.db, options.simple);
            const pragmaList = generatePragmaList();
            pragmaList.forEach(pragma => {
                this.db.pragma(pragma);
            });
        } catch (error) {
            console.error('Error during database initialization:', error);
            throw error;
        }
    }

    prepare(sql: string) {
        return this.db.prepare(sql)
    }
    close() {
        this.db.close();
    }


    async reset(): Promise<{ [key: string]: any; }> {
        const rawResult = this.db.pragma('graft_reset');
        console.log(rawResult)
        return {}
    }
    async pull(): Promise<{ [key: string]: any; }> {
        const rawResult = this.db.pragma('graft_status');
        console.log('Raw graft_status:', rawResult);

        if (!rawResult || !Array.isArray(rawResult) || rawResult.length === 0 || typeof rawResult[0] !== 'object' || rawResult[0] === null) {
            console.error('Unexpected graft_status format:', rawResult);
            return Promise.resolve({ error: 'Unexpected format' });
        }

        const statusString = Object.values(rawResult[0])[0];

        if (typeof statusString !== 'string') {
            console.error('Expected string value in graft_status result:', statusString);
            return Promise.resolve({ error: 'Expected string value' });
        }

        const lines = statusString.trim().split('\n');
        const resultJson: { [key: string]: any } = {};

        if (lines[0] !== 'Graft Status') {
            console.warn('First line is not "Graft Status":', lines[0]);
        }

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const separatorIndex = line.indexOf(':');
            if (separatorIndex === -1) {
                console.warn('Skipping line without colon:', line);
                continue;
            }

            const keyRaw = line.substring(0, separatorIndex).trim();
            const valueRaw = line.substring(separatorIndex + 1).trim();

            let keyCamelCase = '';
            switch (keyRaw) {
                case 'Client ID':
                    keyCamelCase = 'clientId';
                    break;
                case 'Volume ID':
                    keyCamelCase = 'volumeId';
                    break;
                case 'Current snapshot':
                    keyCamelCase = 'currentSnapshot';
                    break;
                case 'Autosync':
                    keyCamelCase = 'autosync';
                    break;
                case 'Volume status':
                    keyCamelCase = 'volumeStatus';
                    break;
                default:
                    // Basic camelCase conversion for unknown keys
                    keyCamelCase = keyRaw.replace(/\s(.)/g, (match, group1) => group1.toUpperCase()).replace(/\s/g, '');
                    keyCamelCase = keyCamelCase.charAt(0).toLowerCase() + keyCamelCase.slice(1);
                    console.warn('Unknown graft_status key:', keyRaw, 'Converted to:', keyCamelCase);
            }

            if (keyCamelCase === 'autosync') {
                resultJson[keyCamelCase] = valueRaw.toLowerCase() === 'true';
            } else {
                resultJson[keyCamelCase] = valueRaw;
            }
        }

        console.log('Parsed graft_status:', resultJson);
        return Promise.resolve(resultJson);
    }


    getGraftInfo(db: Database.Database) {
        return {
            graft_snapshot: db.pragma('graft_snapshot'),
            graft_pages: db.pragma('graft_pages'),
            graft_version: db.pragma('graft_version'),
            graft_sync_errors: db.pragma('graft_sync_errors'),
        }
    }

    getLocksInfo() {
        return {
            lockingMode: this.db.pragma('locking_mode'),
            walSize: this.db.pragma('wal_size'),
            pageSize: this.db.pragma('page_size'),
            cacheSize: this.db.pragma('cache_size'),
            busyTimeout: this.db.pragma('busy_timeout'),
            foreignKeys: this.db.pragma('foreign_keys'),
        };
    }

    async selectObjects(sql: string, bind?: any[]): Promise<{ [columnName: string]: any }[]> {
        const stmt = this.db.prepare(sql);
        if (bind != null) {
            return stmt.all(bind) as { [columnName: string]: any }[];
        }
        return stmt.all() as { [columnName: string]: any }[];
    }

    transaction(func: (db: NodeServerDatabase) => void) {
        const transaction = this.db.transaction(func);
        transaction(this);
        return
    }

    async exec(opts: { sql: string; bind?: any[]; rowMode?: "array" | "object" }) {
        if (typeof opts === 'string') {
            const res = this.db.exec(opts);
            return res
        } else if (typeof opts === 'object') {
            const { sql, bind } = opts;
            const _bind = bind?.map((item: any) => {
                // if item is boolean return 1 or 0
                if (typeof item === 'boolean') {
                    return item ? 1 : 0;
                }
                return item;
            })
            const stmt = this.db.prepare(sql);
            let res = null
            if (stmt.readonly) {
                res = stmt.all(_bind);
            } else {
                if (_bind == null) {
                    return stmt.run();
                }
                try {
                    return stmt.run(_bind);
                } catch (error) {
                    console.error("Error executing statement:", error);
                    console.error("SQL:", sql);
                    console.error("Bind:", _bind);
                    throw error
                }
            }
            if (opts.rowMode === 'array') {
                return res.map((item: any) => Object.values(item));
            }
            return res
        }
        return [];
    }

    createFunction(opt: { name: string; xFunc: (...args: any[]) => any }) {
        this.db.function(opt.name, {
            deterministic: true,
        }, opt.xFunc)
    }
}