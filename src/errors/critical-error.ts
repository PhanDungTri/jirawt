const KEYS = ['message', 'detailedInfo'];

type CriticalError = {
  message: string;
  detailedInfo?: string;
};

const isCriticalError = (e: unknown): e is CriticalError => {
  const keys = Object.keys(e as object);

  return (keys.length === 1 && keys[0] === 'message') || (keys.length === 2 && keys.every((k) => KEYS.includes(k)));
};

export type { CriticalError };
export { isCriticalError };
