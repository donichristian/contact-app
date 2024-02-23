import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { ContactForm } from './ContactForm';
import { useNavigate, useParams } from 'react-router-dom';
import { ContactContext } from './ContactContext';
import { useEditableContext } from '@chakra-ui/react';

export const ContactEdit: FunctionComponent = () => {
    const {getContactById, editContact} = useContext(ContactContext);
    const {id} = useParams();
    const [contact, setContact] = useState<any>();
    const nagivate = useNavigate();
    const onSubmit = (values: any) => {
        editContact((id!), values.name, values.description);
        nagivate(`/contacts/${id!}`);
    };

    const handleFetch = async () => {
        const newContact = await getContactById(id!);
        setContact(newContact);
    }

    useEffect(() => {
        handleFetch();
    }, []);

    if (!contact) return null;

    return <ContactForm 
        defaultValues={contact}
        onSubmit={onSubmit}    
    />;
}