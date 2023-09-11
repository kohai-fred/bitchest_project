import { Logout } from "@mui/icons-material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuIcon from "@mui/icons-material/Menu";
import { Typography } from "@mui/material";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import MuiDrawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Toolbar from "@mui/material/Toolbar";
import { CSSObject, Theme, styled, useTheme } from "@mui/material/styles";
import Logo from "@src/assets/bitchest_logo.png";
import LogoMini from "@src/assets/bitchest_logo_32.png";
import RequireAuth from "@src/auth/RequireAuth";
import {
  ListItemButtonComponents,
  ListItemLinkComponents,
} from "@src/components/ListItemComponents";
import useLogout from "@src/hooks/useLogout";
import { adminMenu, clientMenu } from "@src/routes/menu";
import { getCryptoCurrencies } from "@src/services/cryptos";
import { getInfoClientTransactions } from "@src/services/walletAndTransactions";
import { useCryptoStore } from "@src/store/crypto.store";
import { useWalletStore } from "@src/store/wallet.store";
import { getUserCookies } from "@src/utils/cookiesUser";
import { useQuery } from "@tanstack/react-query";

import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 240;
const colorLight = "customColors.bitchest.light";
const colorDark = "customColors.bitchest.dark";
const colorBitchest = "customColors.bitchest.main";
const QUERY_KEY = "client";

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));
interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  backgroundColor: "transparent",
  color: "red",
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

async function initStores() {
  const { wallet } = await getInfoClientTransactions();
  if (!wallet) throw new Error("Une erreur est survenue");
  const { currencies } = await getCryptoCurrencies();
  if (!currencies) throw new Error("Une erreur est survenue");

  return { wallet, currencies };
}

const LayoutPage = () => {
  const userCookie = getUserCookies();
  const menus = userCookie?.role === "admin" ? adminMenu : clientMenu;
  const logout = useLogout();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { wallet, initWallet } = useWalletStore((state) => ({
    ...state,
  }));
  const { setCryptoCurrencies } = useCryptoStore((state) => ({ ...state }));
  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: initStores,
    enabled: userCookie?.role === "client",
    retry: 1,
  });

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const { pathname } = location;
    if (pathname.endsWith("/client") || pathname.endsWith("admin"))
      navigate(`${userCookie?.role}/crypto`);
  }, []);

  useEffect(() => {
    if (!data) return;
    initWallet(data.wallet);
    setCryptoCurrencies(data.currencies);
  }, [data]);

  return (
    <RequireAuth>
      {userCookie && (
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <AppBar position="fixed" open={open}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{
                  marginRight: 5,
                  ...(open && { display: "none" }),
                  "&:hover": {
                    color: colorBitchest,
                  },
                }}
              >
                <MenuIcon />
              </IconButton>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { md: "center" },
                  width: "100%",
                }}
              >
                <Box display={{ xs: "inherit", md: "none" }}>
                  <img src={LogoMini} alt="Logo de Bitchest" />
                </Box>
                <Box display={{ xs: "none", md: "inherit" }}>
                  <img src={Logo} alt="Logo de Bitchest" />
                </Box>
              </Box>
              <Box>
                {userCookie && userCookie.role === "client" && (
                  <Typography>
                    solde&nbsp;:&nbsp;{wallet.balance}&nbsp;€
                  </Typography>
                )}
              </Box>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            open={open}
            sx={{
              "& .MuiDrawer-paper": {
                borderColor: colorLight,
              },
            }}
          >
            <DrawerHeader>
              <Box
                display="flex"
                alignItems="center"
                justifyContent={{ xs: "space-between", md: "flex-end" }}
                width="100%"
              >
                <Box display={{ xs: "inherit", md: "none" }} height={40}>
                  <img src={Logo} alt="Logo de Bitchest" />
                </Box>
                <IconButton
                  onClick={handleDrawerClose}
                  sx={{
                    "&:hover": {
                      color: colorBitchest,
                    },
                  }}
                >
                  {theme.direction === "rtl" ? (
                    <ChevronRightIcon />
                  ) : (
                    <ChevronLeftIcon />
                  )}
                </IconButton>
              </Box>
            </DrawerHeader>
            <Divider />
            <List>
              {menus &&
                menus.map((menu) => (
                  <ListItem
                    key={crypto.randomUUID()}
                    disablePadding
                    sx={{ display: "block" }}
                  >
                    {userCookie && (
                      <ListItemLinkComponents
                        open={open}
                        title={menu.title}
                        path={`/${userCookie.role}/${menu.path}`}
                        icon={menu.icon}
                      />
                    )}
                  </ListItem>
                ))}
            </List>

            {/******************************
             *          BOTTOM
             *******************************/}
            <List
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                height: "100%",
              }}
            >
              <ListItem
                key={"drawer_logout"}
                disablePadding
                sx={{ display: "block" }}
              >
                <ListItemButtonComponents
                  open={open}
                  title="Déconnexion"
                  onClick={logout}
                  icon={<Logout sx={{ color: colorDark }} />}
                />
              </ListItem>
            </List>
          </Drawer>
          <Box
            component="main"
            sx={{ flexGrow: 1, p: 3, width: "calc(100% - 64px)" }}
          >
            <DrawerHeader />
            <Outlet />
          </Box>
        </Box>
      )}
    </RequireAuth>
  );
};

export default LayoutPage;
