"use client";
import { useState, useEffect } from "react";
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
    Alert,
    AlertTitle,
    Avatar,
    Dialog,
    DialogTitle,
    DialogActions,
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
    "Gestión",
    "Vialidad",
    "Ambiente",
    "Social",
    "Política",
    "Turismo",
    "Seguridad",
    "Deporte",
];

const NewsCreatePage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [additionalImages, setAdditionalImages] = useState<File[]>([]);
    const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);

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

    const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(file => file.type.startsWith("image/"));
            
            if (validFiles.length !== files.length) {
                setError("Algunos archivos no eran imágenes válidas y fueron ignorados.");
            }

            const newPreviews: string[] = [];
            let loaded = 0;

            validFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    newPreviews.push(e.target?.result as string);
                    loaded++;
                    if (loaded === validFiles.length) {
                        setAdditionalPreviews(prev => [...prev, ...newPreviews]);
                        setAdditionalImages(prev => [...prev, ...validFiles]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeAdditionalImage = (index: number) => {
        setAdditionalImages(prev => prev.filter((_, i) => i !== index));
        setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
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

            additionalImages.forEach(file => {
                formData.append("additionalImages", file);
            });

            const response = await fetch('/api/news', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Hubo un problema al crear la noticia");
            }

            setSuccess("¡Noticia creada exitosamente!");
            reset();
            setImagePreview("");
            setSelectedImage(null);
            setAdditionalImages([]);
            setAdditionalPreviews([]);

            setTimeout(() => {
                router.push("/inicio/news");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Error al crear la noticia");
        } finally {
            setLoading(false);
        }
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
                            {...register("title", { required: "El título es obligatorio" })}
                            label="Título"
                            fullWidth
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            value={generatedSlug}
                            label="Slug (Autogenerado)"
                            fullWidth
                            sx={{ mb: 3 }}
                            disabled
                        />

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Categoría</InputLabel>
                            <Select {...register("category")} label="Categoría">
                                {categoriesSpanish.map((cat) => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight="600" mb={1}>Imagen de Portada</Typography>
                            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: "none" }}
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload">
                                    <Button variant="outlined" component="span" startIcon={<IconPhoto />}>
                                        Seleccionar Portada
                                    </Button>
                                </label>
                                {imagePreview && (
                                    <Avatar src={imagePreview} variant="square" sx={{ width: 56, height: 56 }} />
                                )}
                            </Box>
                            <TextField
                                {...register("image")}
                                label="O pega una URL de imagen para portada"
                                fullWidth
                                placeholder="https://..."
                            />
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight="600" mb={1}>Fotos Adicionales (Galería)</Typography>
                            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleAdditionalImagesUpload}
                                    style={{ display: "none" }}
                                    id="additional-images-upload"
                                />
                                <label htmlFor="additional-images-upload">
                                    <Button variant="outlined" color="secondary" component="span" startIcon={<IconPhoto />}>
                                        Agregar Fotos
                                    </Button>
                                </label>
                            </Box>
                            
                            {additionalPreviews.length > 0 && (
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                                    {additionalPreviews.map((preview, index) => (
                                        <Box key={index} sx={{ position: 'relative' }}>
                                            <Avatar src={preview} variant="square" sx={{ width: 80, height: 80, borderRadius: 1 }} />
                                            <IconButton 
                                                size="small" 
                                                color="error" 
                                                sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'white', '&:hover': { bgcolor: '#f5f5f5' } }}
                                                onClick={() => removeAdditionalImage(index)}
                                            >
                                                <IconX size={16} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        <TextField
                            {...register("content", { required: "El contenido es obligatorio" })}
                            label="Contenido"
                            fullWidth
                            multiline
                            rows={10}
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            {...register("excerpt", { required: "El extracto es obligatorio" })}
                            label="Extracto (Resumen)"
                            fullWidth
                            multiline
                            rows={3}
                            sx={{ mb: 3 }}
                        />

                        <FormControlLabel
                            control={<Checkbox {...register("published")} />}
                            label="Publicar inmediatamente"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" mb={2}>Vista Previa</Typography>
                                <Box sx={{ mb: 2, height: 200, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                                    {(imagePreview || watchImage) ? (
                                        <img src={imagePreview || watchImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                            <IconPhoto size={48} />
                                        </Box>
                                    )}
                                </Box>
                                <Typography variant="subtitle2" color="primary">{watchCategory}</Typography>
                                <Typography variant="h6">{watchTitle || "Sin título"}</Typography>
                                <Typography variant="body2" color="textSecondary" mb={2}>{watchExcerpt}</Typography>

                                <Button
                                    variant="contained"
                                    type="submit"
                                    fullWidth
                                    disabled={loading}
                                    startIcon={<IconCheck />}
                                >
                                    {loading ? "Guardando..." : "Guardar Noticia"}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                <DialogTitle>¿Limpiar formulario?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)}>No</Button>
                    <Button onClick={() => { 
                        reset(); 
                        setImagePreview(""); 
                        setSelectedImage(null);
                        setAdditionalImages([]);
                        setAdditionalPreviews([]);
                        setConfirmDialogOpen(false); 
                    }} color="error">Sí, limpiar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NewsCreatePage;