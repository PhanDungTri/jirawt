type UnauthorizedError = 'Unauthorized';

const isUnauthorizedError = (e: unknown): e is UnauthorizedError[] => typeof e === 'string' && e === 'Unauthorized';

export type { UnauthorizedError };
export { isUnauthorizedError };
