import { Outlet } from "react-router-dom";

// SSO mode: auth is handled via the SSO-Token / APP-KEY headers attached by
// the axios interceptors, so the in-app login is bypassed and every protected
// route is accessible. Restore the auth check below if you re-enable login.
const ProtectedRoute = () => {
    return <Outlet />;
}

export default ProtectedRoute