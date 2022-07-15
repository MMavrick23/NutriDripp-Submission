import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
	BrowserRouter,
	Routes,
	Route,
} from "react-router-dom";
import {ThemeProvider} from "./context/ThemeContext";
import {LangProvider} from "./context/LangContext";
import {UserProvider} from "./context/userContext";
import Loading from "./components/Loading";

ReactDOM.render(
	<React.StrictMode>
		<ThemeProvider>
			<LangProvider>
				<UserProvider>
					<React.Suspense fallback={<Loading visible={true}/>}>
						<BrowserRouter>
							<App/>
						</BrowserRouter>
					</React.Suspense>
				</UserProvider>
			</LangProvider>
		</ThemeProvider>
	</React.StrictMode>,
	document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
