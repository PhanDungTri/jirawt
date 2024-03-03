import { CaretForwardOutline } from '@components/icons/caret-forward-outline';
import type { CriticalError } from '@errors/critical-error';
import { Accordion, Group, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

const showCriticalErrorNotification = (e: CriticalError) => {
  notifications.show({
    title: 'Error',
    message: (
      <Stack gap="xs">
        {e.message}
        {e.detailedInfo ? (
          <Accordion variant="filled" chevron="">
            <Accordion.Item value="details">
              <Accordion.Control px="xs">
                <Text size="xs" c="gray">
                  <Group gap="xs">
                    <CaretForwardOutline />
                    <Text fw={500}>Details</Text>
                  </Group>
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text size="xs">{e.detailedInfo}</Text>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        ) : null}
      </Stack>
    ),
    color: 'red',
  });
};

const showUnauthorizedErrorNotification = () => {
  notifications.show({
    title: 'Error',
    message: 'The profile is unauthorized',
    color: 'red',
  });
};

export { showCriticalErrorNotification, showUnauthorizedErrorNotification };
