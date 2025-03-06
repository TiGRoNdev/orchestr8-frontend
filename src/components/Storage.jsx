import { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Box,
    Typography,
    useTheme,
    IconButton,
    DialogTitle,
    DialogContent,
    DialogContentText, DialogActions, Dialog
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Slider from "./Slider.jsx";
import ls from "localstorage-slim";

const Storage = () => {
    const theme = useTheme();
    const [formData, setFormData] = useState({ name: '', capacity: '77.5G' });
    const [errors, setErrors] = useState({});
    const [volumes, setVolumes] = useState([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(null);

    useEffect(() => {
        const loadUserVolumes = async () => {
            try {
                const response = await fetch('/api/volume', {
                    method: 'GET',
                    headers: { 'Authorization': ls.get('sessionKey', { decrypt: true }) },
                });

                if (response.ok) {
                    const data = await response.json();
                    setVolumes(data);
                }
            } catch (error) {
                console.error('Error fetching volumes:', error);
            }
        };

        loadUserVolumes();
    }, [volumes.length]);

    const createVolume = async () => {
        try {
            const response = await fetch('/api/volume', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Authorization': ls.get('sessionKey', { decrypt: true }),
                    'Content-Type': 'application/json'
                },
            });

            if (response.ok) {
                setVolumes(prev => [...prev, {}]);
                setFormData({ name: '', capacity: '77.5G' });
            }
        } catch (error) {
            console.error('Error creating volume:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Volume name is required';
        if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

        createVolume();
        setErrors({});
    };

    const deleteVolume = async (id) => {
        try {
            const response = await fetch('/api/volume', {
                method: 'DELETE',
                headers: {
                    'Authorization': ls.get('sessionKey', { decrypt: true }),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            if (response.ok) {
                setVolumes(prev => prev.filter(volume => volume.id !== id));
            }
        } catch (error) {
            console.error('Error deleting volume:', error);
        }
    };

    const handleDeleteVolume = (id) => {
        deleteVolume(id);
        setOpenDeleteDialog(null);
    }


    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            {/* Volumes Grid */}
            <Box sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                mb: 4
            }}>
                {volumes.map(volume => (
                    <Box key={volume.id} sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        boxShadow: theme.shadows[1],
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-2px)' },
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {volume.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Capacity: {volume.capacity}
                            </Typography>
                        </Box>

                        <IconButton
                            aria-label="delete"
                            onClick={() => setOpenDeleteDialog(volume.id)}
                            sx={{
                                color: theme.palette.error.main,
                                ml: 2  // Add some left margin for spacing
                            }}
                        >
                            <DeleteIcon fontSize="medium" />
                        </IconButton>
                    </Box>
                ))}
            </Box>

            {/* Creation Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{
                p: 4,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1],
                mb: 3
            }}>
                <Typography variant="h6" gutterBottom>
                    Create New Volume
                </Typography>

                <TextField
                    fullWidth
                    label="Volume Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={{ mb: 3 }}
                />

                <Slider
                    label="Capacity"
                    value={parseInt(formData.capacity)}
                    onChange={(value) => setFormData({ ...formData, capacity: `${value}G` })}
                    valueLabelFormatter={(value) => `${value}G`}
                    calculateFunc={(value) => value}
                    min={10}
                    max={300}
                    step={1}
                    sx={{ mb: 3 }}
                />

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        letterSpacing: 0.5
                    }}
                >
                    Create Storage
                </Button>
            </Box>
            <Dialog open={!!openDeleteDialog} onClose={() => setOpenDeleteDialog(null)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to permanently delete this volume? All data will be lost. This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenDeleteDialog(null)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleDeleteVolume(openDeleteDialog)}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Storage;