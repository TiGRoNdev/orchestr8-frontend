// App.js
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import {
    createTheme,
    ThemeProvider,
    CssBaseline,
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    SvgIcon
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Storage,
    AddBox,
    Settings,
    Backup
} from '@mui/icons-material';
import useMediaQuery from '@mui/material/useMediaQuery';
import PodsList from './components/PodsList';
import Dashboard from './components/Dashboard';
import PodDetails from './components/PodDetails';
import CreatePod from './components/CreatePod';
import Logo from "./assets/logo.svg?react";
import TopBar from "./components/TopBar.jsx";
import Volume from "./components/Storage";
import Login from "./components/Login";
import ls from "localstorage-slim";
import UserManagement from "./components/Settings.jsx";


const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#00F3FF' },
        background: { default: '#1A1D28', paper: '#2A2F3D' },
    },
    typography: { fontFamily: 'Montserrat, sans-serif' },
});

const navigationItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/pods', label: 'Pods', icon: <Storage /> },
    { path: '/storage', label: 'Storage', icon: <Backup /> },
    { path: '/create', label: 'Create Pod', icon: <AddBox /> },
    { path: '/settings', label: 'Settings', icon: <Settings /> },
];

const pathNames = {
    '/': 'Dashboard',
    '/pods': 'Pods',
    '/create': 'Create Pod',
    '/settings': 'Settings',
    '/storage': 'Storage',
}

function App() {
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

    const sessionKey = ls.get('sessionKey', { decrypt: true });

    if (!sessionKey && window.location.pathname !== '/') {
        window.location.pathname = "/";
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {
                sessionKey ? (
                        <Router>
                            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                                {/* Sidebar */}
                                <Box sx={{
                                    width: sidebarOpen || !isMobile ? 240 : 0,
                                    minWidth: sidebarOpen || !isMobile ? 240 : 0,
                                    bgcolor: 'background.paper',
                                    transition: '0.3s',
                                    overflow: 'hidden',
                                    position: 'sticky',
                                    top: 0,
                                    height: '100vh',
                                }}>
                                    <Box p={2} sx={{
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <SvgIcon sx={{ fontSize: 30, marginRight: 1 }} component={Logo} inheritViewBox />
                                        <Typography variant="h6">Orchestr8</Typography>
                                    </Box>
                                    <Box p={2}>
                                        <List>
                                            {navigationItems.map((item) => (
                                                <ListItem
                                                    key={item.path}
                                                    disablePadding
                                                    component={NavLink}
                                                    to={item.path}
                                                    sx={{
                                                        color: 'inherit',
                                                    }}
                                                >
                                                    <ListItemButton>
                                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                                        <ListItemText primary={item.label} />
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                </Box>

                                {/* Main Content */}
                                <Box sx={{ flexGrow: 1 }}>
                                    <TopBar
                                        isMobile={isMobile}
                                        pathNames={pathNames}
                                        sidebarOpen={sidebarOpen}
                                        setSidebarOpen={setSidebarOpen}
                                    />

                                    <Box p={3}>
                                        <Routes>
                                            <Route path="/" element={<Dashboard />} />
                                            <Route path="/pods" element={<PodsList />} />
                                            <Route path="/storage" element={<Volume />} />
                                            <Route path="/pods/:id" element={<PodDetails />} />
                                            <Route path="/create" element={<CreatePod />} />
                                            <Route path="/settings" element={<UserManagement />} />
                                        </Routes>
                                    </Box>
                                </Box>
                            </Box>
                        </Router>
                ) :
                (
                    <Router>
                        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                            {/* Main Content */}
                            <Box sx={{ flexGrow: 1 }}>
                                <Box p={3}>
                                    <Routes>
                                        <Route path="/" element={<Login />} />
                                    </Routes>
                                </Box>
                            </Box>
                        </Box>
                    </Router>
                )
            }
        </ThemeProvider>
    );
}

export default App;
