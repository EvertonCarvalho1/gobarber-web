import React, { useCallback, useRef, useContext } from "react";
import { FiLogIn, FiMail, FiLock } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web'
import * as Yup from 'yup';
import { Link, useHistory } from 'react-router-dom';

import { useAuth } from "../../hooks/auth";
import { useToast } from "../../hooks/toast";
import getValidationErrors from '../../utils/getValidationErrors'

import logoImg from '../../assets/logo.svg';

import Input from "../../components/Input";
import Button from "../../components/Button";

import { Container, Content, AnimationContainer, Background } from './styles';

interface SignInFormData {
    email: string;
    password: string;
}

const SignIn: React.FC = () => {
    const formRef = useRef<FormHandles>(null);
    const history = useHistory();

    const { signIn } = useAuth();
    const { addToast } = useToast();

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

            await signIn({
                email: data.email,
                password: data.password,
            })
            history.push('/dashboard')
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                console.log(err)
                const errors = getValidationErrors(err);

                formRef.current?.setErrors(errors);
                return;
            }

            addToast({
                type: 'error',
                title: 'Algo deu errado',
                description: 'Verifique e tente novamente'
            });
        }
    }, [signIn, addToast, history])
    //toda variavel que é de fora do useCallback, deve ser inserida no array de dependencias do mesmo.


    return (
        <Container>

            <Content>
                <AnimationContainer>
                    <img src={logoImg} alt="gobarber" />

                    <Form ref={formRef} onSubmit={handleSubmit}>
                        <h1>Faça seu login</h1>
                        <Input icon={FiMail} name='email' placeholder="E-mail" />
                        <Input icon={FiLock} name='password' type="password" placeholder="Senha" />

                        <Button type="submit">Entrar</Button>

                        <Link to="/forgotpassword">
                        
                        Esqueci minha senha
                    </Link>
                    </Form>

                    <Link to="/signup">
                        <FiLogIn />
                        Criar conta
                    </Link>
                </AnimationContainer>
            </Content>

            <Background />
        </Container>
    )
};

export default SignIn;