import { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, useTheme, Chip } from '@mui/material';
import Autocomplete from "./Autocomplete.jsx";
import Slider from "./Slider.jsx";
import ls from "localstorage-slim";

const CreatePod = () => {
    const theme = useTheme();
    const [formData, setFormData] = useState({
        name: '',
        container_image: '',
        cpu: '880m',
        memory: '10G',
        gpu: 0,
        port: '80',
        storage_id: 0
    });
    const [errors, setErrors] = useState({});
    const [token, setToken] = useState(null);
    const [storages, setStorages] = useState([]);
    const [selectedStorage, setSelectedStorage] = useState(null);
    const [gpuOptions, setGPU] = useState([]);
    const [selectedGpus, setSelectedGpus] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await fetch("http://tigron-server.lan/api/docker/token");
                if (response.ok) {
                    const data = await response.json();
                    setToken(data.token);
                }
            } catch (error) {
                console.error("Could not fetch token:", error);
            }
        };

        const fetchStorages = async () => {
            try {
                const response = await fetch("http://tigron-server.lan/api/volume", {
                    method: 'GET',
                    headers: { 'Authorization': ls.get('sessionKey', { decrypt: true }) },
                });
                if (response.ok) {
                    const data = await response.json();
                    setStorages(data);
                }
            } catch (error) {
                console.error("Could not fetch storages:", error);
            }
        };

        const fetchGPU = async () => {
            try {
                const response = await fetch("http://tigron-server.lan/api/gpu", {
                    method: 'GET',
                    headers: { 'Authorization': ls.get('sessionKey', { decrypt: true }) },
                });
                if (response.ok) {
                    const data = await response.json();
                    let gpus = [];
                    for (let i = 0; i < data.cluster.available; i+=1)
                        gpus.push({ id: i, type: 'NVIDIA A4000', vram: '16GB' })
                    setGPU(gpus);
                }
            } catch (error) {
                console.error("Could not fetch gpus:", error);
            }
        };

        if (!token) fetchToken();
        fetchStorages();
        fetchGPU();
    }, []);

    const submitForm = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://tigron-server.lan/api/pod", {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Authorization': ls.get('sessionKey', { decrypt: true }),
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error("Could not submit form: ", error);
        }
    };

    // Storage Selection
    const handleStorageSelect = (storage) => {
        setSelectedStorage(storage.id === selectedStorage ? null : storage.id);
        setFormData(prev => ({ ...prev, storage_id: storage.id }));
    };

    // GPU Selection
    const handleGpuSelect = (gpu) => {
        setSelectedGpus(prev =>
            prev.includes(gpu.id)
                ? prev.filter(id => id !== gpu.id)
                : [...prev, gpu.id]
        );
        setFormData(prev => ({ ...prev, gpu: selectedGpus.length + 1 }));
    };

    const handleFormSubmit = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Pod name is required';
        if (!formData.container_image) newErrors.container_image = 'Container image is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Submit logic here
        console.log('Creating pod:', formData);
        submitForm();
    };

    const ramValueFormatter = (value) => {
        const units = ['Mi', 'G'];

        let unitIndex = 0;
        let scaledValue = value;

        while (scaledValue >= 1024 && unitIndex < units.length - 1) {
            unitIndex += 1;
            scaledValue /= 1024;
        }

        return `${Math.round(scaledValue)}${units[unitIndex]}`;
    }

    const cpuValueFormatter = (value) => {
        const units = ['m', ''];

        let unitIndex = 0;
        let scaledValue = value;

        if (scaledValue >= 1000 && unitIndex < units.length - 1) {
            unitIndex += 1;
            scaledValue /= 1000;
        }

        return `${Math.round(scaledValue)}${units[unitIndex]}`;
    }

    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            {/* Main Form */}
            <Box component="form" onSubmit={handleFormSubmit} sx={{
                p: 4,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1],
                mb: 3
            }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                    Create New Pod
                </Typography>

                {/* Pod Details Section */}
                <Box sx={{ mb: 4 }}>
                    <TextField
                        fullWidth
                        label="Pod Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        error={!!errors.name}
                        helperText={errors.name}
                        sx={{ mb: 3 }}
                        required
                    />

                    <Autocomplete
                        apiUrl="http://tigron-server.lan/api/docker/search"
                        onSelect={(value) => setFormData({ ...formData, container_image: value })}
                        debounceTime={500}
                        token={token}
                        getLabel={(option) => option.slug}
                        label="Container Image"
                        errors={errors.container_image}
                        sx={{ mb: 3 }}
                    />

                    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', mt: 3 }}>
                        <Slider
                            label="CPU Cores:"
                            onChange={(value) => {
                                const val = cpuValueFormatter(Math.round(value * (Math.log(value) / Math.LN10)));
                                setFormData({ ...formData, cpu: val })
                            }}
                            valueLabelFormatter={cpuValueFormatter}
                            calculateFunc={(value) => Math.round(value * (Math.log(value) / Math.LN10))}
                            min={100}
                            max={1286.5}
                            step={5}
                        />

                        <Slider
                            label="RAM:"
                            onChange={(value) => {
                                const val = ramValueFormatter(Math.round(value * (Math.log(value) / Math.LN10)));
                                setFormData({ ...formData, memory: val })
                            }}
                            valueLabelFormatter={ramValueFormatter}
                            calculateFunc={(value) => Math.round(value * (Math.log(value) / Math.LN10))}
                            min={100}
                            max={12000}
                            step={10}
                        />
                    </Box>
                </Box>

                {/* Storage Selection */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                        Attach Storage Volume
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                        {storages.map(storage => (
                            <Box
                                key={storage.id}
                                onClick={() => handleStorageSelect(storage)}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: `2px solid ${selectedStorage === storage.id
                                        ? theme.palette.primary.main
                                        : theme.palette.divider}`,
                                    cursor: 'pointer',
                                    transition: 'border-color 0.2s',
                                    '&:hover': {
                                        borderColor: theme.palette.primary.light
                                    }
                                }}
                            >
                                <Typography variant="subtitle1">{storage.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {storage.capacity}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* GPU Selection */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                        Select GPUs
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {gpuOptions.map(gpu => (
                            <Chip
                                key={gpu.id}
                                label={`${gpu.type} (${gpu.vram})`}
                                onClick={() => handleGpuSelect(gpu)}
                                color={selectedGpus.includes(gpu.id) ? 'primary' : 'default'}
                                variant={selectedGpus.includes(gpu.id) ? 'filled' : 'outlined'}
                                sx={{
                                    height: 48,
                                    borderRadius: 2,
                                    '& .MuiChip-label': { px: 2.5 }
                                }}
                            />
                        ))}
                    </Box>
                </Box>

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    loading={loading}
                    sx={{
                        py: 2,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '1.1rem'
                    }}
                >
                    Create Pod
                </Button>
            </Box>
        </Box>
    );
};

export default CreatePod;