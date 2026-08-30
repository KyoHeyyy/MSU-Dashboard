export function getRaffleHistories(rafflePayload) {
  const histories = rafflePayload?.data?.histories ?? rafflePayload?.histories ?? [];
  return Array.isArray(histories) ? histories : [];
}

export function getTotalWinCountByItemId(rafflePayload, itemId, raffledAt = null) {
  const targetItemId = Number(itemId);
  return getRaffleHistories(rafflePayload)
    .filter((history) => !raffledAt || history?.raffledAt === raffledAt)
    .flatMap((history) => history.prizes ?? [])
    .filter((prize) => Number(prize?.rewardKey?.itemId) === targetItemId)
    .reduce((total, prize) => total + (Number(prize.winCount?.value) || 0), 0);
}
