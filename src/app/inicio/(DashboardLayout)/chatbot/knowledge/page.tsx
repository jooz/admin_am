"use client";
import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Alert,
} from "@mui/material";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";

const KnowledgeBasePage = () => {
    const [knowledge, setKnowledge] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [currentEntry, setCurrentEntry] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchKnowledge = async () => {
        try {
            const res = await fetch("/api/knowledge");
            const data = await res.json();
            setKnowledge(data);
        } catch (err) {
            setError("Error al cargar la base de conocimientos");
        }
    };

    useEffect(() => {
        fetchKnowledge();
    }, []);

    const handleOpen = (entry: any = null) => {
        setCurrentEntry(entry || { question: "", answer: "", category: "", active: true });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentEntry(null);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const method = currentEntry.id ? "PUT" : "POST";
            const res = await fetch("/api/knowledge", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentEntry),
            });

            if (res.ok) {
                fetchKnowledge();
                handleClose();
            } else {
                setError("Error al guardar");
            }
        } catch (err) {
            setError("Error de red");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este ítem?")) return;
        try {
            const res = await fetch(`/api/knowledge?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchKnowledge();
        } catch (err) {
            setError("Error al eliminar");
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="600">Base de Conocimiento (FAQ)</Typography>
                <Button variant="contained" startIcon={<IconPlus />} onClick={() => handleOpen()}>
                    Nuevo Ítem
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Pregunta</TableCell>
                            <TableCell>Categoría</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {knowledge.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.question}</TableCell>
                                <TableCell>{item.category}</TableCell>
                                <TableCell>{item.active ? "Activo" : "Inactivo"}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpen(item)} color="primary">
                                        <IconEdit size="20" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(item.id)} color="error">
                                        <IconTrash size="20" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>{currentEntry?.id ? "Editar Ítem" : "Nuevo Ítem"}</DialogTitle>
                <DialogContent>
                    <Box pt={1} display="flex" flexDirection="column" gap={2}>
                        <TextField
                            label="Pregunta"
                            fullWidth
                            value={currentEntry?.question || ""}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, question: e.target.value })}
                        />
                        <TextField
                            label="Respuesta"
                            fullWidth
                            multiline
                            rows={4}
                            value={currentEntry?.answer || ""}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, answer: e.target.value })}
                        />
                        <TextField
                            label="Categoría"
                            fullWidth
                            value={currentEntry?.category || ""}
                            onChange={(e) => setCurrentEntry({ ...currentEntry, category: e.target.value })}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={currentEntry?.active ?? true}
                                    onChange={(e) => setCurrentEntry({ ...currentEntry, active: e.target.checked })}
                                />
                            }
                            label="Activo"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained" disabled={loading}>
                        {loading ? "Guardando..." : "Guardar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default KnowledgeBasePage;
