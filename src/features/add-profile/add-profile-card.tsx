import { Add } from '@components/icons/add';
import { PersonAdd } from '@components/icons/person-add';
import { ModalTitle } from '@components/modal-title';
import { SelectableCard } from '@components/selectable-card';
import { modals } from '@mantine/modals';
import type { FC } from 'react';

import { AddProfileForm } from './add-profile-form';

type AddProfileCardProps = {
  onSuccess: () => void;
  disabled?: boolean;
};

export const AddProfileCard: FC<AddProfileCardProps> = ({ onSuccess, disabled }) => {
  const handleSuccess = () => {
    modals.close('add-profile-form');
    onSuccess();
  };

  const openAddProfileForm = () => {
    modals.open({
      modalId: 'add-profile-form',
      title: <ModalTitle title="Add new profile" icon={PersonAdd} />,
      children: <AddProfileForm onSuccess={handleSuccess} />,
    });
  };

  return (
    <SelectableCard
      className="add-profile-card"
      icon={Add}
      color="dimmed"
      onSelect={openAddProfileForm}
      disabled={disabled}
    >
      <span>Add new profile</span>
    </SelectableCard>
  );
};
