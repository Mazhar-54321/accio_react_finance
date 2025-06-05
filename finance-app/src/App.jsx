
import './App.css'
import FinanceManagement from './components/FinanceManagement'
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#000", 
    },
    secondary: {
      main: "#ff4081", 
    },
  },
});
function App() {

  return (
    <>
    <ThemeProvider theme={theme}>
      <FinanceManagement />
      </ThemeProvider>
    </>
  )
}

export default App
