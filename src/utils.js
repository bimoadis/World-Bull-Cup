export const fmtUSD = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
};

export const fmtPrice = (n) =>
  n < 0.01 ? `$${n.toFixed(5)}` : `$${n.toFixed(4)}`;

export const shareToOdds = (share) => {
  if (share <= 0) return "—";
  const o = 1 / share;
  return o.toFixed(2);
};
