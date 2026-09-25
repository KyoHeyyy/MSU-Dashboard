import { NON_BOSS_LAYER_IDS } from '../config/nonBossLayerIds.js';
import { LAYER_ID_TO_BOSS_NAME } from '../config/layerIdToBossName.js';

function getLatestThursdayAtUtc(date = new Date()) {
  const latestThursday = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
  const daysSinceThursday = (latestThursday.getUTCDay() + 7 - 4) % 7;
  latestThursday.setUTCDate(latestThursday.getUTCDate() - daysSinceThursday);
  latestThursday.setUTCHours(0, 0, 0, 0);
  return latestThursday;
}

export function getBossNamesFromRaffleInformations(informations = [], referenceDate = new Date()) {
  const latestThursday = getLatestThursdayAtUtc(referenceDate);
  const bossNames = new Set();

  for (const information of (Array.isArray(informations) ? informations : [])) {
    const clearInformations = Array.isArray(information?.clearInformations) ? information.clearInformations : [];
    const hasRecentClear = clearInformations.some((clearInformation) => {
      const clearedAt = clearInformation?.clearedAt;
      if (typeof clearedAt !== 'string' || !clearedAt) return false;

      const clearedAtDate = new Date(clearedAt);
      if (Number.isNaN(clearedAtDate.getTime())) return false;
      return clearedAtDate >= latestThursday;
    });

    if (!hasRecentClear) continue;

    const layerId = String(information?.layerId ?? '');
    if (!layerId || NON_BOSS_LAYER_IDS.includes(layerId)) continue;
    if (!Object.hasOwn(LAYER_ID_TO_BOSS_NAME, layerId)) continue;

    bossNames.add(LAYER_ID_TO_BOSS_NAME[layerId]);
  }

  return [...bossNames];
}