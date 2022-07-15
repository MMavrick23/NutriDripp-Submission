import Header from "./components/Header";
import {makeStyles} from "@material-ui/styles";
import {useContext} from "react";
import {ThemeContext} from "./context/ThemeContext";
import {Redirect, Route, Router, Routes, Navigate} from "react-router-dom";
import {adminRoot} from "./constants/Values";
import Home from "./views/Home";
import Footer from "./components/Footer";
import Login from "./views/Login";
import NotificationContainer from "react-notifications/lib/NotificationContainer";
import About from "./views/About";
import Contact from "./views/Contact";
import Register from "./views/Register";
import Profile from "./views/Profile";
import ChangePassword from "./views/ChangePassword";
import Farms from "./views/Farms";

function App() {

	const {theme} = useContext(ThemeContext);

	const GlobalStyles = makeStyles({
		'@global': {
			'.container': {
				boxSizing: "border-box",
				width: "100%",
				paddingRight: "0.5rem",
				paddingLeft: "0.5rem",
				marginRight: "auto",
				marginLeft: "auto",
				transition: "background 300ms ease-out",
				background: theme => `${theme.color}`,
			},

			'.recipesContainer': {
				marginTop: 50,
				display: "grid",
				boxSizing: "border-box",
				gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
				alignItems: "start",
				gap: 30,
				gridTemplateRows: 600,

				"& > div": {
					height: "100%",
				},
			},

			'@media (min-width: 576px)': {
				'.container': {
					maxWidth: "540px",
				},
			},

			'@media (min-width: 768px)': {
				".container": {
					maxWidth: "720px",
				},
			},

			'@media (min-width: 992px)': {
				".container": {
					maxWidth: "960px",
				},
			},

			'@media (min-width: 1200px)': {
				".container": {
					maxWidth: "1140px",
				},
			},

			'@media (min-width: 1400px)': {
				".container": {
					maxWidth: "1320px",
				},
			},

			'body': {
				padding: "0",
				margin: "0",
				fontFamily: "'Poppins', sans-serif",
			},

			'html': {
				color: theme => theme.fontColor,
				backgroundColor: theme => theme.backgroundColor,

				scrollbarWidth: "thin",
				scrollbarColor: theme => `${theme.scrollbarColor} ${theme.scrollbarTrackColor}`,

				'&::-webkit-scrollbar-thumb': {
					backgroundColor: theme => theme.scrollbarColor,
					border: theme => theme.scrollbarBorder,
				},

				'&::-webkit-scrollbar-track': {
					backgroundColor: theme => theme.scrollbarTrackColor,
				},

				'&::-webkit-scrollbar': {
					width: theme => theme.scrollbarWidth,
				},
			},

			'a': {
				textDecoration: "none",
			}
			,
			"a:hover": {
				color: theme => [[theme.theme2], "!important"],
			},

			'*': {
				transition: "background-color 300ms ease-out",
			},


		},
	});

	GlobalStyles(theme);

	return (
		<div>
			<NotificationContainer/>

			<Header/>

			<Routes>
				<Route
					path={`${adminRoot}home`}
					element={<Home />}
				/>

				<Route
					path={`${adminRoot}login`}
					element={<Login />}
				/>

				<Route
					path={`${adminRoot}register`}
					element={<Register />}
				/>

				<Route
					path={`${adminRoot}about`}
					element={<About />}
				/>

				<Route
					path={`${adminRoot}farms`}
					element={<Farms />}
				/>

				<Route
					path={`${adminRoot}contact`}
					element={<Contact />}
				/>

				<Route
					path={`${adminRoot}profile`}
					element={<Profile />}
				/>

				<Route
					path={`${adminRoot}change-password`}
					element={<ChangePassword />}
				/>

				<Route
					path={adminRoot}
					element={<Navigate to={adminRoot + "home"} replace />}
				/>
			</Routes>

			<Footer/>

		</div>
	);
}

export default App;
