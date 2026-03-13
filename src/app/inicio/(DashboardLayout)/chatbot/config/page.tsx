"use client";
import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    Paper,
    TextField,
    Switch,
    FormControlLabel,
    Alert,
    Card,
    CardContent,
    Grid,
} from "@mui/material";
import { IconCheck } from "@tabler/icons-react";

const ChatConfigPage = () => {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch("/api/chat-config");
                const data = await res.json();
                setConfig(data);
            } catch (err) {
                setError("Error al cargar la configuración");
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch("/api/chat-config", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });

            if (res.ok) {
                setSuccess("Configuración guardada exitosamente");
            } else {
                setError("Error al guardar");
            }
        } catch (err) {
            setError("Error de red");
        } finally {
            setLoading(false);
        }
    };

    if (!config) return <Typography>Cargando...</Typography>;

    return (
        <Box>
            <Typography variant="h4" fontWeight="600" mb={3}>Configuración del Chatbot</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Box display="flex" flexDirection="column" gap={3}>
                                <TextField
                                    label="Nombre del Bot"
                                    fullWidth
                                    value={config.botName}
                                    onChange={(e) => setConfig({ ...config, botName: e.target.value })}
                                />
                                <TextField
                                    label="Mensaje de Bienvenida"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={config.welcomeMessage}
                                    onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={config.enabled}
                                            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                                        />
                                    }
                                    label="Habilitar Chat en la Web"
                                />
                                <Box mt={2}>
                                    <Button
                                        variant="contained"
                                        startIcon={<IconCheck />}
                                        onClick={handleSave}
                                        disabled={loading}
                                        size="large"
                                    >
                                        {loading ? "Guardando..." : "Guardar Cambios"}
                                    </Button>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                        <CardContent>
                            <Typography variant="h6" mb={2}>Vista Previa del Mensaje</Typography>
                            <Box 
                                sx={{ 
                                    bgcolor: 'white', 
                                    p: 2, 
                                    borderRadius: 2, 
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    border: '1px solid',
                                    borderColor: 'grey.200'
                                }}
                            >
                                <Typography variant="subtitle2" color="primary" fontWeight="bold">
                                    {config.botName}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {config.welcomeMessage}
                                </Typography>
                            </Box>
                            <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                                * Este es el mensaje inicial que verán los ciudadanos al abrir el chat.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ChatConfigPage;
