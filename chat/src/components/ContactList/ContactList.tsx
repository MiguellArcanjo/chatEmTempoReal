import Card from "../card/card";
import "./ContactList.css"

interface ContactListProps {
    filteredContacts: any[];
    setSelectedChat: (id: string) => void;
    fetchMessages: (contactId: string) => void;
    setSelectedContactName: (name: string) => void;
}
  
export const ContactList: React.FC<ContactListProps> = ({
    filteredContacts,
    setSelectedChat,
    fetchMessages,
    setSelectedContactName,
  }) => {
    return (
        <div className="divContatos">
          {filteredContacts?.map((contact) => (
            <div className="cardContainer" key={contact.id}>
              <Card 
                name={contact.name}
                onClick={() => {
                  setSelectedChat(contact.id);
                  setSelectedContactName(contact.name);
                  fetchMessages(contact.id);
                }}
              />
            </div>
          ))}
        </div>
    );
};
  