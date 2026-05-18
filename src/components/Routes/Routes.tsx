import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes as Switch } from "react-router-dom";
import MainLayout from "../Layouts/MainLayout";
import LoadingFallback from "../Atoms/LoadingFallbackSpinner";
import CustomCSSComponent from "../Pages/CustomCss";
import Login from "../Pages/Login";
import ProtectedRoute from "../Layouts/ProtectedRoute";
import Test from "../../Test";
import ForgetPassword from "../Pages/ForgetPassword";
import VerifyOtp from "../Pages/VerifyOtp";
// Lazy loading the page components
const Dashboard = lazy(() => import("../Pages/Dashboard"));
const LoginTheme = lazy(() => import("../Pages/LoginTheme"));
const LoaderAnimation = lazy(() => import("../Pages/LoaderAnimation"));

const Routes = () => {
	return (

		<Suspense fallback={<LoadingFallback />}>
			<Switch>

				<Route path="/" element={<Navigate to="dashboard" />} />
				<Route path="/login" element={<Login />} />
				<Route path="/forget-password" element={<ForgetPassword />} />
				<Route path="/verify-otp" element={<VerifyOtp />} />


				<Route element={<ProtectedRoute />}>
					<Route path="/testdomain" element={<Test />} />
					<Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
					<Route path="/LoginTheme" element={<MainLayout><LoginTheme /></MainLayout>} />
					<Route path="/loader" element={<MainLayout> <LoaderAnimation />  </MainLayout>} />
					<Route path="/custom-css" element={<MainLayout><CustomCSSComponent /></MainLayout>} />
				</Route>

				{/* default route */}
				{/* <Route path="/" element={<Dashboard />} /> */}
			</Switch>
		</Suspense>

	);
};

export default Routes;
