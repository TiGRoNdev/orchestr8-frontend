// components/PodDetails.js
import { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import Terminal from './Terminal';
import PodLogs from './PodLogs';
import PodManagement from "./PodManagement.jsx";


const PodDetails = () => {
    const [tab, setTab] = useState(0);
    const params = useParams();

    return (
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 2 }}>
            <Typography variant="h4" gutterBottom>Pod Details</Typography>

            <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)}>
                <Tab label="Logs" />
                <Tab label="Terminal" />
                <Tab label="Settings" />
            </Tabs>

            {tab === 0 && <PodLogs podId={params ? params.id : null} />}
            {tab === 1 && <Terminal podId={params ? params.id : null} />}
            {tab === 2 && <PodManagement podId={params ? params.id : null} />}
        </Box>
    );
};

export default PodDetails;