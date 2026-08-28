import type { ProjectListItem, SiteBuilderProject, StoredStudioAsset } from '../schema/types';
import { migrateProject } from '../schema/migrations';
import { createStudioId } from '../utils/id';

export interface ProjectRepository {
  create(project: SiteBuilderProject): Promise<SiteBuilderProject>;
  get(id: string): Promise<SiteBuilderProject | null>;
  list(): Promise<ProjectListItem[]>;
  update(project: SiteBuilderProject): Promise<SiteBuilderProject>;
  delete(id: string): Promise<void>;
  duplicate(id: string): Promise<SiteBuilderProject>;
}

export interface AssetRepository {
  put(asset: StoredStudioAsset): Promise<void>;
  get(id: string): Promise<StoredStudioAsset | null>;
  list(projectId: string): Promise<StoredStudioAsset[]>;
  delete(id: string): Promise<void>;
  deleteByProject(projectId: string): Promise<void>;
}

export interface RemoteProjectRepository extends ProjectRepository {
  readonly kind: 'remote';
}

const databaseName = 'sitevl-studio';
const databaseVersion = 1;
const projectsStore = 'projects';
const assetsStore = 'assets';

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Ошибка IndexedDB.'));
  });
}

function transactionDone(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('Транзакция IndexedDB не выполнена.'));
    transaction.onabort = () => reject(transaction.error || new Error('Транзакция IndexedDB отменена.'));
  });
}

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase() {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('Этот браузер не поддерживает IndexedDB.'));
        return;
      }
      const request = window.indexedDB.open(databaseName, databaseVersion);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(projectsStore)) database.createObjectStore(projectsStore, { keyPath: 'id' });
        if (!database.objectStoreNames.contains(assetsStore)) {
          const store = database.createObjectStore(assetsStore, { keyPath: 'id' });
          store.createIndex('projectId', 'projectId', { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Не удалось открыть IndexedDB.'));
    });
  }
  return databasePromise;
}

export class IndexedDbProjectRepository implements ProjectRepository {
  async create(project: SiteBuilderProject) {
    return this.update(project);
  }

  async get(id: string) {
    const database = await openDatabase();
    const transaction = database.transaction(projectsStore, 'readonly');
    const raw = await requestToPromise(transaction.objectStore(projectsStore).get(id));
    return raw ? migrateProject(raw) : null;
  }

  async list() {
    const database = await openDatabase();
    const transaction = database.transaction(projectsStore, 'readonly');
    const values = await requestToPromise(transaction.objectStore(projectsStore).getAll()) as SiteBuilderProject[];
    return values
      .map((project) => ({
        id: project.id,
        name: project.name,
        templateId: project.templateId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        pageCount: project.pages.length,
      }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async update(project: SiteBuilderProject) {
    const normalized = migrateProject({ ...project, updatedAt: new Date().toISOString() });
    const database = await openDatabase();
    const transaction = database.transaction(projectsStore, 'readwrite');
    transaction.objectStore(projectsStore).put(normalized);
    await transactionDone(transaction);
    return normalized;
  }

  async delete(id: string) {
    const database = await openDatabase();
    const transaction = database.transaction(projectsStore, 'readwrite');
    transaction.objectStore(projectsStore).delete(id);
    await transactionDone(transaction);
    await studioAssetRepository.deleteByProject(id);
  }

  async duplicate(id: string) {
    const source = await this.get(id);
    if (!source) throw new Error('Проект для копирования не найден.');
    const projectId = createStudioId('project');
    const pageIdMap = new Map(source.pages.map((page) => [page.id, createStudioId('page')]));
    const now = new Date().toISOString();
    const copy: SiteBuilderProject = {
      ...source,
      id: projectId,
      name: `${source.name} — копия`,
      createdAt: now,
      updatedAt: now,
      activePageId: pageIdMap.get(source.activePageId) || pageIdMap.values().next().value || '',
      pages: source.pages.map((page) => ({ ...page, id: pageIdMap.get(page.id) || createStudioId('page') })),
      assets: [],
    };
    return this.create(copy);
  }
}

export class IndexedDbAssetRepository implements AssetRepository {
  async put(asset: StoredStudioAsset) {
    const database = await openDatabase();
    const transaction = database.transaction(assetsStore, 'readwrite');
    transaction.objectStore(assetsStore).put(asset);
    await transactionDone(transaction);
  }

  async get(id: string) {
    const database = await openDatabase();
    const transaction = database.transaction(assetsStore, 'readonly');
    return (await requestToPromise(transaction.objectStore(assetsStore).get(id)) as StoredStudioAsset | undefined) || null;
  }

  async list(projectId: string) {
    const database = await openDatabase();
    const transaction = database.transaction(assetsStore, 'readonly');
    return requestToPromise(transaction.objectStore(assetsStore).index('projectId').getAll(projectId)) as Promise<StoredStudioAsset[]>;
  }

  async delete(id: string) {
    const database = await openDatabase();
    const transaction = database.transaction(assetsStore, 'readwrite');
    transaction.objectStore(assetsStore).delete(id);
    await transactionDone(transaction);
  }

  async deleteByProject(projectId: string) {
    const assets = await this.list(projectId);
    const database = await openDatabase();
    const transaction = database.transaction(assetsStore, 'readwrite');
    assets.forEach((asset) => transaction.objectStore(assetsStore).delete(asset.id));
    await transactionDone(transaction);
  }
}

export const studioProjectRepository = new IndexedDbProjectRepository();
export const studioAssetRepository = new IndexedDbAssetRepository();

