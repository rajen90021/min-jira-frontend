import * as React from 'react';
import { styled, useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import PeopleIcon from '@mui/icons-material/People';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import HistoryIcon from '@mui/icons-material/History';
import { Outlet, NavLink } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import AICopilotSidebar from '../components/AICopilotSidebar';
import { IoSparkles } from 'react-icons/io5';
import { motion } from 'framer-motion';
import useMediaQuery from '@mui/material/useMediaQuery';

const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : '#020617',
    borderRight: `1px solid ${theme.palette.divider}`,
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    backgroundColor: '#ffffff',
    borderRight: `1px solid ${theme.palette.divider}`,
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : '#020617',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundImage: 'none',
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

const DrawerMenu = ({ items, open }) => (
    <List>
        {items.map((item, index) => (
            <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                    component={NavLink}
                    to={item.path}
                    sx={{
                        minHeight: 48,
                        px: 2.5,
                        justifyContent: open ? 'initial' : 'center',
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                            color: 'inherit'
                        }}
                    >
                        {item.icon ? item.icon : (index % 2 === 0 ? <InboxIcon /> : <MailIcon />)}
                    </ListItemIcon>
                    <ListItemText
                        primary={item.label}
                        sx={{
                            '& .MuiListItemText-primary': {
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                color: 'inherit'
                            },
                            opacity: open ? 1 : 0
                        }}
                    />
                </ListItemButton>
            </ListItem>
        ))}
    </List>
);

export default function MiniDrawer() {
    const muiTheme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: 'light',
                    primary: {
                        main: '#3b82f6',
                    },
                    background: {
                        default: '#ffffff',
                        paper: '#ffffff',
                    },
                    divider: '#f1f5f9',
                },
                components: {
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                            }
                        }
                    },
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                color: '#1e293b',
                            }
                        }
                    },
                    MuiListItemButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: '12px',
                                margin: '4px 12px',
                                '&.active': {
                                    backgroundColor: '#eff6ff',
                                    color: '#3b82f6',
                                    '& .MuiListItemIcon-root': {
                                        color: '#3b82f6',
                                    }
                                }
                            }
                        }
                    }
                },
                typography: {
                    fontFamily: "'Inter', 'Outfit', sans-serif",
                },
            }),
        []
    );

    React.useEffect(() => {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }, []);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = React.useState(() => {
        if (window.innerWidth < 610) return false;
        return localStorage.getItem('sidebarOpen') === 'true';
    });

    const [anchorEl, setAnchorEl] = React.useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [isCopilotOpen, setIsCopilotOpen] = React.useState(false);

    React.useEffect(() => {
        if (isMobile) {
            setOpen(false);
        } else {
            setOpen(localStorage.getItem('sidebarOpen') === 'true');
        }
    }, [isMobile]);

    const drawerItems = [
        { label: 'Dashboard', path: '/app/dashboard', icon: <InboxIcon /> },
        { label: 'Projects', path: '/app/projects', icon: <AccountTreeIcon /> },
        { label: 'Tickets', path: '/app/tickets', icon: <ConfirmationNumberIcon /> },
        { label: 'Kanban Board', path: '/app/kanban-board', icon: <ViewWeekIcon /> },
        { label: 'Timeline', path: '/app/timeline', icon: <HistoryIcon /> },
        { label: 'Developers', path: '/app/developers', icon: <PeopleIcon /> },
    ];

    const handleDrawerOpen = () => {
        setOpen(true);
        if (!isMobile) localStorage.setItem('sidebarOpen', 'true');
    };

    const handleDrawerClose = () => {
        setOpen(false);
        if (!isMobile) localStorage.setItem('sidebarOpen', 'false');
    };

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        dispatch(logout());
        handleMenuClose();
        navigate('/login', { replace: true });
    };

    const handleProfile = () => {
        handleMenuClose();
        navigate('/app/profile');
    };

    const drawerContent = (
        <Box
            className="glass-sidebar"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            <DrawerHeader>
                {(open || isMobile) && (
                    <Box sx={{ flexGrow: 1, ml: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 900,
                                background: 'linear-gradient(45deg, #3b82f6 30%, #6366f1 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '0.5px',
                                lineHeight: 1.2,
                                textTransform: 'uppercase'
                            }}
                        >
                            Xetabots
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 800,
                                color: '#64748b',
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                fontSize: '0.6rem',
                                lineHeight: 1,
                                mt: -0.2
                            }}
                        >
                            System Control
                        </Typography>
                    </Box>
                )}
                <IconButton onClick={handleDrawerClose} sx={{ color: 'inherit' }}>
                    {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </DrawerHeader>
            <Divider />
            <DrawerMenu open={isMobile ? true : open} items={drawerItems} />

            <Box sx={{
                marginTop: 'auto',
                p: (open || isMobile) ? 2 : 1,
                borderTop: '1px solid',
                borderColor: 'divider',
            }}>
                {(open || isMobile) ? (
                    <Box>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: '16px',
                            bgcolor: '#f8fafc',
                            border: '1px solid',
                            borderColor: 'divider',
                        }}>
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: user?.role?.toLowerCase() === 'manager' ? '#f59e0b' : '#3b82f6',
                                    fontWeight: 800,
                                    fontSize: '0.85rem'
                                }}
                            >
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.8rem', color: 'text.primary' }}>
                                    {user?.name || 'User'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                                    {user?.role || 'Developer'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: user?.role?.toLowerCase() === 'manager' ? '#f59e0b' : '#3b82f6',
                                fontWeight: 800,
                                fontSize: '0.8rem'
                            }}
                        >
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                    </Box>
                )}
            </Box>
        </Box>
    );

    return (
        <ThemeProvider theme={muiTheme}>
            <Box sx={{ display: 'flex' }} className="min-h-screen bg-white transition-colors duration-500">
                <CssBaseline />
                <AppBar position="fixed" open={open} elevation={0}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            edge="start"
                            sx={[
                                { marginRight: 5 },
                                (open && !isMobile) && { display: 'none' },
                            ]}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{
                                flexGrow: 1,
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                fontSize: '0.9rem',
                                color: 'inherit'
                            }}
                        >
                            Xetabots Hub
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsCopilotOpen(!isCopilotOpen)}
                                className={`p-2.5 rounded-xl transition-all ${isCopilotOpen
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                    }`}
                                title="Xetabots AI Assistant"
                            >
                                <IoSparkles size={18} />
                            </motion.button>

                            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                                <Typography variant="body1" sx={{ fontWeight: 800, lineHeight: 1, fontSize: '0.8rem' }}>
                                    {user?.name || 'User'}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        fontSize: '0.6rem',
                                        letterSpacing: '0.5px',
                                        color: user?.role?.toLowerCase() === 'manager' ? '#f59e0b' : '#3b82f6',
                                    }}
                                >
                                    {user?.role || 'Developer'}
                                </Typography>
                            </Box>

                            <IconButton
                                onClick={handleMenuOpen}
                                sx={{
                                    p: 0.5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    '&:hover': { transform: 'scale(1.05)' }
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 34,
                                        height: 34,
                                        bgcolor: user?.role?.toLowerCase() === 'manager' ? '#f59e0b' : '#3b82f6',
                                        fontWeight: 900,
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </Avatar>
                            </IconButton>
                        </Box>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            slotProps={{
                                paper: {
                                    sx: {
                                        mt: 1.5,
                                        minWidth: 220,
                                        borderRadius: '16px',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                        bgcolor: '#ffffff',
                                    }
                                }
                            }}
                        >
                            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.6rem', letterSpacing: '1px' }}>
                                    Account ID: #{user?._id?.slice(-6).toUpperCase() || 'OFFLINE'}
                                </Typography>
                            </Box>
                            <MenuItem onClick={handleProfile} sx={{ fontSize: '0.8rem', fontWeight: 800, py: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                User Profile
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout} sx={{ fontSize: '0.8rem', fontWeight: 800, py: 1.5, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Sign Out
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>

                {isMobile ? (
                    <MuiDrawer
                        variant="temporary"
                        open={open}
                        onClose={handleDrawerClose}
                        sx={{
                            display: { xs: 'block', sm: 'none' },
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                        }}
                    >
                        {drawerContent}
                    </MuiDrawer>
                ) : (
                    <Drawer variant="permanent" open={open}>
                        {drawerContent}
                    </Drawer>
                )}

                <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <DrawerHeader />
                    <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: isMobile ? 2 : 4, backgroundColor: 'background.default' }}>
                        <Outlet></Outlet>
                    </Box>
                </Box>

                <AICopilotSidebar
                    isOpen={isCopilotOpen}
                    onClose={() => setIsCopilotOpen(false)}
                />
            </Box>
        </ThemeProvider>
    );
}
