import { Render } from '@puckeditor/core';
import type { SiteBuilderProject, StudioPage } from '../schema/types';
import { getStudioMetadata, studioConfig } from '../editor/studioConfig';
import { prepareDesignData } from '../designs/prepareDesignData';
import { DesignMediaProvider } from '../designs/DesignMedia';

export function StudioRenderer({ project, page, assetUrls }: { project: SiteBuilderProject; page: StudioPage; assetUrls: Record<string, string> }) {
  const data = project.templateId.startsWith('sitevl-design-') ? prepareDesignData(page.data) : page.data;
  return <DesignMediaProvider urls={assetUrls}><Render config={studioConfig} data={data} metadata={getStudioMetadata(project.theme, assetUrls)} /></DesignMediaProvider>;
}
