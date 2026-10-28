import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Pet } from '../types';
import { api } from '../api/endpoints';
import { setClientPetId } from '../api/client';

interface ActivePetContextType {
  pets: Pet[];
  activePet: Pet | null;
  reloadPets: () => Promise<void>;
  switchPet: (petId: string) => Promise<void>;
  addPet: (data: Partial<Pet>) => Promise<Pet>;
}

const ActivePetContext = createContext<ActivePetContextType>({
  pets: [],
  activePet: null,
  reloadPets: async () => {},
  switchPet: async () => {},
  addPet: async () => ({} as Pet),
});

export const ActivePetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<Pet | null>(null);

  const reloadPets = useCallback(async () => {
    try {
      const list = await api.getMyPets();
      setPets(list);
      const primary = list.find((p) => p.isPrimary) || list[0] || null;
      setActivePet(primary);
      if (primary) setClientPetId(primary.id);
    } catch (err) {
      console.error('Failed to load pets:', err);
    }
  }, []);

  useEffect(() => {
    reloadPets();
  }, [reloadPets]);

  const switchPet = useCallback(
    async (petId: string) => {
      try {
        await api.setPrimaryPet(petId);
        const target = pets.find((p) => p.id === petId) || null;
        if (target) {
          setActivePet(target);
          setClientPetId(target.id);
        }
        await reloadPets();
      } catch (err) {
        console.error('Failed to switch active pet:', err);
      }
    },
    [pets, reloadPets],
  );

  const addPet = useCallback(
    async (data: Partial<Pet>) => {
      const created = await api.createPet(data);
      await reloadPets();
      setActivePet(created);
      setClientPetId(created.id);
      return created;
    },
    [reloadPets],
  );

  return (
    <ActivePetContext.Provider value={{ pets, activePet, reloadPets, switchPet, addPet }}>
      {children}
    </ActivePetContext.Provider>
  );
};

export const useActivePet = () => useContext(ActivePetContext);
