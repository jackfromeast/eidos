import { BaseServerDatabase } from '@/lib/sqlite/interface';
import { createClient } from '@libsql/client/node';
import console from 'electron-log';

export interface TursoDomainDbInfo {
    type: 'turso';
    config: {
        path: string;
        syncUrl: string;
        authToken?: string;
    };
}

export class TursoServerDatabase extends BaseServerDatabase {
    client: ReturnType<typeof createClient>;

    constructor(config: TursoDomainDbInfo['config']) {
        super();
        this.client = createClient({
            url: `file:${config.path}`,
            syncUrl: config.syncUrl,
            authToken: config.authToken,
            offline: true,
            // readYourWrites: true,
            // syncInterval: 10,
        });
    }

    async sync() {
        try {
            await this.client.execute(`SELECT 1`);
            await this.client.sync();
            console.log('sync success')
        } catch (error) {
            console.error('sync error', error)
        }
    }

    prepare(sql: string) {
        return {
            run: (params?: any[]) => {
                this.client.execute({ sql, args: params ?? [] });
            }
        };
    }

    async close() {
    }

    async selectObjects(sql: string, bind?: any[]): Promise<{ [columnName: string]: any }[]> {
        const result = await this.client.execute({ sql, args: bind ?? [] });
        return result.rows as { [columnName: string]: any }[];
    }

    async transaction(func: (db: BaseServerDatabase) => void): Promise<void> {
        const tx = await this.client.transaction();
        try {
            await func(tx as any);
            await tx.commit();
            await tx.close()
        } catch (error) {
            await tx.rollback();
            throw error;
        }
    }

    async executeMultiple(sql: string): Promise<void> {
        await this.client.executeMultiple(sql);
    }

    async exec(opts: { sql: string; bind?: any[]; rowMode?: "array" | "object" }) {
        if (typeof opts === 'string') {
            const result = await this.client.execute(opts);
            return result;
        } else if (typeof opts === 'object') {
            const { sql, bind, rowMode } = opts;
            const _bind = bind?.map((item: any) => {
                if (typeof item === 'boolean') {
                    return item ? 1 : 0;
                } else if (item == null) {
                    return null;
                }
                return item;
            });

            const result = await this.client.execute({ sql, args: _bind ?? [] });

            if (rowMode === 'array') {
                return result.rows.map(row => Object.values(row));
            }
            return result.rows;
        }
        return [];
    }

    createFunction(opt: { name: string; xFunc: (...args: any[]) => any }) {
        console.warn('Custom functions are not supported in Turso');
    }
}
