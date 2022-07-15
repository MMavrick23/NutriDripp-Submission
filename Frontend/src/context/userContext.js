import React, {createContext, useContext, useState} from "react";
import {servicePath} from "../constants/Values";
import {ThemeContext} from "./ThemeContext";
import {LangContext} from "./LangContext";

export const UserContext = createContext();


export function UserProvider(props) {

	const {theme, toggleTheme} = useContext(ThemeContext);
	const {lang, toggleLang} = useContext(LangContext);

	const [userInfo, setUserInfo] = useState(null);

	function getUserInfo() {

		let jwt = localStorage.getItem('token');

		if (jwt && jwt.length > 0) {

			const data = new FormData();
			//authentication
			data.append("Func", "3");
			data.append("Token", jwt);

			fetch(`${servicePath}Beta/UMan.php`, {
				method: 'POST',
				body: data,
				headers:
					{
						"Accept": "application/json",
					},
			}).then(function (res) {
				return res.json();
			}).then(function (data) {
				setUserInfo(data.Payload);

				setTimeout(() => {
					try {

						if (lang === "en" && !(data.Payload.Language === "1")){
							toggleLang()
						}
						if (lang === "ar" && !(data.Payload.Language === "2")){
							toggleLang()
						}
					} catch (e) {

					}

				}, 0);


			}).catch(function (e) {
				console.log(e);
			});

		} else {
			setUserInfo(null);
		}

	}

	return (
		<UserContext.Provider value={{userInfo, getUserInfo}}>
			{props.children}
		</UserContext.Provider>
	);

}
