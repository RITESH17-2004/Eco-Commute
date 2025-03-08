import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CalculatorPage } from './pages/CalculatorPage';
import { CommunityPage } from './pages/CommunityPage';
import { PoolingPage } from './pages/PoolingPage';
import { AuthPage } from './pages/AuthPage';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

const theme = createTheme({
  primaryColor: 'green',
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <Router>
        <div style={{ 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems:'center',
          justifyContent:'center'
        }}>
          <Header />
          <main style={{ flex: 1, marginTop: 60 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/CalculatorPage" element={<CalculatorPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/pooling" element={<PoolingPage />} />
              <Route path="/Auth" element={<AuthPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </MantineProvider>
  );
}

export default App;