import type { FC } from 'react';

import { Eye } from './icons/eye';
import { EyeOff } from './icons/eye-off';

type VisibilityToggleIconProp = {
  reveal: boolean;
};

export const VisibilityToggleIcon: FC<VisibilityToggleIconProp> = ({ reveal }) => (reveal ? <EyeOff /> : <Eye />);
