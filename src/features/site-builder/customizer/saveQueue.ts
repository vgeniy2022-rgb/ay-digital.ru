import type { SiteBuilderProject } from '../schema/types';

/** Serial writes: a slow older autosave can never overwrite a newer edit. Failures remain retryable. */
export class DraftSaveQueue {
  private tail: Promise<void> = Promise.resolve();
  constructor(private save: (project: SiteBuilderProject)=>Promise<void>) {}
  write(project: SiteBuilderProject) {
    const snapshot=structuredClone(project);
    this.tail=this.tail.catch(()=>{}).then(()=>this.save(snapshot));
    return this.tail;
  }
  flush() { return this.tail; }
}
