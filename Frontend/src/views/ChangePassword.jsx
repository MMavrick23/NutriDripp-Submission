import React, {useContext, useEffect, useRef, useState} from 'react';

import {makeStyles} from "@material-ui/styles";
import {ThemeContext} from "../context/ThemeContext";
import {LangContext} from "../context/LangContext";
import {Button, Input, P} from "../StyledComponents";
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import {adminRoot, servicePath} from "../constants/Values";
import Loading from "../components/Loading";
import {UserContext} from "../context/userContext";
import {NavLink, useNavigate, useSearchParams} from "react-router-dom";

function ChangePassword(props) {

	const {theme} = useContext(ThemeContext);
	const {lang} = useContext(LangContext);

	const [passwordInput, setPasswordInput] = useState("");
	const [RePasswordInput, setRePasswordInput] = useState("");

	const [isLoading, setIsLoading] = useState(false);

	const [searchParams, setSearchParams] = useSearchParams();

	const navigate = useNavigate();

	const useStyle = makeStyles({
		mainContainer: {
			display: "flex",
			flexDirection: "column",
			background: theme => theme.elevation2,
			borderRadius: 12,
			padding: 24,
			marginTop: 64,
			marginBottom: 64,
			maxWidth: 450,
			margin: "0 auto",
			gap: 18,
			border: "1px solid #cccccc",
			boxShadow: "2px 2px 5px #0006",

			"& > h1": {
				margin: 0,
				padding: 0,

				marginBottom: 12,
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
				transition: "transform 300ms",
			},

			"& input:focus": {
				transform: "scale(1.01)",
			},

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
				resetForm: "إعادة تعيين كلمة المرور",
				password: "كلمه السر",
				RePassword: "تكرار كلمه السر",
				makeSureFieldsAreNotEmpty: "يرجى التأكد من أن الحقول ليست فارغة",
				unknownError: "خطاء غير معروف حاول وقت اخر",
				networkError: "حدث خطاء في الإتصال تأكد من اتصالك بالأنترنيت",
				emailSent: "تم إرسال البريد الإلكتروني الخاص بإعادة التعيين",
				save: "حفظ",
				passwordAtLeast: "كلمه السر يجب ان تكون علي الأقل 8 أحرف",
				done: "تم",
				passwordMustMatch: "يجب ان تطابق كلمه المرور",
				invalidOrExpiredToken: "الجلسة غير صالحة أو منتهية الصلاحية.",
			}
			:
			{
				resetForm: "Reset Password",
				password: "Password",
				RePassword: "Repeat Password",
				makeSureFieldsAreNotEmpty: "Please make sure that the fields are not empty",
				unknownError: "Unknown issue happened try again later",
				networkError: "A connection error occurred. Make sure you are connected to the Internet",
				emailNotFound: "No account match that information",
				invalidOrExpiredToken: "Invalid or expired session.",
				save: "Save",
				passwordAtLeast: "Password must be at least 8 characters",
				passwordMustMatch: "Password must match",
				done: "Done"
			};


	function resetPassword(e) {
		e.preventDefault();

		if (!passwordInput || !RePasswordInput) {
			NotificationManager.error(text.makeSureFieldsAreNotEmpty, '', 5000, null, null, '');
			return
		}


		if (passwordInput.length < 8) {
			NotificationManager.error(text.passwordAtLeast, '', 5000, null, null, '');
			return;
		}

		if (passwordInput !== RePasswordInput){
			NotificationManager.error(text.passwordMustMatch, '', 5000, null, null, '');
			return;
		}


		setIsLoading(true);

		const data = new FormData();
		//authentication
		data.append("Func", "8");
		data.append("Pass", passwordInput);
		data.append("Token", searchParams.get("token"));

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
			if (data.ReturnCode === 1){
				NotificationManager.success(text.done, '', 5000, null, null, '');
				navigate(adminRoot + "login")
			} else {
				NotificationManager.error(text.networkError, '', 5000, null, null, '');
			}
		}).catch(function (error) {
			setIsLoading(false);
			NotificationManager.error(text.networkError, '', 5000, null, null, '');
		});


	}


	useEffect(() => {

		setIsLoading(true);

		const data = new FormData();
		//authentication
		data.append("Func", "8");
		data.append("Pass", "tokVal");
		data.append("Token", searchParams.get("token"));

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
			setIsLoading(false)
			if (data.ReturnCode !== 1) {
				NotificationManager.error(text.invalidOrExpiredToken, '', 5000, null, null, '');
				navigate(adminRoot + "home")
			}
		}).catch(function (error) {
			setIsLoading(false);
			navigate(adminRoot + "home")
			NotificationManager.error(text.networkError, '', 5000, null, null, '');
		});

	}, [navigate, searchParams, text.networkError]);

	useEffect(() => {
		if (localStorage.getItem('token')){
			navigate(adminRoot)
		}
	}, [navigate])


	return (
		<div className={"container"}>

			<Loading visible={isLoading}/>

			<form className={classes.mainContainer} onSubmit={resetPassword}>

				<h1>
					{text.resetForm}
				</h1>

				<div className={classes.Inputs} style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
				}}>

					<Input theme={theme} type="password" placeHolder={text.password} onChange={(e) => setPasswordInput(e.target.value)} value={passwordInput}/>

					<Input theme={theme} type="password" placeHolder={text.RePassword} onChange={(e) => setRePasswordInput(e.target.value)} value={RePasswordInput}/>

				</div>


				<div style={{marginInlineStart: "auto"}}>

					<Button theme={theme} onClick={resetPassword} type={'submit'}>
						{text.save}
					</Button>

				</div>

			</form>

		</div>
	);
}

export default ChangePassword;

