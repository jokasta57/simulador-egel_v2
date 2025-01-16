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
    color: '#B91116'
  },
  { 
    text: 'Lista de Exámenes', 
    icon: <LibraryBooksIcon />, 
    path: '/admin/examenes',
    color: '#B91116'
  },
  { 
    text: 'Crear Examen', 
    icon: <AddCircleIcon />, 
    path: '/admin/crear-examen',
    color: '#B91116'
  },
  { 
    text: 'Estadísticas', 
    icon: <BarChartIcon />, 
    path: '/admin/estadisticas',
    color: '#B91116'
  },
];

export const DashboardLayout = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(true);
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

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: '#B91116',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
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
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            ...(open ? {
              width: drawerWidth,
            } : {
              width: theme.spacing(7),
              overflowX: 'hidden',
            }),
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={isActive}
                    sx={{
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
                    <ListItemIcon sx={{ 
                      color: isActive ? '#B91116' : 'rgba(0, 0, 0, 0.54)',
                      minWidth: '40px'
                    }}>
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
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

