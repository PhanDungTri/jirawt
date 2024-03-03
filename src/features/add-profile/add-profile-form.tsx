import { VisibilityToggleIcon } from '@components/visibility-toggle-icon';
import { COMMAND } from '@constants/commands';
import type { AddProfileDTO } from '@dtos/add-profile';
import { isCriticalError } from '@errors/critical-error';
import { isFormError } from '@errors/form-error';
import { Button, PasswordInput, Stack, TextInput } from '@mantine/core';
import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { invoke } from '@tauri-apps/api/tauri';
import { showCriticalErrorNotification } from '@utils/notification';
import type { FC } from 'react';
import { useState } from 'react';

type AddProfileFormProps = {
  onSuccess: () => void;
};

export const AddProfileForm: FC<AddProfileFormProps> = ({ onSuccess }) => {
  const [adding, setAdding] = useState(false);

  const form = useForm<AddProfileDTO>({
    initialValues: {
      email: '',
      personalAccessToken: '',
      profileName: '',
      securityCode: '',
    },
    validate: {
      email: isEmail('Email is required'),
      personalAccessToken: isNotEmpty('Personal access token is required'),
      profileName: isNotEmpty('Profile name is required'),
      securityCode: (value) =>
        !value?.trim() || /[a-z0-9]{8,}/i.test(value) ? null : 'Security code length must be 8 or more characters',
    },
  });

  const submit = async (values: AddProfileDTO) => {
    setAdding(true);

    try {
      await invoke(COMMAND.ADD_PROFILE, {
        profile: {
          ...values,
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          securityCode: values.securityCode?.trim() || undefined,
        },
      });

      notifications.show({
        title: 'Success',
        message: `Profile ${values.profileName} has been created`,
        color: 'green',
      });

      onSuccess();
    } catch (e) {
      if (isCriticalError(e)) {
        showCriticalErrorNotification(e);
      } else if (isFormError(e)) {
        e.forEach((item) => {
          form.setFieldError(item.field, item.message);
        });
      }
    }

    setAdding(false);
  };

  return (
    <form onSubmit={form.onSubmit(submit)}>
      <Stack>
        <TextInput label="Profile name" {...form.getInputProps('profileName')} />
        <TextInput label="Email" {...form.getInputProps('email')} />
        <PasswordInput
          visibilityToggleIcon={VisibilityToggleIcon}
          label="Personal access token"
          {...form.getInputProps('personalAccessToken')}
        />
        <PasswordInput
          visibilityToggleIcon={VisibilityToggleIcon}
          label="Security code (optional)"
          {...form.getInputProps('securityCode')}
        />
        <Button type="submit" loading={adding}>
          Add profile
        </Button>
      </Stack>
    </form>
  );
};
