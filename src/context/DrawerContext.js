// Crea un archivo DrawerContext.js
import { createContext, useContext } from 'react';

export const DrawerContext = createContext();

export const useDrawer = () => useContext(DrawerContext);