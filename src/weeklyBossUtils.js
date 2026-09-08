import { NON_BOSS_LAYER_IDS } from '../config/nonBossLayerIds.js';
import { LAYER_ID_TO_BOSS_NAME } from '../config/layerIdToBossName.js';

export function getBossNamesFromRaffleInformations(informations = []) {
  return (Array.isArray(informations) ? informations : [])
    .map((information) => String(information?.layerId ?? ''))
    .filter((layerId) => layerId && !NON_BOSS_LAYER_IDS.includes(layerId))
    .filter((layerId) => Object.hasOwn(LAYER_ID_TO_BOSS_NAME, layerId))
    .map((layerId) => LAYER_ID_TO_BOSS_NAME[layerId]);
}