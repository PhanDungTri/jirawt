import { Person } from '@components/icons/person';
import { SelectableCard } from '@components/selectable-card';
import { COMMAND } from '@constants/commands';
import type { ProfileDTO } from '@dtos/profile';
import { isCriticalError } from '@errors/critical-error';
import { isFormError } from '@errors/form-error';
import { isUnauthorizedError } from '@errors/unauthorized-error';
import { invoke } from '@tauri-apps/api/tauri';
import { showCriticalErrorNotification, showUnauthorizedErrorNotification } from '@utils/notification';
import type { FC } from 'react';
import { useRef } from 'react';
import { useLocation } from 'wouter';

import type { SecurityFormHandler } from './security-form';
import { SecurityForm } from './security-form';

type ProfileCardProps = {
  profile: ProfileDTO;
  disabled?: boolean;
  loading?: boolean;
  onSelect: (id: string) => void;
  onDeselect: () => void;
};

export const ProfileCard: FC<ProfileCardProps> = ({ profile, onDeselect, onSelect, disabled, loading }) => {
  const [, setLocation] = useLocation();
  const _securityForm = useRef<SecurityFormHandler | null>(null);

  const select = async () => {
    onSelect(profile.id);
    if (profile.isProtected) {
      _securityForm.current?.open();
    } else {
      await selectProfile();
    }
  };

  const selectProtectedProfile = async (securityCode: string) => {
    await selectProfile(securityCode);
  };

  const selectProfile = async (securityCode?: string) => {
    try {
      await invoke(COMMAND.SELECT_PROFILE, {
        selectedProfile: {
          profileName: profile.profileName,
          securityCode,
        },
      });

      setLocation('/boards');
    } catch (e) {
      onDeselect();

      if (isCriticalError(e)) {
        showCriticalErrorNotification(e);
      } else if (isFormError(e)) {
        e.forEach((item) => {
          _securityForm.current?.setFieldError(item.field, item.message);
        });
      } else if (isUnauthorizedError(e)) {
        _securityForm.current?.close();
        showUnauthorizedErrorNotification();
      }
    }
  };

  return (
    <>
      <SelectableCard onSelect={select} icon={Person} disabled={disabled} loading={loading}>
        <span>{profile.profileName}</span>
      </SelectableCard>
      {profile.isProtected ? (
        <SecurityForm ref={_securityForm} onSubmit={selectProtectedProfile} onClose={onDeselect} />
      ) : null}
    </>
  );
};
