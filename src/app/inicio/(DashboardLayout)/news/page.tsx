"use client";
import { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Grid,
    Chip,
    Alert,
    AlertTitle,
    Stack,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    useTheme,
    FormControlLabel,
    Checkbox,
    Card,
    CardContent,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import {
    IconX,
    IconCheck,
    IconArrowRight,
    IconPhoto,
} from "@tabler/icons-react";

const categoriesSpanish = [
    "General",
    "Anuncios",
    "Eventos",
    "Proyectos",
    "Comunidad",
    "Emergencia",
    "Actualizaciones",
];

const NewsCreatePage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isDirty },
    } = useForm({
        defaultValues: {
            title: "",
            slug: "",
            content: "",
            excerpt: "",
            image: "",
            published: false,
            category: "General",
        },
    });

    const watchTitle = watch("title");
    const watchCategory = watch("category");
    const watchExcerpt = watch("excerpt");
    const watchImage = watch("image");
    
    // Autogenerate slug for preview
    const generatedSlug = watchTitle 
        ? watchTitle.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, '')
        : "";

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreview(e.target?.result as string);
                    setSelectedImage(file);
                };
                reader.readAsDataURL(file);
            } else {
                setError("Por favor seleccione un archivo de imagen válido.");
            }
        }
    };

    const onSubmit = async (data: any) => {
        if (!session) {
            setError("Debe iniciar sesión para crear noticias.");
            return;
        }

        if (!selectedImage && !data.image) {
            setError("Por favor suba una imagen o proporcione una URL.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("slug", generatedSlug);
            formData.append("content", data.content);
            formData.append("excerpt", data.excerpt);
            formData.append("published", data.published ? "true" : "false");
            formData.append("category", data.category);

            if (selectedImage) {
                formData.append("image", selectedImage);
            } else if (data.image) {
                formData.append("image", data.image);
            }

            const response = await fetch('/api/news', { method: 'POST', body: formData });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Hubo un problema al crear la noticia");
            }

            setSuccess("¡Noticia creada exitosamente!");
            setTimeout(() => {
                router.push("/inicio/news");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Error al crear la noticia");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDialogClose = () => {
        setConfirmDialogOpen(false);
    };

    const handleConfirmDialogConfirm = () => {
        reset();
        setImagePreview("");
        setSelectedImage(null);
        setConfirmDialogOpen(false);
    };

    return (
        <Box p={4}>
            <Typography variant="h4" fontWeight="600" mb={4}>
                Crear Noticia
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    <AlertTitle>Error</AlertTitle>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    <AlertTitle>Éxito</AlertTitle>
                    {success}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <TextField
                            {...register("title", {
                                required: "El título es obligatorio",
                                minLength: { value: 3, message: "El título debe tener al menos 3 caracteres" },
                            })}
                            label="Título"
                            fullWidth
                            variant="outlined"
                            error={!!errors.title}
                            helperText={errors.title?.message}
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            value={generatedSlug}
                            label="Slug (generado automáticamente desde el título)"
                            fullWidth
                            variant="outlined"
                            placeholder="generado automáticamente"
                            sx={{ mb: 3 }}
                            disabled
                        />

                        <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                            <InputLabel>Categoría</InputLabel>
                            <Select
                                {...register("category", { required: true })}
                                label="Categoría"
                                error={!!errors.category}
                            >
                                {categoriesSpanish.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight="600" mb={1}>
                                Imagen
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    mb: 2,
                                }}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: "none" }}
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<IconPhoto />}
                                        size="small"
                                    >
                                        Subir Imagen
                                    </Button>
                                </label>
                                {imagePreview && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <Avatar
                                            variant="square"
                                            src={imagePreview}
                                            sx={{ width: 40, height: 40 }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setImagePreview("");
                                                setSelectedImage(null);
                                            }}
                                        >
                                            <IconX size={16} />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                            <TextField
                                {...register("image")}
                                label="O proporcionar URL de imagen"
                                fullWidth
                                variant="outlined"
                                placeholder="https://ejemplo.com/imagen.jpg"
                            />
                        </FormControl>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight="600" mb={2}>
                                Contenido
                            </Typography>
                            <TextField
                                {...register("content", { required: "El contenido es obligatorio" })}
                                fullWidth
                                multiline
                                minRows={10}
                                variant="outlined"
                                placeholder="Escribe el contenido de la noticia aquí..."
                                error={!!errors.content}
                                helperText={errors.content?.message}
                            />
                        </Box>

                        <TextField
                            {...register("excerpt", {
                                required: "El extracto es obligatorio",
                                maxLength: { value: 300, message: "El extracto debe tener 300 caracteres o menos" },
                            })}
                            label="Extracto"
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            error={!!errors.excerpt}
                            helperText={errors.excerpt?.message}
                            sx={{ mb: 3 }}
                        />

                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                alignItems: "center",
                                mb: 3,
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        {...register("published")}
                                        defaultChecked={false}
                                    />
                                }
                                label="Publicar inmediatamente"
                            />
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight="600" mb={3}>
                                    Vista Previa
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        mb: 3,
                                        borderRadius: 2,
                                        overflow: "hidden",
                                        border: "1px solid",
                                        borderColor: "grey.200",
                                        boxShadow: 2,
                                        bgcolor: "white",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: "relative",
                                            width: "100%",
                                            height: 192,
                                            bgcolor: "grey.100",
                                        }}
                                    >
                                        {(imagePreview || watchImage) ? (
                                            <Box
                                                component="img"
                                                src={imagePreview || watchImage}
                                                alt="Preview"
                                                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <IconPhoto size={48} color="#9e9e9e" />
                                            </Box>
                                        )}
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                top: 16,
                                                left: 16,
                                                bgcolor: "#1d4ed8", // brand blue
                                                color: "white",
                                                fontSize: "0.625rem",
                                                fontWeight: "bold",
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                textTransform: "uppercase",
                                                boxShadow: 1,
                                            }}
                                        >
                                            {watchCategory || "Categoría"}
                                        </Box>
                                    </Box>
                                    <Box p={3}>
                                        <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '3.5rem', lineHeight: 1.2 }}>
                                            {watchTitle || "Título de la noticia"}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {watchExcerpt || "Este es un extracto de ejemplo de la noticia que muestra cómo se verá el texto en la plataforma para los ciudadanos..."}
                                        </Typography>
                                        
                                        <Typography variant="body2" fontWeight="bold" color="#1d4ed8" sx={{ display: 'flex', alignItems: 'center' }}>
                                            Leer más <IconArrowRight size={16} style={{ marginLeft: 4 }} />
                                        </Typography>
                                    </Box>
                                </Box>

                                <Stack direction="column" spacing={2}>
                                    <Button
                                        variant="contained"
                                        type="submit"
                                        startIcon={<IconCheck />}
                                        disabled={loading || !isDirty}
                                        fullWidth
                                    >
                                        {loading ? "Creando..." : "Crear Noticia"}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setConfirmDialogOpen(true)}
                                        startIcon={<IconX />}
                                        disabled={!isDirty}
                                        fullWidth
                                    >
                                        Limpiar Formulario
                                    </Button>
                                    <Button
                                        variant="text"
                                        onClick={() => router.back()}
                                        startIcon={<IconArrowRight />}
                                        fullWidth
                                    >
                                        Cancelar
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            <Dialog open={confirmDialogOpen} onClose={handleConfirmDialogClose}>
                <DialogTitle>Limpiar Formulario</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Está seguro que desea limpiar todos los campos? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDialogClose}>Cancelar</Button>
                    <Button onClick={handleConfirmDialogConfirm} autoFocus color="error">
                        Limpiar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NewsCreatePage;