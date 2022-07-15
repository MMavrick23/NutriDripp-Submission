import React, {useContext} from 'react';
import {makeStyles} from "@material-ui/styles";
import {ThemeContext} from "../context/ThemeContext";
import background from "../images/image-4.jpg"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHome} from "@fortawesome/free-solid-svg-icons";
import {faEnvelope} from "@fortawesome/free-solid-svg-icons";
import {faPhone} from "@fortawesome/free-solid-svg-icons";
import {LangContext} from "../context/LangContext";


function Contact(props) {

	const useStyle = makeStyles({
		container: {
			display: "flex",
			height: "calc(100vh - 80px)",
			justifyContent: "center",

			"& > img": {
				width: "100%",
				height: "100%",
				objectFit: "cover",
				objectPosition: "100%",
				margin: 0,
				position: "absolute",
				zIndex: -1,
			},
		},

		textContainer: {
			display: "flex",
			alignItems: "center",
			flexDirection: "column",
			background: "white",
			width: "min(600px, 100%)",
			marginTop: 120,
			height: "min-content",
			padding: 64,
			borderRadius: 12,
			marginRight: 12,
			marginLeft: 12,

			"& h1": {
				color: theme => theme.theme3,
				fontSize: "2.4rem",
			},

			"& p": {
				fontSize: "1.4rem",
				textAlign: "center"
			},

			"& span": {
				position: "relative",
				fontSize: "1.3rem",
				bottom: -12,
			},

			"& svg": {
				marginInlineEnd: 12,
				color: theme => theme.theme3
			},

		}
	});

	const {theme} = useContext(ThemeContext);
	const classes = useStyle(theme);

	const {lang, toggleLang} = useContext(LangContext);

	const text =
		lang === "ar" ?
			{
				header: "معلومات الاتصال",
				address: "العنوان",
				email: "البريد الإلكتروني",
				phone: "الهاتف",
			}
			:
			{
				header: "Contact Info",
				address: "Address",
				email: "Email",
				phone: "Phone",
			};

	return (
		<div className={classes.container}>
			<img src={background} alt={""} />

			<div className={classes.textContainer}>
				<h1>
					{text.header}
				</h1>
				{/*<p style={{borderBottom: `2px solid ${theme.theme2}`}}>*/}
				{/*</p>*/}

				<span>
					<FontAwesomeIcon icon={faHome}/>
					{text.address}
				</span>

				<p>
					Nile University, 26th of July Corridor, <br/> El Sheikh Zayed, Giza, Egypt
				</p>

				<span>
					<FontAwesomeIcon icon={faEnvelope}/>
					{text.email}
				</span>

				<p>
					info@nutridripp.com
				</p>

				<span>
					<FontAwesomeIcon icon={faPhone}/>
					{text.phone}
				</span>

				<p>
					+20-109-365-6729
				</p>

			</div>
		</div>
	);
}

export default Contact;
