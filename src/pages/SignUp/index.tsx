import React, { useCallback, useRef } from "react";
import { FiArrowLeft, FiMail, FiUser, FiLock } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { Link, useHistory } from 'react-router-dom';
import * as Yup from 'yup';

import api from "../../services/apiClient";
import { useAuth } from "../../hooks/auth";
import { useToast } from "../../hooks/toast";


import getValidationErrors from '../../utils/getValidationErrors'

import logoImg from '../../assets/logo.svg';

import Input from "../../components/Input";
import Button from "../../components/Button";

import { Container, Content, AnimationContainer, Background } from './styles';

interface SignUpFormData{
    name: string;
    email: string;
    password: string;
}

const SignUp: React.FC = () => {

    const formRef = useRef<FormHandles>(null);
    const { addToast } = useToast(); 
    const history = useHistory();

    const handleSubmit = useCallback(async (data: SignUpFormData) => {
        try {

            formRef.current?.setErrors({});

            const schema = Yup.object().shape({
                name: Yup.string().required('Nome obrigatório'),
                email: Yup.string().required('Email obrigatório').email('Digite um email válido'),
                password: Yup.string().min(6, 'No mínimo 6 dígitos'),
            });

            await schema.validate(data, {
                abortEarly: false,
            });

            await api.post('/users', data);

            history.push('/')

            addToast({
                type: 'success',
                title: 'Cadastro realizado',
                description: 'Você ja pode fazer seu logon no GoBarber'
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
                title: 'Erro no cadastro',
                description: 'Ocorreu um erro ao fazer cadastro, tente novamente.'
            });
        }
    }, [addToast, history])

    return (
        <Container>
            <Background />
            <Content>
                <AnimationContainer>
                    <img src={logoImg} alt="gobarber" />

                    <Form ref={formRef} onSubmit={handleSubmit}>
                        <h1>Faça seu cadastro</h1>
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
                            icon={FiLock}
                            name='password'
                            type="password"
                            placeholder="Senha"
                        />

                        <Button type="submit">Cadastrar</Button>

                    </Form>

                    <Link to="/">
                        <FiArrowLeft />
                        Voltar para login
                    </Link>
                </AnimationContainer>
            </Content>
        </Container>
    )
};

export default SignUp;