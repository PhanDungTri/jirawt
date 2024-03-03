import { LockClosed } from '@components/icons/lock-closed';
import { ModalTitle } from '@components/modal-title';
import { Button, Modal, Stack, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { isNotEmpty, useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { forwardRef, useImperativeHandle } from 'react';

type SecurityFormProps = {
  onSubmit: (value: string) => void;
  onClose: () => void;
};

type SecurityFormHandler = {
  open: () => void;
  close: () => void;
  setFieldError: UseFormReturnType<SecurityFormData, (values: SecurityFormData) => SecurityFormData>['setFieldError'];
};

type SecurityFormData = {
  securityCode: string;
};

const SecurityForm = forwardRef<SecurityFormHandler, SecurityFormProps>(({ onSubmit, onClose }, ref) => {
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm<SecurityFormData>({
    initialValues: { securityCode: '' },
    validate: { securityCode: isNotEmpty('Security code is required') },
  });

  const handleSubmit = (value: SecurityFormData) => {
    onSubmit(value.securityCode);
  };

  const handleClose = () => {
    close();
    onClose();
  };

  useImperativeHandle(
    ref,
    () => ({
      open,
      close: handleClose,
      setFieldError: (field, message) => {
        form.setFieldError(field, message);
      },
    }),
    [],
  );

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={<ModalTitle title="This profile is protected" icon={LockClosed} />}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput label="Security code" {...form.getInputProps('securityCode')} />
          <Button type="submit">Unlock</Button>
        </Stack>
      </form>
    </Modal>
  );
});

SecurityForm.displayName = 'SecurityForm';

export { SecurityForm };
export type { SecurityFormHandler };
