import {Box, IconButton, Typography} from "@mui/material";
import {AccountCircle, Menu, Notifications} from "@mui/icons-material";
import {useLocation} from "react-router-dom";


// eslint-disable-next-line react/prop-types
const TopBar = ({ isMobile, setSidebarOpen, sidebarOpen, pathNames }) => {
    const location = useLocation(); // Get current route

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            bgcolor: 'background.paper',
            borderBottom: '1px solid rgba(255,255,255,0.12)'
        }}>
            {
                isMobile &&
                <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Menu />
                </IconButton>
            }
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {
                    pathNames ? pathNames[location.pathname] : 'Dashboard'
                }
            </Typography>
        </Box>
    )
}


export default TopBar;
