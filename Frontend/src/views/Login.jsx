import React, {useContext, useRef, useState} from 'react';

import {makeStyles} from "@material-ui/styles";
import {ThemeContext} from "../context/ThemeContext";
import {LangContext} from "../context/LangContext";
import {Button, Input, P} from "../StyledComponents";
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import {adminRoot, servicePath} from "../constants/Values";
import Loading from "../components/Loading";
import {UserContext} from "../context/userContext";
import {NavLink, useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose, faWindowClose} from "@fortawesome/free-solid-svg-icons";

function Login(props) {

	const {theme} = useContext(ThemeContext);
	const {lang} = useContext(LangContext);
	const {getUserInfo} = useContext(UserContext);

	const [forgotPassword, setForgotPassword] = useState(false);

	const [forgotPasswordEmail, setForgetPasswordEmail] = useState("");

	const [loginInput, setLoginInput] = useState("");
	const [passwordInput, setPasswordInput] = useState("");

	const [isLoading, setIsLoading] = useState(false);

	const [tooManyattempts, setTooManyAttempts] = useState(0)

	const navigate = useNavigate();

	const useStyle = makeStyles({
		mainContainer: {
			display: "flex",
			flexDirection: "column",
			background: theme => theme.elevation2,
			borderRadius: 12,
			padding: 24,
			marginTop: 84,
			marginBottom: 84,
			maxWidth: 450,
			margin: "0 auto",
			gap: 18,
			border: "1px solid #cccccc",
			boxShadow: "2px 2px 5px #0006",

			"& > h1": {
				margin: 0,
				padding: 0,

				marginBottom: 12,

				color: theme => theme.theme3
			},

			"& a": {
				color: theme => theme.fontColor,
			},

			"& button": {
				margin: 0,
			},

			"& button:not(:last-child)": {
				marginInlineEnd: 12,
			},

			"& > p": {
				margin: 0,
				padding: 0,
				color: theme => theme.errorColor,
			},

		},

		Inputs: {
			display: "flex",
			flexWrap: "wrap",
			gap: 12,

			"& input": {
				padding: 12,
				flexGrow: 1,
				transition: "transform 300ms"
			},

			"& input:focus": {
				transform: "scale(1.01)"
			}

		},

		forgotPasswordDialog: {
			display: "flex",
			position: "fixed",
			width: "100%",
			height: "100%",
			padding: 24,
			top: 0,
			left: 0,
			background: "#000000ae",
			zIndex: 9,
			alignItems: "center",
			justifyContent: "center",
			boxSizing: 'border-box',

			"& input": {
				border: theme => `1px solid ${theme.theme1}`,
				width: "100%",
				padding: 12,
				boxSizing: "border-box",
				marginBottom: 8,

				"&:focus": {
					border: theme => `1px solid ${theme.theme2}`,
				},
			},

			"& > div": {
				width: 400,
				maxWidth: "90%",
				padding: 24,
				background: theme => theme.backgroundColor,

				"& h2": {
					padding: 0,
					margin: 0,
				},

				"& textarea:focus": {
					border: theme => `${theme.theme2} 1px solid`,
				},

				"& button": {
					width: 265,
				},

			},
		},

	});

	const classes = useStyle(theme);

	const text =
		lang === "ar" ?
			{
				loginForm: "تسجيل الدخول",
				login: "اسم المستخدم او البريد الإلكتروني",
				email: "البريد الإلكتروني",
				password: "كلمه السر",
				loginAction: "تسجيل الدخول",
				forgotPassword: "هل نسيت كلمه السر؟",
				createAccount: "إنشاء حساب",
				wrongUserNameOrPassword: "معلومات خظأ",
				makeSureFieldsAreNotEmpty: "يرجى التأكد من أن الحقول ليست فارغة",
				unknownError: "خطاء غير معروف حاول وقت اخر",
				welcome: "مرحبا",
				continue: "استمر",
				forgotPasswordP: "أدخل عنوان بريدك الإلكتروني وسنرسل إليك تعليمات عبر البريد الإلكتروني حول كيفية إعادة تعيين كلمة المرور الخاصة بك",
				networkError: "حدث خطاء في الإتصال تأكد من اتصالك بالأنترنيت",
				emailSent: "تم إرسال البريد الإلكتروني الخاص بإعادة التعيين",
				emailNotFound: "لا يوجد حساب يطابق تلك المعلومات",
				suspendedUser: "مستخدم معلق",
				tooMany: "محاولات كثيرة"
			}
			:
			{
				loginForm: "Login Form",
				login: "Username or Email",
				email: "Email",
				password: "Password",
				loginAction: "Login",
				forgotPassword: "Forgot your password?",
				createAccount: "Create Account",
				wrongUserNameOrPassword: "wrong credentials",
				makeSureFieldsAreNotEmpty: "Please make sure that the fields are not empty",
				unknownError: "Unknown issue happened try again later",
				welcome: "Welcome",
				continue: "Continue",
				forgotPasswordP: "Enter your email address and we'll email you instructions on how to reset your password",
				networkError: "A connection error occurred. Make sure you are connected to the Internet",
				emailSent: "Reset email has been sent to you",
				emailNotFound: "No account match that information",
				suspendedUser: "Suspended User",
				tooMany: "Too many attempts"
			};


	function login(e) {
		e.preventDefault();

		if (loginInput && passwordInput) {

			setIsLoading(true);

			const data = new FormData();
			//authentication
			data.append("Func", "0");
			data.append("Login", loginInput);
			data.append("Pass", passwordInput);

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

				switch (data.ReturnCode) {
					case 1:
						NotificationManager.success(text.welcome, '', 5000, null, null, '');
						localStorage.setItem("token", data.Payload);
						setIsLoading(false);
						getUserInfo();
						window.location.replace(adminRoot + "home");
						break
					case -1:
						setIsLoading(false);
						NotificationManager.error(text.wrongUserNameOrPassword, '', 5000, null, null, '');
						break
					case -2:
						NotificationManager.error(text.tooMany, '', 5000, null, null, '');
						setTooManyAttempts(data.ReturnParam)
						break
					case -3:
						NotificationManager.error(text.suspendedUser, '', 5000, null, null, '');
						break
				}

			}).catch(function (error) {
				setIsLoading(false);
				NotificationManager.error(text.networkError, '', 5000, null, null, '');
			});

		} else {
			NotificationManager.error(text.makeSureFieldsAreNotEmpty, '', 5000, null, null, '');
			setIsLoading(false);
		}

	}

	function forgotPasswordFunction() {

		setIsLoading(true);

		const data = new FormData();
		//authentication
		data.append("Func", "7");
		data.append("Mail", forgotPasswordEmail);

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
			setIsLoading(false);

			if (data.ReturnCode == "1") {
				NotificationManager.success(text.emailSent, '', 5000, null, null, '');
				setForgotPassword(false);
				setForgetPasswordEmail("");
			} else {
				NotificationManager.error(text.unknownError, '', 5000, null, null, '');
			}

		}).catch(function (error) {
			setIsLoading(false);
			NotificationManager.error(text.networkError, '', 5000, null, null, '');
		});

	}


	tooManyattempts > 0 && setTimeout(() => {
		setTooManyAttempts(tooManyattempts - 1)
	}, 1000)


	return (
		<div className={"container"}>

			<Loading visible={isLoading}/>

			<form className={classes.mainContainer} onSubmit={login}>

				<h1>
					{text.loginForm}
				</h1>

				{tooManyattempts > 0 && <P theme={theme}>{tooManyattempts}</P>}

				<div className={classes.Inputs} style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between"
				}}>

					<Input theme={theme} placeHolder={text.login} onChange={(e) => setLoginInput(e.target.value)} value={loginInput}/>

					<Input theme={theme} type="password" placeHolder={text.password} onChange={(e) => setPasswordInput(e.target.value)} value={passwordInput}/>

				</div>

				<div>
					<NavLink to={"#"} theme={theme} onClick={() => {
						setForgotPassword(true);
					}}>
						{text.forgotPassword}
					</NavLink>
				</div>

				<div style={{marginInlineStart: "auto"}}>

					<Button theme={theme} onClick={() => navigate({pathname: adminRoot + "register"})} type={'reset'} link={true}>
						{text.createAccount}
					</Button>

					<Button theme={theme} onClick={login} type={'submit'}>
						{text.loginAction}
					</Button>

				</div>

			</form>

			<div className={classes.forgotPasswordDialog} style={{display: forgotPassword ? "flex" : "none"}}>
				<div>

					<div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
						<h2>
							{text.forgotPassword}
						</h2>


						<FontAwesomeIcon icon={faClose} style={{cursor: "pointer", fontSize: "18pt"}} onClick={() => setForgotPassword(false)}/>

					</div>

					<hr/>

					<p style={{margin: "0px", marginBottom: 8}}>
						{text.forgotPasswordP}
					</p>

					<Input theme={theme} placeHolder={text.email} type={"email"} value={forgotPasswordEmail} onChange={(e) => {
						setForgetPasswordEmail(e.target.value);
					}}/>

					<Button theme={theme} style={{width: "100%", margin: 0}} onClick={() => {
						if (forgotPasswordEmail.length > 0) {
							forgotPasswordFunction();
						} else {
							NotificationManager.error(text.makeSureFieldsAreNotEmpty, '', 5000, null, null, '');
						}
					}}>
						{text.continue}
					</Button>

				</div>
			</div>

		</div>
	);
}

export default Login;

