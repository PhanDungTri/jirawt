import { COMMAND } from '@constants/commands';
import type { ProfileDTO } from '@dtos/profile';
import { isCriticalError } from '@errors/critical-error';
import { AddProfileCard } from '@features/add-profile/add-profile-card';
import { ProfileCard } from '@features/view-profiles/profile-card';
import { SimpleGrid } from '@mantine/core';
import { invoke } from '@tauri-apps/api/tauri';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

import type { ScreenWithInitialLoadingListProps } from '../utils/types';
import { withInitialLoadingList } from '../with-initial-loading-list';

const InnerEntryScreen: FC<ScreenWithInitialLoadingListProps> = ({ setCriticalError, setLoading }) => {
  const [profiles, setProfiles] = useState<ProfileDTO[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const getProfiles = async () => {
    setLoading(true);

    try {
      const profiles = await invoke<ProfileDTO[]>(COMMAND.GET_PROFILES);
      setProfiles(profiles);
    } catch (e) {
      if (isCriticalError(e)) {
        setCriticalError(e.message);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    void getProfiles();
  }, []);

  return (
    <SimpleGrid cols={3}>
      {profiles.map((profile) => (
        <ProfileCard
          profile={profile}
          key={profile.id}
          onSelect={setSelectedProfile}
          onDeselect={() => {
            setSelectedProfile(null);
          }}
          loading={selectedProfile === profile.id}
          disabled={selectedProfile !== null && selectedProfile !== profile.id}
        />
      ))}
      <AddProfileCard onSuccess={getProfiles} />
    </SimpleGrid>
  );
};

const EntryScreen = withInitialLoadingList(InnerEntryScreen);

export { EntryScreen };
