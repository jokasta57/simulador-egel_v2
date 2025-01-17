import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  LibraryBooks as LibraryBooksIcon,
  AddCircle as AddCircleIcon,
  BarChart as BarChartIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/admin/dashboard',
  },
  {
    text: 'Lista de Exámenes',
    icon: <LibraryBooksIcon />,
    path: '/admin/examenes',
  },
  {
    text: 'Crear Examen',
    icon: <AddCircleIcon />,
    path: '/admin/crear-examen',
  },
  {
    text: 'Estadísticas',
    icon: <BarChartIcon />,
    path: '/admin/estadisticas',
  },
];

export const DashboardLayout = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const drawer = (
    <>
      <Toolbar />
      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive}
                onClick={isMobile ? handleDrawerToggle : undefined}
                sx={{
                  minHeight: 48,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(185, 17, 22, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(185, 17, 22, 0.12)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(185, 17, 22, 0.04)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#B91116' : 'rgba(0, 0, 0, 0.54)',
                    minWidth: '40px'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: isActive ? '#B91116' : 'inherit',
                      fontWeight: isActive ? 500 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: '#B91116',
          boxShadow: 'none',
          width: '100%',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Panel Administrativo
          </Typography>
          <IconButton
            onClick={handleMenuClick}
            sx={{
              padding: 0.5,
              border: '2px solid white',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            <Typography variant="body1" sx={{ mr: 1, color: 'white' }}>
              Hola
            </Typography>
            <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{ mt: 1 }}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Perfil
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: open ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            transform: open ? 'none' : `translateX(-${drawerWidth}px)`,
            visibility: open ? 'visible' : 'hidden',
            transition: theme.transitions.create(['transform', 'visibility'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          width: open ? `calc(100% - ${drawerWidth}px)` : '100%', // Ajuste aquí
          px: 4,
          py: 3,
        }}
      >
        <Toolbar />
        <Box
          sx={{
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            margin: '0 auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

