import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Studio from './pages/Studio';
import Editor from './pages/Editor';
import VideoGenerator from './pages/Video';
import Animate from './pages/Animate';
import Pricing from './pages/Pricing';
import AITools from './pages/AITools';
import Login from './pages/Login';
import WatermarkRemover from './pages/WatermarkRemover'; // Added import for WatermarkRemover

const GOOGLE_CLIENT_ID = "652644336964-cm3qlfrn9himi4vjvmtqevpdt7hqg4bk.apps.googleusercontent.com";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <main className="min-h-screen flex flex-col">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/studio" element={<Studio />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/video" element={<VideoGenerator />} />
              <Route path="/animate" element={<Animate />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/tools" element={<AITools />} />
              <Route path="/login" element={<Login />} />
              <Route path="/watermark-remover" element={<WatermarkRemover />} /> {/* Added route for WatermarkRemover */}
            </Routes>
            <Footer />
          </main>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
