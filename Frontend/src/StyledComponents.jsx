import {styled} from "@material-ui/styles";

export const Input = styled('input')(({theme}) => ({
	border: "none",
	background: theme.backgroundColor,
	color: theme.fontColor,
	fontFamily: "'Poppins', sans-serif",
	borderRadius: 4,
	// height: [44, "!important"],

	"&:active": {
		outline: "none",
	},

	"&:focus": {
		outline: "none",
	},

	"&:disabled": {
		background: theme.elevation4
	}
}));


export const PageHeader = styled('h1')(({theme, lang}) => ({
	color: theme.fontColor,
	position: "relative",

	"&::after": {
		content: "''",
		position: "absolute",
		background: `${theme.muted}${theme.name === "light" ? "44" : "88"}`,
		left: 0,
		bottom: -19,
		width: "100%",
		height: 1,
	},

	"&::before": {
		content: "''",
		position: "absolute",
		background: theme.theme3,
		left: lang === "ar" ? "unset" : 0,
		right: lang === "ar" ? 0 : "unset",
		bottom: -20,
		width: 120,
		height: 3,
	},
}));

export const Button = styled('button')(({theme, lang, link = false, size = 2, outline = false}) => ({
	background: link || outline ? "none" : theme.theme2,
	color: link ? theme.theme1 : "black",
	fontSize: 0.65 * size + "em",
	margin: link ? "0" : "1em",
	borderRadius: outline ? 18 : 4,
	padding: "0.50em 1.3em",
	border: outline ? "2px solid " + theme.theme1 : 0,
	outline: 0,
	cursor: "pointer",

	"&:hover": {
		background: link ? "none" : theme.theme1,
	}

}));


export const TextArea = styled('textarea')(({theme}) => ({
	border: "none",
	background: theme.backgroundColor,
	color: theme.fontColor,
	fontFamily: "'Poppins', sans-serif",
	borderRadius: 4,
	resize: "vertical",
	padding: 12,

	"&::placeholder": {
		fontSize: 14
	},

	"&:active": {
		outline: "none",
	},

	"&:focus": {
		outline: "none",
	},

	"&:disabled": {
		background: theme.elevation4
	}
}));


export const P = styled('p')(({theme, white = false}) => ({
	fontSize: 16,
	color: white ? "white" : theme.theme3
}));
