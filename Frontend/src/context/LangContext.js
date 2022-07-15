import React,{createContext, useState} from "react";

export const LangContext = createContext();


export function LangProvider(props){

	const [lang, setLang] = useState(localStorage.getItem('lang') ? "ar" : "en");

	if (!localStorage.getItem('lang')){
		localStorage.setItem('lang', lang === "en" ? "" : "1");
	}

	function toggleLang(){
		if (lang === "ar"){
			setLang("en");
			localStorage.setItem("lang", "");
			document.dir = "ltr"
			document.documentElement.lang = "en"
		}else{
			setLang("ar");
			localStorage.setItem("lang", "1");
			document.dir = "rtl"
			document.documentElement.lang = "ar"
		}
	}

	return (
		<LangContext.Provider value={{lang, toggleLang}}>
			{props.children}
		</LangContext.Provider>
	)

}
