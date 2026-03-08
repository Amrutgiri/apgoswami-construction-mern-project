import 'bootstrap/dist/css/bootstrap.min.css';
import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './assets/css/style.scss';
import './admin/styles/admin.scss';
import 'sweetalert2/dist/sweetalert2.min.css';
import ScrollToTop from './components/common/ScrollToTop';

const Home = lazy(() => import('./components/frontend/Home'));
const About = lazy(() => import('./components/frontend/About'));
const Services = lazy(() => import('./components/frontend/Services'));
const Projects = lazy(() => import('./components/frontend/Projects'));
const Blog = lazy(() => import('./components/frontend/Blog'));
const BlogDetails = lazy(() => import('./components/frontend/BlogDetails'));
const ContactUs = lazy(() => import('./components/frontend/ContactUs'));
const RouteNotFoundPage = lazy(() => import('./components/common/RouteNotFoundPage'));

const AdminLayout = lazy(() => import('./admin/layouts/AdminLayout'));
const AdminAuthGuard = lazy(() => import('./admin/components/AdminAuthGuard'));
const AdminLoginPage = lazy(() => import('./admin/pages/AdminLoginPage'));
const ForgotPasswordPage = lazy(() => import('./admin/pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('./admin/pages/DashboardPage'));
const HomeHeroPage = lazy(() => import('./admin/pages/HomeHeroPage'));
const AboutSectionPage = lazy(() => import('./admin/pages/AboutSectionPage'));
const ServicesPage = lazy(() => import('./admin/pages/ServicesPage'));
const TestimonialsPage = lazy(() => import('./admin/pages/TestimonialsPage'));
const WhyChooseUsPage = lazy(() => import('./admin/pages/WhyChooseUsPage'));
const BlogsPage = lazy(() => import('./admin/pages/BlogsPage'));
const ContactContentPage = lazy(() => import('./admin/pages/ContactContentPage'));
const InquiryPage = lazy(() => import('./admin/pages/InquiryPage'));
const SettingsPage = lazy(() => import('./admin/pages/SettingsPage'));
const ProjectsPage = lazy(() => import('./admin/pages/ProjectsPage'));
const MediaPage = lazy(() => import('./admin/pages/MediaPage'));
const ProfilePage = lazy(() => import('./admin/pages/ProfilePage'));
const ChangePasswordPage = lazy(() => import('./admin/pages/ChangePasswordPage'));
const AdminNotFoundPage = lazy(() => import('./admin/pages/AdminNotFoundPage'));

function App() {
  return (
    <>
		<BrowserRouter>
			<ScrollToTop />
			<Suspense fallback={<div className="container py-5">Loading...</div>}>
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/about' element={<About />} />
					<Route path='/services' element={<Services />} />
					<Route path='/projects' element={<Projects />} />
					<Route path='/blogs' element={<Blog />} />
					<Route path='/blogs/:slug' element={<BlogDetails />} />
					<Route path='/blog-details' element={<BlogDetails />} />
					<Route path='/contact-us' element={<ContactUs />} />
					<Route path='/admin/login' element={<AdminLoginPage />} />
					<Route path='/admin/forgot-password' element={<ForgotPasswordPage />} />
					<Route path='/admin' element={<AdminAuthGuard><AdminLayout /></AdminAuthGuard>}>
						<Route index element={<DashboardPage />} />
						<Route path='home-hero' element={<HomeHeroPage />} />
						<Route path='about-section' element={<AboutSectionPage />} />
						<Route path='services' element={<ServicesPage />} />
						<Route path='testimonials' element={<TestimonialsPage />} />
						<Route path='why-choose-us' element={<WhyChooseUsPage />} />
						<Route path='blogs' element={<BlogsPage />} />
						<Route path='contact-content' element={<ContactContentPage />} />
						<Route path='inquiries' element={<InquiryPage />} />
						<Route path='settings' element={<SettingsPage />} />
						<Route path='projects' element={<ProjectsPage />} />
						<Route path='media' element={<MediaPage />} />
						<Route path='profile' element={<ProfilePage />} />
						<Route path='change-password' element={<ChangePasswordPage />} />
						<Route path='*' element={<AdminNotFoundPage />} />
					</Route>
					<Route path='*' element={<RouteNotFoundPage />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
    </>
  )
}

export default App
