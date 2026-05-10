export const getStatusLabel = (status: string) => {
  if (!status) return 'UNKNOWN';
  return status.replace(/_/g, ' ').toUpperCase();
};

export const getStatusColor = (status: string) => {
  if (!status) return 'text-neutral-500 bg-neutral-500/10 border-neutral-500/20';
  const s = status.toUpperCase();
  if (s === 'AUTHORIZED' || s === 'AUTHENTIC') {
    return 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20';
  }
  if (s === 'KNOWN_NON_AUTHORIZED' || s === 'UNAUTHORIZED' || s === 'NON_AUTHORIZED') {
    return 'text-amber-500 bg-amber-500/10 border border-amber-500/20';
  }
  if (s === 'UNKNOWN' || s === 'HASH_MISMATCH' || s === 'MODIFIED' || s === 'WATERMARK_NOT_FOUND') {
    return 'text-rose-500 bg-rose-500/10 border border-rose-500/20';
  }
  return 'text-neutral-500 bg-neutral-500/10 border border-neutral-500/20';
};

export const isAlertStatus = (status: string) => {
  if (!status) return false;
  const alertStatuses = ['UNKNOWN', 'KNOWN_NON_AUTHORIZED', 'UNAUTHORIZED', 'NON_AUTHORIZED'];
  return alertStatuses.includes(status.toUpperCase());
};
