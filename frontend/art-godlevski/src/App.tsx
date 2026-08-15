import { Routes, Route } from 'react-router-dom';
import Layout from './elements/Layout/Layout';
import ZoomCartGallery from './elements/ZoomCartGallery/ZoomCartGallery';
import StatementPage from './pages/StatementPage/StatementPage';
import EventsPage from './pages/EventsPage/EventsPage';
import ContactPage from './pages/ContactPage/ContactPage';
import { AppRoute, getAppRoute } from './routes';
import './global.css';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path={getAppRoute(AppRoute.Work)}      element={<ZoomCartGallery />} />
        <Route path={getAppRoute(AppRoute.Statement)} element={<StatementPage />} />
        <Route path={getAppRoute(AppRoute.Events)}    element={<EventsPage />} />
        <Route path={getAppRoute(AppRoute.Contact)}   element={<ContactPage />} />
      </Routes>
    </Layout>
  );
}
