import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './main.css';

import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { createRoot } from 'react-dom/client';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <MantineProvider
    theme={{
      primaryColor: 'lime',
      defaultRadius: 'md',
    }}
  >
    <Notifications position="top-right" />
    <ModalsProvider>
      <App />
    </ModalsProvider>
  </MantineProvider>,
);
