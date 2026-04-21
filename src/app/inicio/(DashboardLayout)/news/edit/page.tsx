"use client";
import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Alert,
    AlertTitle,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Checkbox,
    Card,
    CardContent,
    CardMedia,
    IconButton,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    Paper,
    TableRow,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import {
    IconX,
    IconCheck,
    IconPhoto,
    IconSearch,
    IconTrash,
    IconEdit,
    IconArrowLeft,
    IconArrowLeftCircle,
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

interface News {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    image: string;
    published: boolean;
    category: string;
    createdAt: string;
    updatedAt: string;
}

const NewsEditPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [newsList, setNewsList] = useState<News[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [selectedNews, setSelectedNews] = useState<News | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [newsToDelete, setNewsToDelete] = useState<News | null>(null);
    const router = useRouter();
    const { data: session } = useSession();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
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

    useEffect(() => {
        fetchNews();
    }, []);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const fetchNews = async () => {
        try {
            const response = await fetch('/api/news');
            if (response.ok) {
                const data = await response.json();
                setNewsList(data);
            }
        } catch (err) {
            console.error("Error fetching news:", err);
        }
    };

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

    const filteredNews = newsList.filter((news) => {
        const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            news.excerpt.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesDate = true;
        if (searchDate) {
            const newsDate = new Date(news.createdAt).toISOString().split('T')[0];
            matchesDate = newsDate === searchDate;
        }

        return matchesSearch && matchesDate;
    });

    const handleEditNews = (news: News) => {
        setSelectedNews(news);
        setValue("title", news.title);
        setValue("slug", news.slug);
        setValue("content", news.content);
        setValue("excerpt", news.excerpt);
        setValue("image", news.image);
        setValue("published", news.published);
        setValue("category", news.category);
        setImagePreview(news.image);
        setSelectedImage(null);
    };

    const handleDeleteClick = (news: News) => {
        setNewsToDelete(news);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!newsToDelete) return;

        try {
            const response = await fetch(`/api/news?id=${newsToDelete.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setSuccess("Noticia eliminada exitosamente");
                fetchNews();
            } else {
                throw new Error("Error al eliminar la noticia");
            }
        } catch (err) {
            setError("Error al eliminar la noticia");
        } finally {
            setDeleteDialogOpen(false);
            setNewsToDelete(null);
        }
    };

    const onSubmit = async (data: any) => {
        if (!session) {
            setError("Debe iniciar sesión para editar noticias.");
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
            formData.append("id", selectedNews?.id || "");

            if (selectedImage) {
                formData.append("image", selectedImage);
            } else if (data.image) {
                formData.append("image", data.image);
            }

            const response = await fetch(`/api/news?id=${selectedNews?.id}`, {
                method: 'PUT',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Hubo un problema al actualizar la noticia");
            }

            setSuccess("¡Noticia actualizada exitosamente!");
            fetchNews();

            setTimeout(() => {
                setSelectedNews(null);
                reset();
                setImagePreview("");
                setSelectedImage(null);
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Error al actualizar la noticia");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setSelectedNews(null);
        reset();
        setImagePreview("");
        setSelectedImage(null);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (selectedNews) {
        return (
            <Box p={4}>
                <Button
                    startIcon={<IconArrowLeftCircle />}
                    onClick={handleBack}
                    sx={{ mb: 3 }}
                >
                    Volver al listado
                </Button>

                <Typography variant="h4" fontWeight="600" mb={4}>
                    Editar Noticia
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
                                            Seleccionar Archivo
                                        </Button>
                                    </label>
                                    {imagePreview && (
                                        <Avatar src={imagePreview} variant="square" sx={{ width: 56, height: 56 }} />
                                    )}
                                </Box>
                                <TextField
                                    {...register("image")}
                                    label="O pega una URL de imagen"
                                    fullWidth
                                    placeholder="https://..."
                                />
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
                                        {loading ? "Actualizando..." : "Actualizar Noticia"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        );
    }

    return (
        <Box p={4}>
            <Typography variant="h4" fontWeight="600" mb={4}>
                Edición de Noticias
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

            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" mb={2}>Buscar Noticias</Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Buscar por título o contenido"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconSearch />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Buscar por fecha"
                                value={searchDate}
                                onChange={(e) => setSearchDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => { setSearchTerm(""); setSearchDate(""); }}
                            >
                                Limpiar
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Typography variant="h6" mb={2}>
                Total de noticias: {filteredNews.length}
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Imagen</TableCell>
                            <TableCell>Título</TableCell>
                            <TableCell>Categoría</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredNews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography variant="body2" color="textSecondary">
                                        No se encontraron noticias
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredNews.map((news) => (
                                <TableRow key={news.id} hover>
                                    <TableCell>
                                        {news.image ? (
                                            <Avatar
                                                src={news.image}
                                                variant="square"
                                                sx={{ width: 60, height: 60, borderRadius: 1 }}
                                            />
                                        ) : (
                                            <Avatar sx={{ width: 60, height: 60, bgcolor: 'grey.300' }}>
                                                <IconPhoto />
                                            </Avatar>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2">{news.title}</Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {news.excerpt.substring(0, 50)}...
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={news.category} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={news.published ? "Publicada" : "Borrador"}
                                            color={news.published ? "success" : "default"}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(news.createdAt)}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleEditNews(news)}
                                            title="Editar"
                                        >
                                            <IconEdit />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteClick(news)}
                                            title="Eliminar"
                                        >
                                            <IconTrash />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>¿Eliminar Noticia?</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Está seguro que desea eliminar la noticia "{newsToDelete?.title}"?
                        Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NewsEditPage;
