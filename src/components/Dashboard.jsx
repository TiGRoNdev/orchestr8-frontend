// components/Dashboard.js
import { useState, useEffect } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip } from 'chart.js';
import ls from "localstorage-slim";

Chart.register(ArcElement, Tooltip);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/stat', {
                method: 'GET',
                headers: { 'Authorization': ls.get('sessionKey', { decrypt: true }) },
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setStats(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats(); // Initial fetch
        const interval = setInterval(fetchStats, 2000);
        return () => clearInterval(interval);
    }, []);

    const createChartData = (used) => ({
        labels: ['Used', 'Free'],
        datasets: [{
            data: [used, 100 - used],
            backgroundColor: ['#00F3FF', '#2A2F3D'],
        }]
    });

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">Error: {error}</Typography>;

    return (
        <Grid container spacing={3}>
            {/* CPU */}
            <Grid item xs={6} md={4}>
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>CPU</Typography>
                    <Doughnut data={createChartData(stats.cpu.used)} />
                </Box>
            </Grid>

            {/* RAM */}
            <Grid item xs={6} md={4}>
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>RAM</Typography>
                    <Doughnut data={createChartData(stats.ram.used)} />
                </Box>
            </Grid>

            {/* Disk */}
            <Grid item xs={6} md={4}>
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>Disk</Typography>
                    <Doughnut data={createChartData(stats.disk.used)} />
                </Box>
            </Grid>

            {/* GPUs */}
            {stats.gpu?.map((gpu, index) => (
                <Grid item xs={12} key={index}>
                    <Typography variant="h6" mt={2}>GPU {index + 1}</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={6} md={4}>
                            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                                <Typography variant="subtitle1">Load</Typography>
                                <Doughnut data={createChartData(gpu.load)} />
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={4}>
                            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                                <Typography variant="subtitle1">Memory</Typography>
                                <Doughnut data={createChartData(gpu.memory)} />
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
            ))}
        </Grid>
    );
};

export default Dashboard;