import React, {createContext, useEffect, useState} from "react";

export const InstallPwaContext = createContext();


export function InstallPwaProvider(props) {

	const [supportsPWA, setSupportsPWA] = useState(false);
	const [promptInstall, setPromptInstall] = useState(null);

	useEffect(() => {

		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();

			setSupportsPWA(true);
			setPromptInstall(e);

		});

		window.addEventListener('appinstalled', () => {

			setSupportsPWA(false);
			setPromptInstall(null);

		});

	}, []);

	return (
		<InstallPwaContext.Provider value={{supportsPWA, promptInstall}}>
			{props.children}
		</InstallPwaContext.Provider>
	);

}
