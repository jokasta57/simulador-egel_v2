import { Box, Typography, Link, IconButton } from "@mui/material";
import { GitHub, Language, LinkedIn } from "@mui/icons-material";

export const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                width: "100%",
                py: 2,
                backgroundColor: (theme) => (theme.palette.mode === "light" ? "#f5f5f5" : theme.palette.grey[900]),
                borderTop: "1px solid",
                borderColor: "divider",
                marginTop: "auto",
                textAlign: "center",
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    color: "text.secondary",
                    fontSize: "0.875rem",
                    fontWeight: 400,
                }}
            >
                {"Proyecto desarrollado por "}
                <Link
                    href="https://github.com/JahirSamperio"
                    underline="hover"
                    sx={{
                        color: "inherit",
                        textDecoration: "none",
                        "&:hover": {
                            color: "primary.main",
                        },
                    }}
                >
                    Jahir Alberto Samperio Ing. de Software
                </Link>
                {" © "}
                {new Date().getFullYear()}
            </Typography>
            <Box sx={{ mt: 1 }}>
                <IconButton href="https://github.com/JahirSamperio" target="_blank" rel="noopener" sx={{ mx: 1 }}>
                    <GitHub />
                </IconButton>
                <IconButton href="https://www.linkedin.com/in/jahir-samperio-b03091255/" target="_blank" rel="noopener" sx={{ mx: 1 }}>
                    <LinkedIn />
                </IconButton>
                <IconButton href="https://tuportafolio.com" target="_blank" rel="noopener" sx={{ mx: 1 }}>
                    <Language />
                </IconButton>
            </Box>
        </Box>
    );
};
