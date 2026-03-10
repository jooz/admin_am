"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import CustomTextField from "@/app/inicio/(DashboardLayout)/components/forms/theme-elements/CustomTextField";

interface loginType {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      setError("Credenciales inválidas. Por favor intente de nuevo.");
    } else {
      router.push("/inicio");
    }
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="username"
              mb="5px"
            >
              Usuario
            </Typography>
            <CustomTextField
              variant="outlined"
              fullWidth
              id="username"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              required
            />
          </Box>
          <Box mt="25px">
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="password"
              mb="5px"
            >
              Clave
            </Typography>
            <CustomTextField
              variant="outlined"
              fullWidth
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

        </Stack>
        <Box>
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            sx={{ mt: 3 }}
          >
            Iniciar Sesión
          </Button>
        </Box>

        {/* Footer Accent */}
        <Box
          mt={3}
          pt={2}
          borderTop={1}
          borderColor="grey.100"
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={1}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontWeight: 'bold'
            }}
          >
            Estado Falcón - Venezuela
          </Typography>
          <Box display="flex" gap={1}>
            <Box width={32} height={4} bgcolor="#F59E0B" borderRadius="full" />
            <Box width={32} height={4} bgcolor="#1E3A8A" borderRadius="full" />
            <Box width={32} height={4} bgcolor="#DC2626" borderRadius="full" />
          </Box>
        </Box>

        {subtitle}
      </form>
    </>
  );
};

export default AuthLogin;
