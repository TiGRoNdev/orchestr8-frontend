import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    useTheme,
    IconButton, Alert, CircularProgress, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ls from 'localstorage-slim';
import {useNavigate} from "react-router-dom";



const protocols = [
    {
        value: 'TCP',
        label: 'TCP',
    },
    {
        value: 'UDP',
        label: 'UDP',
    }
]

// eslint-disable-next-line react/prop-types
const PodManagement = ({ podId }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [recreateLoading, setRecreateLoading] = useState(false);
    const [envVars, setEnvVars] = useState([{ name: '', value: '' }]);
    const [ports, setPorts] = useState([{ port: '', external_port: '', protocol: 'TCP' }]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openRecreateDialog, setOpenRecreateDialog] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPodPorts = async () => {
            try {
                const response = await fetch(`/api/pod/${podId}/port`, {
                    method: 'GET',
                    headers: { 'Authorization': ls.get('sessionKey', { decrypt: true }) }
                });
                if (!response.ok) throw new Error('Failed to fetch pod ports');
                const data = await response.json();
                setPorts([...data, { port: '', external_port: '' }]);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchPodPorts();
    }, [ports.length]);

    useEffect(() => {
        const fetchEnvVars = async () => {
            try {
                const response = await fetch(`/api/pod/${podId}/env`, {
                    method: 'GET',
                    headers: { 'Authorization': ls.get('sessionKey', { decrypt: true }) }
                });
                if (!response.ok) throw new Error('Failed to fetch pod envs');
                const data = await response.json();
                setEnvVars([...data, { name: '', value: '' }]);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchEnvVars();
    }, [envVars.length]);

    const addEnvVar = async ({ name, value }) => {
        try {
            const response = await fetch(`/api/pod/env`, {
                method: 'POST',
                body: JSON.stringify({
                    pod_id: podId,
                    name: name,
                    value: value,
                }),
                headers: {
                    'Authorization': ls.get('sessionKey', { decrypt: true }),
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) throw new Error('Failed to add pod env');
            setEnvVars([...envVars, { name: '', value: '' }])
        } catch (err) {
            setError(err.message);
        }
    };

    const addPort = async ({ port, protocol }) => {
        try {
            const response = await fetch(`/api/pod/port`, {
                method: 'POST',
                body: JSON.stringify({
                    pod_id: podId,
                    port: port,
                    protocol: protocol
                }),
                headers: {
                    'Authorization': ls.get('sessionKey', { decrypt: true }),
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) throw new Error('Failed to add pod port');
            setPorts([...ports, { port: '', external_port: '', protocol: 'TCP' }]);
        } catch (err) {
            setError(err.message);
        }
    };

    const removeEnvVar = async ({ id }) => {
        try {
            const response = await fetch(`/api/pod/${podId}/env/${id}`, {
                method: 'DELETE',
                headers: {'Authorization': ls.get('sessionKey', { decrypt: true })}
            });
            if (!response.ok) throw new Error('Failed to delete env variable');
            setEnvVars([...envVars, { name: '', value: '' }])
        } catch (err) {
            setError(err.message);
        }
    };

    const removePort = async ({ id }) => {
        try {
            const response = await fetch(`/api/pod/${podId}/port/${id}`, {
                method: 'DELETE',
                headers: {'Authorization': ls.get('sessionKey', { decrypt: true })}
            });
            if (!response.ok) throw new Error('Failed to delete exposed port');
            setPorts([...ports, { port: '', external_port: '' }])
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddEnvVar = () => {
        const envVar = envVars.filter((envVar) => !envVar.id)[0];
        addEnvVar(envVar);
    };

    const handleEnvVarChange = (index, field, value) => {
        const newEnvVars = [...envVars];
        newEnvVars[index][field] = value;
        setEnvVars(newEnvVars);
    };

    const handleRemoveEnvVar = (index) => {
        removeEnvVar(envVars[index]);
    };

    const handleAddPort = () => {
        const port = ports.filter((port) => !port.id)[0];
        addPort(port);
    };

    const handlePortChange = (index, field, value) => {
        const newPorts = [...ports];
        newPorts[index][field] = value;
        setPorts(newPorts);
    };

    const handleRemovePort = (index) => {
        console.log(index, ports)
        removePort(ports[index]);
    };

    const handleDeletePod = async () => {
        setDeleteLoading(true);
        try {
            const response = await fetch(`/api/pod`, {
                method: 'DELETE',
                body: JSON.stringify({ id: podId }),
                headers: {
                    'Authorization': ls.get('sessionKey', { decrypt: true }),
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                navigate("/pods")
            }
        } catch (error) {
            console.error('Error deleting pod:', error);
        }
        finally {
            setDeleteLoading(false);
            setOpenDeleteDialog(false);
        }
    };

    const handleRecreatePod = async () => {
        setRecreateLoading(true);
        try {
            const response = await fetch(`/api/pod/${podId}`, {
                method: 'PATCH',
                headers: {'Authorization': ls.get('sessionKey', { decrypt: true })}
            });

            if (response.ok) {
                navigate("/pods")
            }
        } catch (error) {
            console.error('Error recreating pod:', error);
        }
        finally {
            setRecreateLoading(false);
            setOpenRecreateDialog(false);
        }
    };


    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            <Alert severity="warning" sx={{ mb: 2 }}>Attention: New changes of environment variables will be available after recreating the pod!</Alert>
            {
                error &&
                <Box sx={{ p: 3 }}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            }
            {/* Environment Variables Section */}
            <Box sx={{
                mb: 4,
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1]
            }}>
                <Typography variant="h6" gutterBottom>
                    Environment Variables
                </Typography>

                {envVars.map((envVar, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                            label="Key"
                            value={envVar.name}
                            disabled={envVar.id !== undefined}
                            onChange={(e) => handleEnvVarChange(index, 'name', e.target.value)}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="Value"
                            value={envVar.value}
                            disabled={envVar.id !== undefined}
                            onChange={(e) => handleEnvVarChange(index, 'value', e.target.value)}
                            sx={{ flex: 1 }}
                        />
                        <IconButton
                            disabled={envVar.id === undefined}
                            onClick={() => handleRemoveEnvVar(index)}
                            sx={{ color: theme.palette.error.main }}
                        >
                            <DeleteOutlineIcon />
                        </IconButton>
                    </Box>
                ))}

                <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddEnvVar}
                    variant="outlined"
                >
                    Add Variable
                </Button>
            </Box>

            {/* Ports Section */}
            <Box sx={{
                mb: 4,
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1]
            }}>
                <Typography variant="h6" gutterBottom>
                    Exposed Ports
                </Typography>

                {ports.map((port, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        {
                            port.id !== undefined &&
                            <TextField
                                label="Exposed port"
                                type="number"
                                disabled
                                value={port.external_port}
                                sx={{ flex: 1 }}
                            />
                        }
                        <TextField
                            label="Port"
                            type="number"
                            disabled={port.id !== undefined}
                            value={port.port}
                            onChange={(e) => handlePortChange(index, "port", e.target.value)}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="Protocol"
                            select
                            disabled={port.id !== undefined}
                            defaultValue="TCP"
                            value={port.protocol}
                            onChange={(e) => handlePortChange(index, "protocol", e.target.value)}
                            sx={{ flex: 1 }}
                        >
                            {protocols.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <IconButton
                            onClick={() => handleRemovePort(index)}
                            disabled={port.id === undefined}
                            sx={{ color: theme.palette.error.main }}
                        >
                            <DeleteOutlineIcon />
                        </IconButton>
                    </Box>
                ))}

                <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddPort}
                    variant="outlined"
                >
                    Add Port
                </Button>
            </Box>

            {/* Danger Zone */}
            <Box sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: theme.shadows[1]
            }}>
                <Typography variant="h6" gutterBottom color="error">
                    Pod Actions
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => setOpenRecreateDialog(true)}
                    >
                        Recreate Pod
                    </Button>

                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setOpenDeleteDialog(true)}
                    >
                        Delete Pod
                    </Button>
                </Box>
            </Box>

            {/* Confirmation Dialogs */}
            <Dialog open={openDeleteDialog} onClose={() => !deleteLoading && setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to permanently delete this pod? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenDeleteDialog(false)}
                        disabled={deleteLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeletePod}
                        color="error"
                        variant="contained"
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? (
                            <>
                                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                Deleting...
                            </>
                        ) : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openRecreateDialog} onClose={() => !recreateLoading && setOpenRecreateDialog(false)}>
                <DialogTitle>Confirm Recreation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to recreate this pod? Current configuration will be used.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenRecreateDialog(false)}
                        disabled={recreateLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRecreatePod}
                        color="primary"
                        variant="contained"
                        disabled={recreateLoading}
                    >
                        {recreateLoading ? (
                            <>
                                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                Recreating...
                            </>
                        ) : 'Recreate'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PodManagement;