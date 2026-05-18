import React from "react";
import ChakraProvider from "./ChakraProvider";
import { RecoilRoot } from "recoil";
import { BrowserRouter as Router } from "react-router-dom";
import Routes from "./components/Routes/Routes";
import ReactQueryProvider from "./ReactQueryProvider";
import { ToastContainer } from "react-toastify";
import { ContextProvider } from "./components/context/CustomAttributeContextApi";
const App: React.FC = () => {
	return (
		<ContextProvider>
			<ReactQueryProvider>
				<Router>
					<RecoilRoot>
						<ChakraProvider>
							  {/* <ThemeLoader /> */}
							<Routes />
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
