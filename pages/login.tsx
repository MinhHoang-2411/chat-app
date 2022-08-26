import Button from "@mui/material/Button";
import Image from "next/image";
import Head from "next/head";
import styled from "styled-components";
import ChatAppLogo from "../assets/chatapplogo.png";
import {useSignInWithGoogle} from "react-firebase-hooks/auth";
import {auth} from "../config/firebase";

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: whitesmoke;
`;
const StyledLoginContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 100px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
`;

const StyledImageContainer = styled.div`
  margin-bottom: 50px;
`;

const Login = () => {
  const [signInWithGoogle, _user, _loading, _error] = useSignInWithGoogle(auth);
  const signIn = () => {
    signInWithGoogle();
  };
  return (
    <StyledContainer>
      <Head>
        <title>Login</title>
      </Head>
      <StyledLoginContainer>
        <StyledImageContainer>
          <Image
            src={ChatAppLogo}
            height="200px"
            width="200px"
            alt="Chat App Logo"
          />
        </StyledImageContainer>
        <Button variant="outlined" onClick={signIn}>
          Sign in with Google
        </Button>
      </StyledLoginContainer>
    </StyledContainer>
  );
};

export default Login;
