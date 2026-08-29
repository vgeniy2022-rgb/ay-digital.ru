import { useEffect, useState } from 'react';
import { LAB_STATE_EVENT, getLabLevel, markExperimentExplored, patchLabState, readLabState } from './storage';
import { labPublicExperimentIds } from './catalog';
import type { LabExperimentId } from './types';

export function useLabState(experimentId?: LabExperimentId) {
  const [state, setState] = useState(readLabState);

  useEffect(() => {
    const update = () => setState(readLabState());
    window.addEventListener('storage', update);
    window.addEventListener(LAB_STATE_EVENT, update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener(LAB_STATE_EVENT, update);
    };
  }, []);

  useEffect(() => {
    if (experimentId) markExperimentExplored(experimentId);
  }, [experimentId]);

  return {
    state,
    exploredCount: labPublicExperimentIds.filter((id) => state.explored.includes(id)).length,
    completedCount: labPublicExperimentIds.filter((id) => state.completed.includes(id)).length,
    level: getLabLevel(state.xp),
    toggleSound: () => patchLabState({ soundEnabled: !state.soundEnabled }),
    toggleHaptics: () => patchLabState({ hapticsEnabled: !state.hapticsEnabled }),
  };
}
