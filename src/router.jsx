import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { RequireAuth } from './components/layout/RequireAuth';
import { RequireAdminEvents } from './components/admin/RequireAdminEvents';
import { ScrollToTop } from './components/layout/ScrollToTop';

// Pages
import { Landing } from './pages/Landing';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { AppHome } from './pages/AppHome';
import { Roulette } from './pages/Roulette';
import { Account } from './pages/Account';
import { ScanPurchase } from './pages/ScanPurchase';
import { NotFound } from './pages/NotFound';
import { SetupPinModal } from './components/staff/SetupPinModal';
import MenuLeDuo from './pages/MenuLeDuo';
import { PinConfirmModal } from './components/staff/PinConfirmModal';
import { Workshops } from './pages/Workshops';
import { EventDetail } from './pages/EventDetail';
import { AdminEvents } from './pages/admin/AdminEvents';
import { EventReservations } from './pages/admin/EventReservations';
import { AdminClients } from './pages/admin/AdminClients';
import { AdminPromotions } from './pages/admin/AdminPromotions';
import AdminRoles from './pages/admin/AdminRoles';
import { AdminEventSlots } from './pages/admin/AdminEventSlots';
import {Terms} from './pages/Terms';
import {PrivacyPolicy} from './pages/PrivacyPolicy';

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
        <Route path="/workshops/:eventId" element={<EventDetail />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/politica-privacidad" element={<PrivacyPolicy />} />

        {/* Auth routes */}
        <Route path="/app/login" element={<Login />} />
        <Route path="/app/forgot-password" element={<ForgotPassword />} />
        <Route path="/app/reset-password" element={<ResetPassword />} />

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

        {/* Admin routes */}
        <Route path="/admin/events" element={
          <RequireAdminEvents>
            <AdminEvents />
          </RequireAdminEvents>
        } />
        <Route path="/admin/events/:eventId/reservations" element={
          <RequireAdminEvents>
            <EventReservations />
          </RequireAdminEvents>
        } />
        <Route path="/admin/clients" element={
          <RequireAdminEvents>
            <AdminClients />
          </RequireAdminEvents>
        } />
        <Route path="/admin/promotions" element={
          <RequireAdminEvents>
            <AdminPromotions />
          </RequireAdminEvents>
        } />
        <Route path="/admin/roles" element={
          <RequireAdminEvents>
            <AdminRoles />
          </RequireAdminEvents>
        } />
        <Route path="/admin/events/:eventId/slots" element={
          <RequireAdminEvents>
            <AdminEventSlots />
          </RequireAdminEvents>
        } />

        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
};