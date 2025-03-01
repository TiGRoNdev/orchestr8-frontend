import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Card, CardContent, Typography, Chip, Divider, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import ls from "localstorage-slim";

const StatusChip = styled(Chip)(({ status }) => ({
    backgroundColor: status === 'Running' ? '#4CAF50' : '#F44336',
    color: 'white',
    fontWeight: 600,
    letterSpacing: 0.5,
}));

const PodCard = styled(Card)(({ theme }) => ({
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4],
    },
}));

const PodsList = () => {
    const navigate = useNavigate();
    const [pods, setPods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPods = async () => {
            try {
                const response = await fetch('http://tigron-server.lan/api/pod', {
                    method: 'GET',
                    headers: { 'Authorization': ls.get('sessionKey', { decrypt: true }) }
                });
                if (!response.ok) throw new Error('Failed to fetch pods');
                const data = await response.json();
                setPods(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPods();
    }, []);

    const handleCardClick = (podId) => {
        navigate(`/pods/${podId}`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, borderRadius: 2 }}>
            <Grid container spacing={3}>
                {
                    !loading && pods.length === 0 &&
                    <Box sx={{ p: 3 }}>
                        <Alert severity="info">You don't have any pods yet.</Alert>
                    </Box>
                }
                {pods.map((pod) => (
                    <Grid item key={pod.id} xs={12}>
                        <PodCard onClick={() => handleCardClick(pod.id)}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6" component="div">
                                        {pod.name}
                                    </Typography>
                                    <StatusChip status={pod.status} label={pod.status} size="small" />
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Namespace:
                                        </Typography>
                                        <Typography variant="body2">{pod.namespace}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Age:
                                        </Typography>
                                        <Typography variant="body2">{pod.age}</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </PodCard>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default PodsList;