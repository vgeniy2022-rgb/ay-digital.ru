import { Render } from '@puckeditor/core';
import type { SiteBuilderProject, StudioPage } from '../schema/types';
import { getStudioMetadata, studioConfig } from '../editor/studioConfig';

export function StudioRenderer({ project, page, assetUrls }: { project: SiteBuilderProject; page: StudioPage; assetUrls: Record<string, string> }) {
  return <Render config={studioConfig} data={page.data} metadata={getStudioMetadata(project.theme, assetUrls)} />;
}

