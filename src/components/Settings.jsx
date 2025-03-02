import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    styled,
    CircularProgress
} from '@mui/material';
import { Delete, LockReset } from '@mui/icons-material';
import ls from "localstorage-slim";

const API_URL = '/api/register';

const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
    overflow: 'hidden'
}));

const ActionButton = styled(Button)(({ theme }) => ({
    textTransform: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    transition: 'all 0.2s ease'
}));

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const response = await fetch('/api/users', {
                    method: 'GET',
                    headers: { 'Authorization': ls.get('sessionKey', { decrypt: true }) },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        loadUsers();
    }, [users.length]);

    const handleDialogOpen = () => setDialogOpen(true);
    const handleDialogClose = () => {
        setDialogOpen(false);
        setFormData({ username: '', password: '' });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': ls.get('sessionKey', { decrypt: true }),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Registration failed');

            setUsers([...users, null]);
            handleDialogClose();
        } catch (error) {
            console.error('Error creating user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        setLoading(true);
        try {
            const response = await fetch(API_URL, {
                method: 'DELETE',
                headers: {
                    'Authorization': ls.get('sessionKey', { decrypt: true }),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: userId })
            });

            if (!response.ok) throw new Error('Deletion failed');

            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" fontWeight="600">
                    User Accounts
                </Typography>
                <ActionButton
                    variant="contained"
                    onClick={handleDialogOpen}
                    startIcon={<LockReset />}
                    disabled={loading}
                >
                    Add User
                </ActionButton>
            </Box>

            <StyledPaper>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'background.paper' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.filter(u => u !== null).map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>
                                        <IconButton
                                            onClick={() => handleDeleteUser(user.id)}
                                            color="error"
                                            disabled={loading}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </StyledPaper>

            <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="xs">
                <DialogTitle sx={{ pb: 1 }}>Create New Account</DialogTitle>
                <form onSubmit={handleCreateUser}>
                    <DialogContent sx={{ pt: 0 }}>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Username"
                            variant="outlined"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            disabled={loading}
                            inputProps={{ maxLength: 30 }}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Password"
                            type="password"
                            variant="outlined"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            disabled={loading}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <ActionButton onClick={handleDialogClose} disabled={loading}>
                            Cancel
                        </ActionButton>
                        <ActionButton type="submit" variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Create User'}
                        </ActionButton>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default UserManagement;