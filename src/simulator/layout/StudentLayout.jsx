import { useState } from "react"
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
} from "@mui/material"
import {
  Menu as MenuIcon,
  AssignmentTurnedIn as SimulationIcon,
  Assessment as ResultsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material"
import { useSelector } from "react-redux"
import { useAuthStore } from "../../hooks/useAuthStore"
import { Link, useLocation } from "react-router-dom"

const drawerWidth = 240

const menuItems = [
  {
    text: "Exámenes de Práctica",
    icon: <SimulationIcon />,
    path: "/student/home",
  },
  {
    text: "Mis Resultados",
    icon: <ResultsIcon />,
    path: "/student/resultados",
  },
  {
    text: "Mi Perfil",
    icon: <PersonIcon />,
    path: "/student/perfil",
  },
]

export const StudentLayout = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [open, setOpen] = useState(!isMobile)
  const [anchorEl, setAnchorEl] = useState(null)
  const { startLogout } = useAuthStore()
  const location = useLocation()

  const { user } = useSelector((state) => state.auth)

  const handleDrawerToggle = () => {
    setOpen(!open)
  }

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogOut = () => {
    startLogout()
  }

  const drawer = (
    <>
      <Toolbar />
      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} to={item.path} selected={isActive}>
                <ListItemIcon sx={{ color: isActive ? "#B91116" : "rgba(0, 0, 0, 0.54)" }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ "& .MuiListItemText-primary": { color: isActive ? "#B91116" : "inherit" } }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </>
  )

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: "#B91116",
          boxShadow: "none",
          width: "100%",
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
            Panel Estudiantil
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body1" sx={{ color: "white", mr: 1 }}>
              Hola, {user.nombre}!
            </Typography>
            <IconButton onClick={handleMenuClick} sx={{ padding: 0.5, border: "2px solid white" }}>
              <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Box>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} sx={{ mt: 1 }}>
            <MenuItem onClick={handleMenuClose}>Perfil</MenuItem>
            <MenuItem onClick={handleLogOut}>
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
        sx={{
          width: open ? drawerWidth : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            transform: open ? "none" : `translateX(-${drawerWidth}px)`,
            transition: theme.transitions.create(["transform"], {
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
          width: open ? `calc(100% - ${drawerWidth}px)` : "100%",
          px: 4,
          py: 3,
        }}
      >
        <Toolbar />
        <Box sx={{ width: "100%" }}>{children}</Box>
      </Box>
    </Box>
  )
}

