import React, { useState } from "react";
import { auth, googleProvider } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import {
  Container,
  TextField,
  Button,
  Typography,
  Link,
  Stack,
  Alert
} from "@mui/material";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true); // toggle login/signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleEmailPasswordAuth = async () => {
    clearMessages();
    try {
      if (isLogin) {
        // login
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess("Logged in successfully!");
      } else {
        // signup
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccess("Account created successfully!");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleAuth = async () => {
    clearMessages();
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccess(isLogin ? "Logged in with Google!" : "Signed up with Google!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        {isLogin ? "Login" : "Sign Up"}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TextField
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <Stack spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleEmailPasswordAuth}>
          {isLogin ? "Login" : "Sign Up"}
        </Button>

        <Button variant="outlined" onClick={handleGoogleAuth}>
          {isLogin ? "Login with Google" : "Sign up with Google"}
        </Button>

        <Typography variant="body2" align="center">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link
            href="#"
            onClick={e => {
              e.preventDefault();
              setIsLogin(!isLogin);
              clearMessages();
            }}
          >
            {isLogin ? "Sign Up" : "Login"}
          </Link>
        </Typography>
      </Stack>
    </Container>
  );
};

export default AuthForm;
