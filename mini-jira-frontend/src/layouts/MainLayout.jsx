import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
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
import { Outlet, NavLink } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
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
})(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    variants: [
        {
            props: ({ open }) => open,
            style: {
                marginLeft: drawerWidth,
                width: `calc(100% - ${drawerWidth}px)`,
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            },
        },
    ],
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        variants: [
            {
                props: ({ open }) => open,
                style: {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': openedMixin(theme),
                },
            },
            {
                props: ({ open }) => !open,
                style: {
                    ...closedMixin(theme),
                    '& .MuiDrawer-paper': closedMixin(theme),
                },
            },
        ],
    }),
);

const DrawerMenu = ({ items, open }) => (
    <List>
        {items.map((item, index) => (
            <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                    component={NavLink}
                    to={item.path}
                    sx={[
                        {
                            minHeight: 48,
                            px: 2.5,
                        },
                        open
                            ? {
                                justifyContent: 'initial',
                            }
                            : {
                                justifyContent: 'center',
                            },
                    ]}
                >
                    <ListItemIcon
                        sx={[
                            {
                                minWidth: 0,
                                justifyContent: 'center',
                            },
                            open
                                ? {
                                    mr: 3,
                                }
                                : {
                                    mr: 'auto',
                                },
                        ]}
                    >
                        {item.icon ? item.icon : (index % 2 === 0 ? <InboxIcon /> : <MailIcon />)}
                    </ListItemIcon>
                    <ListItemText
                        primary={item.label}
                        sx={[
                            open
                                ? {
                                    opacity: 1,
                                }
                                : {
                                    opacity: 0,
                                },
                        ]}
                    />
                </ListItemButton>
            </ListItem>
        ))}
    </List>
);

export default function MiniDrawer() {
    const theme = useTheme();
    const [open, setOpen] = React.useState(localStorage.getItem('sidebarOpen') === 'true');
    const [anchorEl, setAnchorEl] = React.useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const drawerItems = [
        { label: 'Dashboard', path: '/app/dashboard', icon: <InboxIcon /> },
        { label: 'Projects', path: '/app/projects', icon: <AccountTreeIcon /> },
        { label: 'Tickets', path: '/app/tickets', icon: <ConfirmationNumberIcon /> },
        { label: 'Developers', path: '/app/developers', icon: <PeopleIcon /> },
    ];

    const handleDrawerOpen = () => {
        setOpen(true);
        localStorage.setItem('sidebarOpen', 'true');
    };

    const handleDrawerClose = () => {
        setOpen(false);
        localStorage.setItem('sidebarOpen', 'false');
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        handleMenuClose();
        navigate('/login', { replace: true });
    };

    const handleProfile = () => {
        handleMenuClose();
        navigate('/app/profile');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" open={open} sx={{ backgroundColor: theme.palette.primary.dark }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={[
                            {
                                marginRight: 5,
                            },
                            open && { display: 'none' },
                        ]}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ flexGrow: 1, letterSpacing: 0.5, fontWeight: 600 }}
                    >
                        Mini Jira
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                            <Typography
                                variant="body1"
                                sx={{ fontWeight: 600, lineHeight: 1.2, color: 'white' }}
                            >
                                {user?.name || 'User'}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.5px',
                                    color: user?.role?.toLowerCase() === 'manager' ? '#fbbf24' : '#22d3ee'
                                }}
                            >
                                {user?.role || 'Developer'}
                            </Typography>
                        </Box>
                        <IconButton
                            color="inherit"
                            onClick={handleMenuOpen}
                            sx={{
                                p: 0.5,
                                borderRadius: '50%',
                                border: '2px solid rgba(255,255,255,0.3)',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    borderColor: 'rgba(255,255,255,0.6)',
                                    transform: 'scale(1.05)'
                                }
                            }}
                        >
                            <Avatar
                                alt={user?.name || 'User'}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: user?.role?.toLowerCase() === 'manager' ? '#f59e0b' : '#3b82f6',
                                    fontWeight: 700,
                                    fontSize: '1rem'
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
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        PaperProps={{
                            elevation: 4,
                            sx: {
                                mt: 1,
                                minWidth: 180,
                                borderRadius: 2,
                                py: 0.5,
                            },
                        }}
                    >
                        <MenuItem onClick={handleProfile} sx={{ fontSize: 14 }}>
                            Profile
                        </MenuItem>
                        <MenuItem onClick={handleLogout} sx={{ fontSize: 14, color: 'error.main' }}>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={open}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <DrawerHeader>
                        {open && (
                            <Box sx={{ flexGrow: 1, ml: 2, display: 'flex', flexDirection: 'column' }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        background: 'linear-gradient(45deg, #00c6ff 30%, #0072ff 90%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        letterSpacing: '0.5px',
                                        lineHeight: 1.2
                                    }}
                                >
                                    Detroit
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 500,
                                        color: 'text.secondary',
                                        letterSpacing: '0.5px',
                                        lineHeight: 1,
                                        mt: -0.5
                                    }}
                                >
                                    we code a success
                                </Typography>
                            </Box>
                        )}
                        <IconButton onClick={handleDrawerClose}>
                            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                    </DrawerHeader>
                    <Divider />
                    <DrawerMenu open={open} items={drawerItems} />

                    {/* Sidebar Footer */}
                    <Box sx={{
                        marginTop: 'auto',
                        p: open ? 2 : 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}>
                        {open ? (
                            <Box>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    mb: 1.5,
                                    p: 1,
                                    borderRadius: 2,
                                    bgcolor: 'action.hover',
                                }}>
                                    <Avatar
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            bgcolor: user?.role?.toLowerCase() === 'manager' ? '#f59e0b' : '#3b82f6',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {user?.name || 'User'}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'text.secondary',
                                                fontSize: '0.75rem',
                                            }}
                                        >
                                            {user?.role || 'Developer'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',
                                        textAlign: 'center',
                                        color: 'text.secondary',
                                        fontSize: '0.7rem',
                                    }}
                                >
                                    v1.0.0 • © 2025 Detroit
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: user?.role?.toLowerCase() === 'manager' ? '#f59e0b' : '#3b82f6',
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </Avatar>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <DrawerHeader />
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    <Outlet></Outlet>
                </Box>
            </Box>
        </Box>
    );
}