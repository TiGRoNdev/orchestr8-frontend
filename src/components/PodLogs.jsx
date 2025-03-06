import { useState, useEffect, useRef } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import ls from "localstorage-slim";

// eslint-disable-next-line react/prop-types
const PodLogs = ({ podId }) => {
    const theme = useTheme();
    const [logs, setLogs] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const ws = useRef(null);
    const logsEndRef = useRef(null);

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!podId) return;

        const connectWebSocket = () => {
            const socket = new WebSocket(`wss://tigron-server.lan/api/ws/logs/${podId}`);
            ws.current = socket;

            socket.onopen = () => {
                setConnectionStatus('connecting');
                const token = ls.get('sessionKey', { decrypt: true });
                socket.send(token);
            };

            socket.onmessage = (event) => {
                setConnectionStatus('connected');
                setLogs(prev => [...prev, event.data]);
            };

            socket.onclose = (event) => {
                setConnectionStatus('disconnected');
                if (event.code !== 1000) {
                    console.error('WebSocket closed unexpectedly:', event);
                }
            };

            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                setConnectionStatus('error');
            };
        };

        connectWebSocket();

        return () => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.close(1000, 'Component unmounted');
            }
        };
    }, [podId]);

    useEffect(scrollToBottom, [logs]);

    const statusColors = {
        disconnected: theme.palette.error.main,
        connecting: theme.palette.warning.main,
        connected: theme.palette.success.main,
        error: theme.palette.error.main
    };

    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1]
            }}>
                <Box sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: statusColors[connectionStatus]
                }} />
                <Typography variant="subtitle2">
                    {connectionStatus}
                </Typography>
            </Box>

            <Box sx={{
                height: '60vh',
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1],
                overflowY: 'auto',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap'
            }}>
                {logs.map((log, index) => (
                    <Typography key={index} variant="body2" component="div">
                        {log}
                    </Typography>
                ))}
                <div ref={logsEndRef} />
            </Box>
        </Box>
    );
};

export default PodLogs;