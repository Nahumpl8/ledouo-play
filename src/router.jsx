import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { RequireAuth } from './components/layout/RequireAuth';

// Pages
import { Landing } from './pages/Landing';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { AppHome } from './pages/AppHome';
import { Roulette } from './pages/Roulette';
import { Account } from './pages/Account';
import { ScanPurchase } from './pages/ScanPurchase';
import { NotFound } from './pages/NotFound';
import MenuLeDuo from './pages/MenuLeDuo';

export const Router = () => {
  return (
    <>
      <Header />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />

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
        <Route path="/menu" element={<MenuLeDuo />} />

        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
};