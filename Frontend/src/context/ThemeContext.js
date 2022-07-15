import React,{createContext, useState} from "react";


const lightTheme = {
	name: "light",

	//spacingUnit
	spacingUnit: 2,

	theme1: "#5EB25B",
	theme2: "#9cd398",
	theme3: "#063149",
	theme4: "#3e667c",
	theme5: "#25978d",
	theme6: "#66bcb2",
	theme7: "#052C42",

	HeaderColor: "#fff",
	backgroundColor: "#f2f2f2",
	fontColor: "#000",
	muted: "#808080",

	graphBackground: "#024a2ba1",
	graphBorder: "#005F35",

	errorColor: "#B00020",

	boxShadow: "0px 2px 2px #0000001A",
	boxShadow2: "0px 7px 7px #0000001A",

	borderColor: "#707070",

	elevation2: "#ffffff",
	elevation4: "#ffffff",
	elevation8: "#ffffff",

	scrollbarColor: "#90A4AE",
	scrollbarTrackColor: "#CFD8DC",
	scrollbarBorder: "3px solid #CFD8DC",
	scrollbarWidth: "12px",

}

const darkTheme = {
	name: "dark",

	//spacingUnit
	spacingUnit: 2,

	theme1: "#7C5624",
	theme2: "#FAAF40",
	theme3: "#D68A27",
	theme4: "#BF7319",
	theme5: "#F7CC94",
	theme6: "#F2E3D1",

	HeaderColor: "#ffffff0b",
	backgroundColor: "#121212",

	fontColor: "#dedede",
	muted: "#808080",

	graphBackground: "#005F354f",
	graphBorder: "#005F35",

	errorColor: "#CF6679",

	borderColor: "#707070",
	boxShadow: "0px 15px 15px #0000001A",
	boxShadow2: "0px 15px 15px #0000001A",

	scrollbarColor: "#ffffff24",
	scrollbarTrackColor: "transparent",
	scrollbarBorder: "1px solid #ffffff14",
	scrollbarWidth: "8px",

	elevation2: "#ffffff07",
	elevation4: "#ffffff0A",
	elevation8: "#ffffff1f",
}


export const ThemeContext = createContext();

export function ThemeProvider(props){

	const isDarkTheme = false; //this is bullshit it's here because later on i should detect the user's computer theme

	const [theme, setTheme] = useState(localStorage.getItem('isLight') ? localStorage.getItem('isLight') === "1" ? lightTheme : darkTheme : isDarkTheme ? darkTheme : lightTheme);

	localStorage.setItem('isLight', theme.name === "dark" ? "0" : "1");

	function toggleTheme(){
		if (theme === lightTheme){
			setTheme(darkTheme);
			localStorage.setItem("isLight", "0")
		}else{
			setTheme(lightTheme);
			localStorage.setItem("isLight", "1")
		}
	}

	return (
		<ThemeContext.Provider value={{theme, toggleTheme}}>
			{props.children}
		</ThemeContext.Provider>
	)

}
