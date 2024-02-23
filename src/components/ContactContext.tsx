import React, { FunctionComponent, PropsWithChildren, createContext, useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc, getDocs, query, where, limit, getCountFromServer, startAfter, orderBy } from "firebase/firestore"; 

interface IContact {
    id: string;
    name: string;
    description: string;
}

interface IContactContext {
    contacts: any[];
    addContact: (name: string, description: string) => Promise<string>;
    getContactById: (id: string) => Promise<IContact | undefined>;
    editContact: (id: string, name: string, description: string) => Promise<void>;
    deleteContact: (id: string) => Promise<void>;
    setSearch: (search: string) => void;
    total: number;
    handleFetch: (loadOneMore: boolean) => Promise<void>;
};

export const ContactContext = createContext<IContactContext>({
    addContact: () => new Promise((resolve) => resolve("")),
    getContactById: () => new Promise((resolve) => resolve(undefined)),
    editContact: () => new Promise((resolve) => resolve()),
    deleteContact: () => new Promise((resolve) => resolve()),
    setSearch: () => {},
    total: 0,
    contacts: [],
    handleFetch: () => new Promise((resolve) => resolve()),
});

export const ContactProvider: FunctionComponent<PropsWithChildren> = ({children}) => {
    const [contacts, setContacts] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [total, setTotal] = useState(0);
    const getContactById = async (id: string) => {
        const docRef = doc(db, "contacts", id);
        const docSnapshot = await getDoc(docRef);

        if(!docSnapshot.exists()) return;

        return docSnapshot.data() as IContact;  

        // return contacts.find((contact) => contact.id === id);
    };
    const addContact = async (name: string, description: string): Promise<string> => {
        const contactRef = await addDoc(collection(db, "contacts"), {
            name,
            description,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        
        return contactRef.id;
    };

    /**
     * Edit a contact with the given id, name, and description.
     *
     * @param {string} id - The id of the contact to be edited
     * @param {string} name - The new name for the contact
     * @param {string} description - The new description for the contact
     * @return {Promise<void>} A promise that resolves when the contact has been edited
    */
    const editContact = async (
        id: string, 
        name: string, 
        description: string
    ): Promise<void> => {
        const contactRef = doc(db, "contacts", id);
            await updateDoc(contactRef, {
                name,
                description,
                updatedAt: serverTimestamp(),
        });
    };

    const deleteContact = async (id: string) => {
        const contactRef = doc(db, "contacts", id);
            await deleteDoc(contactRef);
    };

    const handleFetch = async (loadOneMore?: boolean) => {
        const contactsCollectionRef = collection(db, "contacts");
        const lastVisible = contacts[contacts.length - 1];
        const pagination = loadOneMore 
            ? [startAfter(lastVisible)] 
            : [];
        
        const filter = [
            where("name", ">=", search),
            where("name", "<=", search + '\uf8ff'),
        ];
        const contactQuery = query(contactsCollectionRef, 
            ...filter,
            orderBy("name"),
            ...pagination,
            limit(1)
        );
        const contactCount = query(contactsCollectionRef,
            ...filter,
        );
        const totalCount = await getCountFromServer(contactCount);
        const docsSnapshot = await getDocs(contactQuery);

        setContacts(
            loadOneMore ? [...contacts, ...docsSnapshot.docs] : docsSnapshot.docs
        );
        setTotal(totalCount.data().count - (loadOneMore ? docsSnapshot.size : 0));
    };

    useEffect(() => {
        handleFetch();
    }, [search]);

    return <ContactContext.Provider value={{
        total,
        contacts, 
        getContactById, 
        addContact, 
        editContact, 
        deleteContact,
        setSearch,
        handleFetch,
    }}>
        {children}
    </ContactContext.Provider>;
}

