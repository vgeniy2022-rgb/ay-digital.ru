import type { SiteBuilderProject } from '../schema/types';
export type TemplateContact = { name:string; contact:string; comment:string; budget:string; deadline:string };
export type TemplateEnquiry = { fields:TemplateContact; attempt?:{ id:string; key:string; fingerprint:string; serialized:string }; receipt?:string };
export type SavedTemplateLead = {
  id:string; reference:string; createdAt:string; source:'template-catalog'; project:SiteBuilderProject;
  template:{id:string;version:string;name:string}; contact:TemplateContact;
  package:{id:string;name:string;price:string}; visitorId?:string;
  attribution:{source:string;basis:string;campaign?:string;sourceTag?:string;campaignTag?:string;entryHost?:string};
  images:{id:string;size:number;type:string;sha256:string}[];
};
