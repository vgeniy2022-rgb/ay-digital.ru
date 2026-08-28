import { useCallback, useEffect, useMemo, useState } from 'react';
import { optimizeStudioImage } from './imageProcessing';
import { studioAssetRepository, studioProjectRepository } from '../persistence/projectRepository';
import type { SiteBuilderProject, StoredStudioAsset, StudioAssetMetadata } from '../schema/types';
import { createStudioId } from '../utils/id';

export function useProjectAssets(project: SiteBuilderProject | null, setProject: (project: SiteBuilderProject) => void) {
  const [storedAssets, setStoredAssets] = useState<StoredStudioAsset[]>([]);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!project) return;
    try {
      setStoredAssets(await studioAssetRepository.list(project.id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить assets.');
    }
  }, [project]);

  useEffect(() => { void reload(); }, [reload]);

  const urls = useMemo(() => {
    const result: Record<string, string> = {};
    storedAssets.forEach((asset) => { result[asset.id] = URL.createObjectURL(asset.blob); });
    return result;
  }, [storedAssets]);

  useEffect(() => () => Object.values(urls).forEach((url) => URL.revokeObjectURL(url)), [urls]);

  const upload = useCallback(async (files: FileList | File[]) => {
    if (!project) return;
    setError('');
    const accepted = Array.from(files).slice(0, 20);
    const additions: StudioAssetMetadata[] = [];
    for (const file of accepted) {
      const processed = await optimizeStudioImage(file);
      const metadata: StudioAssetMetadata = {
        id: createStudioId('asset'), projectId: project.id, name: file.name.replace(/\.[^.]+$/, '.webp'), type: processed.type,
        size: processed.blob.size, width: processed.width, height: processed.height, alt: file.name.replace(/\.[^.]+$/, ''),
        focalPoint: { x: 50, y: 50 }, createdAt: new Date().toISOString(),
      };
      await studioAssetRepository.put({ ...metadata, blob: processed.blob });
      additions.push(metadata);
    }
    const next = { ...project, assets: [...project.assets, ...additions], updatedAt: new Date().toISOString() };
    setProject(next);
    await studioProjectRepository.update(next);
    await reload();
  }, [project, reload, setProject]);

  const remove = useCallback(async (id: string) => {
    if (!project) return;
    await studioAssetRepository.delete(id);
    const next = { ...project, assets: project.assets.filter((asset) => asset.id !== id), updatedAt: new Date().toISOString() };
    setProject(next);
    await studioProjectRepository.update(next);
    await reload();
  }, [project, reload, setProject]);

  const replace = useCallback(async (id: string, file: File) => {
    if (!project) return;
    const stored = await studioAssetRepository.get(id);
    if (!stored) return;
    const processed = await optimizeStudioImage(file);
    const replacement: StoredStudioAsset = {
      ...stored,
      name: file.name.replace(/\.[^.]+$/, '.webp'),
      type: processed.type,
      size: processed.blob.size,
      width: processed.width,
      height: processed.height,
      blob: processed.blob,
    };
    await studioAssetRepository.put(replacement);
    const metadata: StudioAssetMetadata = {
      id: replacement.id,
      projectId: replacement.projectId,
      name: replacement.name,
      type: replacement.type,
      size: replacement.size,
      width: replacement.width,
      height: replacement.height,
      alt: replacement.alt,
      focalPoint: replacement.focalPoint,
      createdAt: replacement.createdAt,
    };
    const next = {
      ...project,
      assets: project.assets.map((asset) => asset.id === id ? metadata : asset),
      updatedAt: new Date().toISOString(),
    };
    setProject(next);
    await studioProjectRepository.update(next);
    await reload();
  }, [project, reload, setProject]);

  const updateAlt = useCallback(async (id: string, alt: string) => {
    if (!project) return;
    const stored = await studioAssetRepository.get(id);
    if (!stored) return;
    await studioAssetRepository.put({ ...stored, alt });
    const next = { ...project, assets: project.assets.map((asset) => asset.id === id ? { ...asset, alt } : asset), updatedAt: new Date().toISOString() };
    setProject(next);
    await studioProjectRepository.update(next);
    await reload();
  }, [project, reload, setProject]);

  const updateFocalPoint = useCallback(async (id: string, focalPoint: { x: number; y: number }) => {
    if (!project) return;
    const normalized = {
      x: Math.max(0, Math.min(100, focalPoint.x)),
      y: Math.max(0, Math.min(100, focalPoint.y)),
    };
    const stored = await studioAssetRepository.get(id);
    if (!stored) return;
    await studioAssetRepository.put({ ...stored, focalPoint: normalized });
    const next = {
      ...project,
      assets: project.assets.map((asset) => asset.id === id ? { ...asset, focalPoint: normalized } : asset),
      updatedAt: new Date().toISOString(),
    };
    setProject(next);
    await studioProjectRepository.update(next);
    await reload();
  }, [project, reload, setProject]);

  return { storedAssets, urls, upload, replace, remove, updateAlt, updateFocalPoint, error };
}
