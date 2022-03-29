import React, { useCallback, useRef, useContext } from "react";
import { FiLogIn, FiMail, FiLock } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web'
import * as Yup from 'yup';

import { useAuth } from "../../hooks/auth";
import getValidationErrors from '../../utils/getValidationErrors'

import logoImg from '../../assets/logo.svg';

import Input from "../../components/Input";
import Button from "../../components/Button";

import { Container, Content, Background } from './styles';

interface SignInFormData {
    email: string;
    password: string;
}

const SignIn: React.FC = () => {
    const formRef = useRef<FormHandles>(null);

    const { signIn, user } = useAuth();

    console.log(user)

    const handleSubmit = useCallback(async (data: SignInFormData) => {
        try {

            formRef.current?.setErrors({});

            const schema = Yup.object().shape({
                email: Yup.string().required('Email obrigatório').email('Digite um email válido'),
                password: Yup.string().min(6, 'No mínimo 6 dígitos'),
            });

            await schema.validate(data, {
                abortEarly: false,
            });

            signIn({
                email: data.email,
                password: data.password,
            })
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                console.log(err)
                const errors = getValidationErrors(err);

                formRef.current?.setErrors(errors);
                return;
            }
            //disparar um toast
        }
    }, [signIn])
    //toda variavel que é de fora do useCallback, deve ser inserida no array de dependencias do mesmo.
    

    return (
        <Container>
            <Content>
                <img src={logoImg} alt="gobarber" />

                <Form ref={formRef} onSubmit={handleSubmit}>
                    <h1>Faça seu logon</h1>
                    <Input icon={FiMail} name='email' placeholder="E-mail" />
                    <Input icon={FiLock} name='password' type="password" placeholder="Senha" />

                    <Button type="submit">Entrar</Button>

                    <a href="forgot">Esqueci minha senha</a>
                </Form>

                <a href="">
                    <FiLogIn />
                    Criar conta
                </a>

            </Content>
            <Background />
        </Container>
    )
};

export default SignIn;