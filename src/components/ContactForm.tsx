import { Button, FormControl, FormErrorMessage, FormLabel, Input, VStack } from "@chakra-ui/react";
import React, { FunctionComponent, useContext } from "react";
import { useForm } from "react-hook-form";
import { ContactContext } from "./ContactContext";
import { useNavigate } from "react-router-dom";

interface IContactForm {
    onSubmit: (values: any) => void,
    defaultValues?: {
        name: string;
        description: string;
    }
}

export const ContactForm: FunctionComponent<IContactForm> = ({defaultValues, onSubmit}) => {
    const {
        handleSubmit,
        register,
        formState: { errors },
      } = useForm({
        defaultValues,
      });     

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <VStack gap={2}>
                <FormControl isRequired>
                    <FormLabel>Full Name</FormLabel>
                    <Input 
                        placeholder="Full Name" 
                        {...register('name', {
                            required: 'This is required',
                        })}
                    />
                </FormControl>
                <FormErrorMessage>
                    {errors?.name?.message?.toString()}
                </FormErrorMessage>
                <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Input 
                        placeholder="Description"
                        {...register('description', {
                            required: 'This is required',
                        })} 
                    />
                </FormControl>
                <FormErrorMessage>
                    {errors?.description?.message?.toString()}
                </FormErrorMessage>
                <Button colorScheme="blue" size="lg" width="100%" type="submit">Submit</Button>
            </VStack>
        </form>
    );
}