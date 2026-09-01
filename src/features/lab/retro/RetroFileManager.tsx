import { ArrowLeft, Copy, FolderPlus, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { completeLabExperiment, recordLabSecret, unlockLabAchievement } from '../core/storage';
import { createRetroFile, duplicateRetroFile, emptyRetroTrash, listRetroFiles, renameRetroFile, restoreRetroFile, trashRetroFile, type RetroFile, type RetroState } from './retroState';

export function RetroFileManager({ state, onChange, onOpenBrowser }: { state: RetroState; onChange: (state: RetroState) => void; onOpenBrowser: (url?: string) => void }) {
  const [parentId, setParentId] = useState('root');
  const [trash, setTrash] = useState(false);
  const [hidden, setHidden] = useState(false);
  const items = trash ? state.files.filter((item) => item.deletedAt) : listRetroFiles(state, parentId, hidden);
  const open = (item: RetroFile) => {
    if (item.kind === 'folder') { setParentId(item.id); setTrash(false); return; }
    if (item.id === 'floppy-secret') { unlockLabAchievement('FLOPPY_SECRET'); recordLabSecret('retro:floppy'); completeLabExperiment('retro'); }
    if (item.id === 'blackbox') { unlockLabAchievement('RETRO_SECRET_FILE'); recordLabSecret('retro:blackbox'); }
    if (item.kind === 'link' && item.content) { if (item.content.startsWith('sitevl://')) onOpenBrowser(item.content); else window.location.assign(item.content); return; }
    if (item.kind === 'app') { onOpenBrowser('sitevl://lab'); return; }
    if (item.content && item.kind === 'text') window.alert(item.content);
  };
  const create = (kind: 'folder' | 'text') => { const name = window.prompt('Название', kind === 'folder' ? 'Новая папка' : 'НОВЫЙ.TXT'); if (name) onChange(createRetroFile(state, parentId, name, kind)); };
  return <div className="retro-file-manager"><aside><strong>НОСИТЕЛИ</strong><button type="button" onClick={() => { setParentId('root'); setTrash(false); }}>SITEVL HD</button><button type="button" disabled={!state.floppyInserted} onClick={() => { setParentId('floppy'); setTrash(false); }}>A:\ {state.floppyInserted ? 'ДИСКЕТА' : 'ИЗВЛЕЧЕНА'}</button><button type="button" onClick={() => { setParentId('cd'); setTrash(false); }}>D:\ CD-ROM</button><button type="button" onClick={() => setTrash(true)}>КОРЗИНА</button><button type="button" onClick={() => onChange({ ...state, floppyInserted: !state.floppyInserted })}>{state.floppyInserted ? 'ИЗВЛЕЧЬ ДИСК' : 'ВСТАВИТЬ ДИСК'}</button><label><input type="checkbox" checked={hidden} onChange={(event) => setHidden(event.target.checked)} /> СКРЫТЫЕ</label></aside><section><header><button type="button" onClick={() => setParentId(state.files.find((item) => item.id === parentId)?.parentId || 'root')} aria-label="На уровень выше"><ArrowLeft /></button><strong>{trash ? 'КОРЗИНА' : state.files.find((item) => item.id === parentId)?.name}</strong><span><button type="button" onClick={() => create('folder')} aria-label="Создать папку"><FolderPlus /></button><button type="button" onClick={() => create('text')}>TXT+</button>{trash ? <button type="button" onClick={() => onChange(emptyRetroTrash(state))}>ОЧИСТИТЬ</button> : null}</span></header>{items.length ? items.map((item) => <article key={item.id}><button type="button" onClick={() => open(item)}><i>{item.kind.slice(0, 3).toUpperCase()}</i><span><strong>{item.name}</strong><small>{item.kind === 'folder' ? 'Папка' : 'Файл'}</small></span></button><menu>{trash ? <button type="button" onClick={() => onChange(restoreRetroFile(state, item.id))} aria-label={`Восстановить ${item.name}`}><RotateCcw /></button> : <><button type="button" onClick={() => { const name = window.prompt('Новое имя', item.name); if (name) onChange(renameRetroFile(state, item.id, name)); }}>ИМЯ</button><button type="button" onClick={() => onChange(duplicateRetroFile(state, item.id))} aria-label={`Дублировать ${item.name}`}><Copy /></button><button type="button" onClick={() => onChange(trashRetroFile(state, item.id))} aria-label={`Удалить ${item.name}`}><Trash2 /></button></>}</menu></article>) : <p>Здесь пока ничего нет.</p>}</section></div>;
}
