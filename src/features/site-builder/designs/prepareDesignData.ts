import type { Data } from '@puckeditor/core';

/** Hidden sections stay in the document for undo; navigation never points to absent content. */
export function prepareDesignData(data: Data): Data {
  const active = data.content.filter(b => !b.props.hidden);
  const anchors = new Set(['top',...active.map(b=>b.props.idAnchor).filter(Boolean)]);
  return {...data,content:active.map(block=>{
    if (block.type==='DesignHeader' || block.type==='DesignFooter') return {...block,props:{...block.props,links:block.props.links.filter((link:{href:string})=>anchors.has(link.href.slice(1)))}};
    if (block.type==='DesignHero') return {...block,props:{...block.props,href:anchors.has(block.props.href.slice(1))?block.props.href:'#contact',secondaryHref:anchors.has(block.props.secondaryHref.slice(1))?block.props.secondaryHref:'#contact'}};
    return block;
  })};
}
