import React, { ChangeEvent, FormEvent, useCallback, useRef } from "react";
import { FiMail, FiUser, FiLock, FiCamera, FiArrowLeft } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { Link, useHistory } from 'react-router-dom';
import * as Yup from 'yup';

import api from "../../services/apiClient";
import { useToast } from "../../hooks/toast";
import { useAuth } from "../../hooks/auth";

import getValidationErrors from '../../utils/getValidationErrors';

import Input from "../../components/Input";
import Button from "../../components/Button";

import { Container, Content, AvatarInput } from './styles';

interface ProfileFormData {
    name: string;
    email: string;
    password: string;
    old_password: string;
    password_confirmation: string;
}

const Profile: React.FC = () => {

    const formRef = useRef<FormHandles>(null);
    const { addToast } = useToast();
    const history = useHistory();

    const { user, updateUser } = useAuth();

    const handleSubmit = useCallback(async (data: ProfileFormData) => {
        try {

            formRef.current?.setErrors({});

            const schema = Yup.object().shape({
                name: Yup.string().required('Nome obrigatório'),
                email: Yup.string().required('Email obrigatório').email('Digite um email válido'),
                old_password: Yup.string(),
                password: Yup.string().when('old_password', {
                    is: val => val.length,
                    then: Yup.string().required('Campo obrigatório'),
                    otherwise: Yup.string(),
                }),
                password_confirmation: Yup.string()
                    .when('old_password', {
                        is: val => val.length,
                        then: Yup.string().required('Campo obrigatório'),
                        otherwise: Yup.string(),
                    })
                    .oneOf(
                        [Yup.ref('password'),],
                        'Confirmação incorreta',
                    )
            });

            await schema.validate(data, {
                abortEarly: false,
            });

            const formData = Object.assign({
                name: data.name,
                email: data.email
            }, data.old_password ? {
                old_password: data.old_password,
                password: data.password,
                password_confirmation: data.password_confirmation,
            } : {});

            const response = await api.put('/profile', formData);

            updateUser(response.data);

            history.push('/dashboard')

            addToast({
                type: 'success',
                title: 'Perfil atualizado!',
                description: 'Suas informações do perfil foram atualizadas com sucesso!'
            })


        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                console.log(err)
                const errors = getValidationErrors(err);

                formRef.current?.setErrors(errors);
                return;
            }

            addToast({
                type: 'error',
                title: 'Erro na atualização',
                description: 'Ocorreu erro ao atualizar o perfil, tente novamente.'
            });
        }
    }, [addToast, history])

    const handleAvatarChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {

        if (e.target.files) {

            const data = new FormData();

            data.append('avatar', e.target.files[0])

            await api.patch('users/avatar', data).then((response) => {
                updateUser(response.data);
                addToast({
                    type: 'success',
                    title: 'Imagem atualizada!'
                })
            });
        }

    }, [addToast, updateUser])

    return (
        <Container>

            <header>
                <div>
                    <Link to={'/dashboard'}>
                        <FiArrowLeft />
                    </Link>
                </div>
            </header>

            <Content>

                <Form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    initialData={{
                        name: user.name,
                        email: user.email
                    }}
                >

                    <AvatarInput>
                        <img src={user.avatar_url} alt={user.name} />
                        <label htmlFor="avatar">
                            <FiCamera />
                            <input
                                type="file"
                                id="avatar"
                                onChange={handleAvatarChange}
                            />
                        </label>


                    </AvatarInput>

                    <h1>Meu perfil</h1>

                    <Input
                        icon={FiUser}
                        name='name'
                        placeholder="Nome"
                    />

                    <Input
                        icon={FiMail}
                        name='email'
                        placeholder="E-mail"
                    />

                    <Input
                        containerStyle={{ marginTop: 24 }}
                        icon={FiLock}
                        name='old_password'
                        type="password"
                        placeholder="Senha atual"
                    />

                    <Input
                        icon={FiLock}
                        name='password'
                        type="password"
                        placeholder="Nova senha"
                    />

                    <Input
                        icon={FiLock}
                        name='password_confirmation'
                        type="password"
                        placeholder="Confirmar senha"
                    />

                    <Button type="submit">Confirmar mudanças</Button>

                </Form>
            </Content>
        </Container>
    )
};

export default Profile;