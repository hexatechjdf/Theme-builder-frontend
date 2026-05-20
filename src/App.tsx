import React from "react";
import ChakraProvider from "./ChakraProvider";
import { RecoilRoot } from "recoil";
import { BrowserRouter as Router } from "react-router-dom";
import Routes from "./components/Routes/Routes";
import ReactQueryProvider from "./ReactQueryProvider";
import { ToastContainer } from "react-toastify";
import { ContextProvider } from "./components/context/CustomAttributeContextApi";
import GHLSSOProvider from "./components/Auth/GHLSSOProvider";

// The app is served under a sub-path (vite.config.ts `base`, e.g.
// `/theme-customizer/`). React Router must match routes with that SAME
// prefix as its `basename`, or every route 404s on a sub-path host.
// `import.meta.env.BASE_URL` is whatever Vite's `base` is set to, so this
// stays correct in dev, at the sub-path, and at root ("/") alike.
const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

const App: React.FC = () => {
	return (
		<ContextProvider>
			<ReactQueryProvider>
				<Router basename={ROUTER_BASENAME}>
					<RecoilRoot>
						<ChakraProvider>
							  {/* <ThemeLoader /> */}
							<GHLSSOProvider>
								<Routes />
							</GHLSSOProvider>
						</ChakraProvider>
					</RecoilRoot>
				</Router>
				<ToastContainer
					position="bottom-right"
					autoClose={2000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick={false}
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="light"
				/>
			</ReactQueryProvider>
		</ContextProvider>
	);
};

export default App;
