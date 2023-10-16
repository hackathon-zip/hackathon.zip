import { ReactNode, createContext, useContext } from "react";

export type Theme = "light" | "dark";

export const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: "light", setTheme: () => {} });

export const ThemeProvider = ({
  theme,
  setTheme,
  children
}: {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  children: ReactNode;
}) => {
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  return { theme, setTheme };
};
