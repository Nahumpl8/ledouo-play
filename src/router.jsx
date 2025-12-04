import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { RequireAuth } from './components/layout/RequireAuth';
import { ScrollToTop } from './components/layout/ScrollToTop';

// Pages
import { Landing } from './pages/Landing';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { AppHome } from './pages/AppHome';
import { Roulette } from './pages/Roulette';
import { Account } from './pages/Account';
import { ScanPurchase } from './pages/ScanPurchase';
import { NotFound } from './pages/NotFound';
import { SetupPinModal } from './components/staff/SetupPinModal';
import MenuLeDuo from './pages/MenuLeDuo';
import { PinConfirmModal } from './components/staff/PinConfirmModal';
import { Workshops } from './pages/Workshops';

export const Router = () => {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={<MenuLeDuo />} />
        <Route path="/workshops" element={<Workshops />} />

        {/* Auth routes */}
        <Route path="/app/login" element={<Login />} />

        {/* Protected routes */}
        <Route path="/app" element={
          <RequireAuth>
            <AppHome />
          </RequireAuth>
        } />
        <Route path="/app/ruleta" element={
          <RequireAuth>
            <Roulette />
          </RequireAuth>
        } />
        <Route path="/app/cuenta" element={
          <RequireAuth>
            <Account />
          </RequireAuth>
        } />
        <Route path="/app/scan" element={
          <RequireAuth>
            <ScanPurchase />
          </RequireAuth>
        } />

        

        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
};