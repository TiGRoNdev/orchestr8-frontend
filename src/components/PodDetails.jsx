// components/PodDetails.js
import { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import Terminal from './Terminal';

const PodDetails = () => {
    const [tab, setTab] = useState(0);

    return (
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 2 }}>
            <Typography variant="h4" gutterBottom>Pod Details</Typography>

            <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)}>
                <Tab label="Summary" />
                <Tab label="Logs" />
                <Tab label="Terminal" />
                <Tab label="YAML" />
            </Tabs>

            {tab === 0 && <div>Summary Content</div>}
            {tab === 1 && <div>Logs Content</div>}
            {tab === 2 && <Terminal />}
            {tab === 3 && <div>YAML Editor</div>}
        </Box>
    );
};

export default PodDetails;