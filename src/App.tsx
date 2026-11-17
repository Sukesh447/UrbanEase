import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { ReportIssuePage } from '@/pages/ReportIssuePage';
import { IssueDetailsPage } from '@/pages/IssueDetailsPage';
import { IssuesDirectoryPage } from '@/pages/IssuesDirectoryPage';
import { OfficerConsolePage } from '@/pages/OfficerConsolePage';
import { PlannerAnalyticsPage } from '@/pages/PlannerAnalyticsPage';
import { ParkAndChargePage } from '@/pages/ParkAndChargePage';
import { BusTransitPage } from '@/pages/BusTransitPage';
import { ProfileImpactPage } from '@/pages/ProfileImpactPage';

export const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="report" element={<ReportIssuePage />} />
          <Route path="issues" element={<IssuesDirectoryPage />} />
          <Route path="issues/:id" element={<IssueDetailsPage />} />
          <Route path="park" element={<ParkAndChargePage />} />
          <Route path="transit" element={<BusTransitPage />} />
          <Route path="officer" element={<OfficerConsolePage />} />
          <Route path="planner" element={<PlannerAnalyticsPage />} />
          <Route path="profile" element={<ProfileImpactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
