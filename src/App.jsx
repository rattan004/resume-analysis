import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import GuidePage from './pages/GuidePage';
import ResultsPage from './pages/ResultsPage';
import RankingPage from './pages/RankingPage';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Header />
                    <main className="main-content">
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />

                            {/* Protected Homepage Route */}
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute>
                                        <HomePage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route path="/faq" element={<FAQPage />} />
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/guide" element={<GuidePage />} />

                            {/* 🎯 THE CRITICAL FIX: The Ranking path now uses the dynamic parameter :analysisId */}
                            <Route
                                path="/ranking/:analysisId"
                                element={
                                    <ProtectedRoute>
                                        <RankingPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Keeping the /results route separate, assuming it uses a different workflow */}
                            <Route
                                path="/results"
                                element={
                                    <ProtectedRoute>
                                        <ResultsPage />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;