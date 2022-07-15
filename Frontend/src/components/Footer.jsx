import React, {useContext, useEffect} from 'react';
import {makeStyles} from "@material-ui/styles";
import {ThemeContext} from "../context/ThemeContext";
import {P} from "../StyledComponents";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFacebookF, faInstagram, faTwitter, faWhatsapp} from "@fortawesome/free-brands-svg-icons";
import logo from "../logo/logo-wide.svg";
import {NavLink} from "react-router-dom";
import {adminRoot} from "../constants/Values";
import {LangContext} from "../context/LangContext";
import {faEnvelope, faHouse, faMailBulk, faPhone} from "@fortawesome/free-solid-svg-icons";
import {UserContext} from "../context/userContext";

function Footer(props) {

	const {theme} = useContext(ThemeContext);

	const {lang} = useContext(LangContext);

	const {userInfo, getUserInfo} = useContext(UserContext);

	const useStyle = makeStyles({
		outerContainer: {
			background: theme.theme3,
			width: "100%",
			boxShadow: "0px -5px 10px #0006",

			"& hr": {
				margin: 0,
			},
		},

		innerContainer: {
			display: "flex",
			flexDirection: "column",
		},

		contactArea: {
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",

			paddingRight: 24,
			paddingLeft: 24,

			"@media only screen and (max-width: 668px)": {
				flexDirection: "column",
				marginBottom: 24,
			},
		},

		iconsContainer: {
			display: "flex",
			justifyContent: "space-evenly",
			gap: 24,
			fontSize: 16,

			"& > *": {
				color: "white",
			},
		},

		linksArea: {
			display: "flex",
			justifyContent: "space-evenly",
			marginTop: 48,
			gap: 48,
			paddingRight: 24,
			paddingLeft: 24,
			marginBottom: 24,

			"& img": {
				filter: "brightness(0)invert(1)",
				maxWidth: "70%",
			},

			"& > div": {
				width: "100%",
				display: "flex",
				flexDirection: "column",
				gap: 8,

				"& > a": {
					color: "white"
				}
			},

			"& h3": {
				color: "white",
			},

			"@media only screen and (max-width: 992px)": {
				flexDirection: "column",
				textAlign: "center",

				"& > div": {
					justifyContent: "center"
				},

				"& img":{
					margin: "0 auto"
				}
			}
		},

		getInTouch: {
			"& > p": {
				marginTop: 0,
				marginBottom: 0,

				"& > *": {
					marginInlineEnd: 12
				}
			}
		},

		footerBottom: {
			background: theme.theme7,

			display: "flex",
			justifyContent: "center"
		},


	});

	const classes = useStyle(theme);

	const text =
		lang === "ar" ?
			{
				home: "الرئيسية",
				about: "عنا",
				contact: "تواصل معنا",
				getStarted: "ابدء الان",
				exploreNow: "تصفح",
				getInTouch: "تواصل",
				login: "تسجيل الدخول",
				register: "تسجيل",
				getConnected: "تواصل معنا على الشبكات الاجتماعية",
				account: "الحساب",
				farms: "المزارع",
			}
			:
			{
				home: "Home",
				about: "About",
				contact: "Contact Us",
				getStarted: "GET STARTED",
				exploreNow: "EXPLORE NOW",
				getInTouch: "GET IN TOUCH",
				login: "Login",
				register: "Register",
				getConnected: "Get connected with us on social networks:",
				account: "Account",
				farms: "Farms",
			};

	useEffect(() => {
		getUserInfo()
	}, [])

	return (
		<div className={classes.outerContainer}>
			<div className={"container " + classes.innerCotnainer}>

				<div className={classes.contactArea}>
					<P theme={theme} white={true}>
						{text.getConnected}
					</P>

					<div className={classes.iconsContainer}>
						<a href="https://www.facebook.com/MMavrick23">
							<FontAwesomeIcon icon={faFacebookF}/>
						</a>
						<a href="https://twitter.com/MMavrick23">
							<FontAwesomeIcon icon={faTwitter}/>
						</a>
						<a href="https://www.instagram.com/mmavrick23">
							<FontAwesomeIcon icon={faInstagram}/>
						</a>
						<a href="https://wa.me/+201093656729">
							<FontAwesomeIcon icon={faWhatsapp}/>
						</a>
					</div>
				</div>

				<hr/>

				<div className={classes.linksArea}>
					<div>
						<img src={logo} alt={"company logo"}/>

						{/*todo make this multi language*/}
						<P theme={theme} white={true}>
							Multipurpose management solution for farms, gardens, landscapes and all kinds of
							agricultural usage.
						</P>
					</div>

					<div>
						<h3>
							{text.exploreNow}
						</h3>

						<NavLink to={`${adminRoot}home`}>{text.home}</NavLink>

						<NavLink to={`${adminRoot}about`}>{text.about}</NavLink>

						<NavLink to={`${adminRoot}contact`}>{text.contact}</NavLink>
					</div>

					<div>
						<h3>
							{text.getStarted}
						</h3>

						{!userInfo ? <NavLink to={`${adminRoot}login`}>{text.login}</NavLink> : <NavLink to={`${adminRoot}profile`}>{text.account}</NavLink>}

						{!userInfo ? <NavLink to={`${adminRoot}register`}>{text.register}</NavLink> : <NavLink to={`${adminRoot}farms`}>{text.farms}</NavLink>}

					</div>

					<div className={classes.getInTouch}>
						<h3>
							{text.getInTouch}
						</h3>

						<P theme={theme} white={true}>
							<FontAwesomeIcon icon={faHouse}/>

							Nile University
						</P>

						<P theme={theme} white={true}>
							<FontAwesomeIcon icon={faEnvelope}/>

							info@nutridripp.com
						</P>

						<P theme={theme} white={true}>
							<FontAwesomeIcon icon={faPhone}/>

							+20-109-365-6729
						</P>

					</div>
				</div>


			</div>

			<div className={classes.footerBottom}>
				<P theme={theme} white={true}>
					Copyright © 2022, NutriDripp.
					All rights reserved.
				</P>
			</div>
		</div>
	);
}

export default Footer;
