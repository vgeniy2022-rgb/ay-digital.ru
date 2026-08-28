/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ChangeEvent, type PropsWithChildren } from 'react';
import type { StudioAssetMetadata } from '../schema/types';

type StudioAssetContextValue = {
  assets: StudioAssetMetadata[];
  urls: Record<string, string>;
  upload: (files: FileList | File[]) => Promise<void>;
  replace: (id: string, file: File) => Promise<void>;
  remove: (id: string) => Promise<void>;
  updateAlt: (id: string, alt: string) => Promise<void>;
  updateFocalPoint: (id: string, focalPoint: { x: number; y: number }) => Promise<void>;
};

const StudioAssetContext = createContext<StudioAssetContextValue | null>(null);

export function StudioAssetProvider({ value, children }: PropsWithChildren<{ value: StudioAssetContextValue }>) {
  return <StudioAssetContext.Provider value={value}>{children}</StudioAssetContext.Provider>;
}

export function useStudioAssets() {
  return useContext(StudioAssetContext);
}

export function AssetPickerField({ value, onChange, readOnly }: { value?: string; onChange: (value: string) => void; readOnly?: boolean }) {
  const context = useStudioAssets();
  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) await context?.upload(event.target.files);
    event.target.value = '';
  };
  return (
    <div className="studio-asset-field">
      <select value={value || ''} onChange={(event) => onChange(event.target.value)} disabled={readOnly} aria-label="Выбрать изображение">
        <option value="">Без изображения</option>
        <optgroup label="Из проекта">
          {context?.assets.map((asset) => <option value={`asset://${asset.id}`} key={asset.id}>{asset.name}</option>)}
        </optgroup>
        <optgroup label="Примеры SITEVL">
          <option value="/images/editorial/home-collaboration.webp">Команда за работой</option>
          <option value="/images/editorial/developer-workspace.webp">Рабочее пространство</option>
          <option value="/images/editorial/phone-laptop.webp">Техника и консультация</option>
        </optgroup>
      </select>
      <label className="studio-asset-field__upload">
        Загрузить файл
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={handleUpload} disabled={readOnly} />
      </label>
    </div>
  );
}

export function resolveStudioAsset(value: string | undefined, urls: Record<string, string> = {}) {
  if (!value) return '';
  if (value.startsWith('asset://')) return urls[value.slice('asset://'.length)] || '';
  return value;
}
