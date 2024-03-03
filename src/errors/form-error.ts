const KEYS = ['field', 'message'];

type FormError = {
  field: string;
  message: string;
};

const isFormError = (e: unknown): e is FormError[] => {
  if (Array.isArray(e)) {
    return e.every((item) => {
      const keys = Object.keys(item as object);

      return keys.length === 2 && keys.every((k) => KEYS.includes(k));
    });
  }
  return false;
};

export type { FormError };
export { isFormError };
