import { useMemo } from 'react';

interface Contact {
  name: string;
  id: string;
}

export const useFilteredContacts = (contacts: Contact[], searchTerm: string) => {
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);

  return filteredContacts;
};
