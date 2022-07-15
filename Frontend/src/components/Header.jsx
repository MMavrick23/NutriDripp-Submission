import React, {useContext, useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/styles";
import {ThemeContext} from "../context/ThemeContext";
import {LangContext} from "../context/LangContext";
import {UserContext} from "../context/userContext";
import {NavLink, useNavigate} from 'react-router-dom';
import useWindowDimensions from "../hooks/useWindowDimentions";
import {adminRoot, servicePath} from "../constants/Values";
import {Button} from "../StyledComponents";
import logo from "../logo/logo-wide.svg";
import logoMobile from "../logo/colored.svg";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFacebookF} from "@fortawesome/free-brands-svg-icons";
import {faBars, faBurger, faUser} from "@fortawesome/free-solid-svg-icons";


function Header(props) {

	const navigate = useNavigate();

	const useStyle = makeStyles({
		mainContainer: {
			height: 65,
			width: "100%",
			background: theme => theme.elevation4,
			boxShadow: theme => theme.boxShadow,
		},

		innerContainer: {
			height: "100%",
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
		},

		links: {
			display: "flex",
			alignItems: "center",
			marginInlineStart: "auto",

			"& > a": {
				fontSize: 18,
				color: theme => theme.fontColor,
			},

			"& > a:not(:last-child)": {
				marginInlineEnd: 12,
			},

			"@media only screen and (max-width: 780px)": {
				position: "fixed",
				right: theme => theme.lang === "ar" ? "unset" : 4,
				left: theme => theme.lang === "ar" ? 4 : "unset",
				margin: 0,
				top: 76,
				flexDirection: "column",
				zIndex: 999,
				background: theme => theme.backgroundColor,
				padding: 12,
				borderRadius: 12,
				border: theme => `1px solid ${theme.theme1}`,
				minWidth: 130,
				alignItems: "stretch",

				"& > a": {
					padding: 12,
					marginInlineEnd: [0, "!important"],
				},

				"&::before": {
					content: "''",
					position: "absolute",
					left: 0,
					top: 0,
					width: "100%",
					height: "100%",
					background: theme => theme.elevation4,
					zIndex: -1,
				},
			},

		},

		activeLink: {
			color: theme => [[theme.theme1], "!important"],
		},

		logo: {
			height: 50,
		},

		lottieHolder: {
			cursor: "pointer",
		},

		langSwitch: {
			cursor: "pointer",
		},

		userSection: {
			display: "flex",
			alignItems: "center",
			gap: 6,
			marginInlineEnd: 16,
			cursor: "pointer",

			"& > i": {
				fontSize: 24,
			},

			"& img": {
				width: 32,
				height: 32,
				borderRadius: "100%"
			},
		},

		userMenu: {
			display: "flex",
			position: "absolute",
			background: theme => theme.backgroundColor,
			boxSizing: "border-box",
			boxShadow: theme => theme.boxShadow2,
			flexDirection: "column",
			width: 120,
			top: 64,
			zIndex: 99,
			borderBottomRightRadius: 12,
			borderBottomLeftRadius: 12,
			overflow: "hidden",


			"&::before": {
				content: "''",
				width: "100%",
				height: "100%",
				position: 'absolute',
				background: theme => theme.elevation4,
				pointerEvents: "none",
				zIndex: theme => theme.name === "dark" ? 2 : -1,
				borderBottomRightRadius: 12,
				borderBottomLeftRadius: 12,
			},

			"& > span": {
				height: 40,
				display: "flex",
				alignItems: "center",
				padding: 6,
				boxSizing: "border-box",
				color: theme => theme.fontColor,
			},

			"& > span:hover": {
				background: theme => `${theme.muted}${theme.name === "light" ? "44" : "88"}`,
			},
		},
	});

	const {theme} = useContext(ThemeContext);
	const {lang, toggleLang} = useContext(LangContext);
	const {userInfo, getUserInfo} = useContext(UserContext);

	const [menuVisable, setMenuVisable] = useState(false);
	const [userMenuVisible, setUserMenuVisible] = useState(false);

	const classes = useStyle({...theme, lang});

	const {height, width} = useWindowDimensions();

	const text =
		lang === "ar" ?
			{
				home: "الرئيسية",
				about: "عنا",
				contact: "تواصل معنا",
				yourAccount: "حسابك",
				profile: "الملف الشخصي",
				logout: "تسجيل خروج",
				lang: "EN",
				login: "تسجيل الدخول",
				register: "إنشاء حساب",
				farms: "المزارع"
			}
			:
			{
				home: "Home",
				about: "About",
				contact: "Contact Us",
				yourAccount: "Account",
				profile: "Profile",
				logout: "Logout",
				lang: "عربي",
				login: "Login",
				register: "Register",
				farms: "Farms"
			};


	function logout() {
		localStorage.removeItem("token");
		navigate(adminRoot + "home");
		getUserInfo();
	}

	useEffect(() => {
		getUserInfo()
	}, []) // don't change this issues happen

	useEffect(() => {

		let PingServer = () => {

			let jwt = localStorage.getItem('token');

			if (jwt && jwt.length > 0) {
				var formdata = new FormData();
				formdata.append("Func", "2");
				formdata.append("Token", jwt);

				var requestOptions = {
					method: 'POST',
					body: formdata,
					redirect: 'follow',
				};

				fetch(servicePath + "Beta/UMan.php", requestOptions)
					.then(response => response.json())
					.then(result => console.log(result))
					.catch(error => console.log('error', error));
			}
		};

		let interval = setInterval(PingServer, 13533);

		return () => {
			clearInterval(interval);
		};
	}, []);

	return (
		<div className={classes.mainContainer}>
			<div className={classes.innerContainer + " container"}>

				<div onClick={() => navigate(`${adminRoot}home`)} style={{cursor: "pointer"}}>
					<img src={width > 992 ? logo : logoMobile} alt={"company logo"} className={classes.logo}/>
				</div>


				<div className={classes.links} style={{display: width < 780 && !menuVisable ? "none" : "flex"}}>

					<NavLink to={`${adminRoot}home`} className={(navData) => navData.isActive && classes.activeLink}>{text.home}</NavLink>

					<NavLink to={`${adminRoot}about`} className={(navData) => navData.isActive && classes.activeLink}>{text.about}</NavLink>

					<NavLink to={`${adminRoot}contact`} className={(navData) => navData.isActive && classes.activeLink}>{text.contact}</NavLink>

				</div>


				<div style={{display: "flex", marginInlineStart: userInfo ? 24 : 12}}>


					{!userInfo && (<Button theme={theme} lang={lang} link={true} onClick={() => {
							toggleLang();
						}}>
							{text.lang}
						</Button>)
					}

					<div className={classes.userSection} onClick={() => {
						if (userInfo) {
							setUserMenuVisible(!userMenuVisible);
						}
					}}>

						{userInfo ?
							<p style={{
								textAlign: "center",
								display: "flex",
								alignItems: "center",
								gap: 4
							}}>{userInfo.PictureLink.length > 0 ?
								<img src={userInfo.PictureLink} alt={"user profile pic"} /> :
								<FontAwesomeIcon icon={faUser}/>} {userInfo.FName}</p> :
							<div style={{display: "flex"}}>
								<Button theme={theme} size={1.5} outline style={{marginRight: 4}} onClick={() => {
									navigate(adminRoot + "login");
								}
								}>
									{text.login}
								</Button>

								<Button theme={theme} size={1.5} outline
										onClick={() => {
											navigate(adminRoot + "register");
										}
										}
								>
									{text.register}
								</Button>
							</div>}

						<div className={classes.userMenu} style={{display: userMenuVisible ? "flex" : "none"}}>

							<span onClick={() => navigate(adminRoot + "farms")}>
								{text.farms}
							</span>

							<span onClick={() => navigate(adminRoot + "profile")}>
								{text.profile}
							</span>

							<span onClick={logout}>
								{text.logout}
							</span>

						</div>

					</div>


					<div style={{display: "flex", alignItems: "center"}}>
						<FontAwesomeIcon icon={faBars} style={{
							display: width < 780 ? "block" : "none",
							paddingInlineStart: 12,
						}} onClick={() => setMenuVisable(!menuVisable)}/>
					</div>

				</div>


			</div>
		</div>
	);
}

export default Header;
