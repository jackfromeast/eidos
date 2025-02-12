import { Worker } from 'worker_threads';
import path from 'path';
import { getSpaceDbPath } from './file-system/space';

export interface WorkerConfig {
    simplePathConfig: any;
}

export class WorkerManager {
    private static instance: WorkerManager;
    private workers: Map<string, Worker> = new Map();

    private constructor() { }

    public static getInstance(): WorkerManager {
        if (!WorkerManager.instance) {
            WorkerManager.instance = new WorkerManager();
        }
        return WorkerManager.instance;
    }

    async executeTask(payload: any, config: WorkerConfig): Promise<any> {
        const { space, dbName } = payload.data;
        const spaceId = space || dbName;
        const spaceDbPath = getSpaceDbPath(spaceId);

        let worker = this.workers.get(spaceId);

        if (!worker) {
            worker = new Worker(path.join(__dirname, 'worker.js'), {
                workerData: {
                    spaceDbPath,
                    ...config
                }
            });
            this.workers.set(spaceId, worker);

            worker.on('error', (err) => {
                console.error(`Worker error for space ${spaceId}:`, err);
                this.removeWorker(spaceId);
            });
        }

        return new Promise((resolve, reject) => {
            const messageHandler = (result: any) => {
                worker!.removeListener('error', errorHandler);
                resolve(result);
            };

            const errorHandler = (error: Error) => {
                worker!.removeListener('message', messageHandler);
                this.removeWorker(spaceId);
                reject(error);
            };

            worker!.once('message', messageHandler);
            worker!.once('error', errorHandler);
            worker!.postMessage(payload);
        });
    }

    private removeWorker(spaceId: string) {
        const worker = this.workers.get(spaceId);
        if (worker) {
            worker.terminate();
            this.workers.delete(spaceId);
        }
    }

    shutdown() {
        for (const [_, worker] of this.workers) {
            worker.terminate();
        }
        this.workers.clear();
    }
} 