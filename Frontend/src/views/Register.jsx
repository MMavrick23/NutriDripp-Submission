import React, {useContext, useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/styles";
import {ThemeContext} from "../context/ThemeContext";
import Loading from "../components/Loading";
import {Button, Input, P} from "../StyledComponents";
import {NavLink, useNavigate} from "react-router-dom";
import {adminRoot, servicePath} from "../constants/Values";
import {NotificationManager} from "react-notifications";
import {LangContext} from "../context/LangContext";
import {UserContext} from "../context/userContext";
import Select from "react-select";


function Register(props) {

	const {theme} = useContext(ThemeContext);
	const {lang} = useContext(LangContext);
	const {getUserInfo} = useContext(UserContext);

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [userName, setUsername] = useState("");
	const [email, setEmail] = useState("");

	const [password, setPassword] = useState("");

	const [gender, setGender] = useState([]);
	const [genderOptions, setGenderOptions] = useState([]);
	const [language, setLanguage] = useState([]);
	const [languageOptions, setLanguageOptions] = useState([]);


	const [isLoading, setIsLoading] = useState(false);

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
			flexDirection: "column",
			justifyContent: "space-between",
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


	const text =
		lang === "ar" ?
			{
				registerForm: "تسجيل حساب",
				firstName: "الاسم الاول",
				lastName: "الاسم الأخير",
				userName: "اسم المستخدم",
				email: "البريد الإلكتروني",
				password: "كلمه السر",
				passwordAtLeast: "كلمه السر يجب ان تكون علي الأقل 8 أحرف",
				language: "اللغه",
				loginAction: "تسجيل الدخول",
				forgotPassword: "هل نسيت كلمه السر؟",
				createAccount: "إنشاء حساب",
				invalid: "غير صحيح",
				makeSureFieldsAreNotEmpty: "يرجى التأكد من أن الحقول ليست فارغة",
				unknownError: "خطاء غير معروف حاول وقت اخر",
				welcome: "مرحبا",
				continue: "استمر",
				forgotPasswordP: "أدخل عنوان بريدك الإلكتروني وسنرسل إليك تعليمات عبر البريد الإلكتروني حول كيفية إعادة تعيين كلمة المرور الخاصة بك",
				networkError: "حدث خطاء في الإتصال تأكد من اتصالك بالأنترنيت",
				emailSent: "تم إرسال البريد الإلكتروني الخاص بإعادة التعيين",
				emailNotFound: "لا يوجد حساب يطابق تلك المعلومات",
				usernameExist: "اسم المستخدم ",
				emailExist: "Email Exist",
			}
			:
			{
				registerForm: "Register Form",
				firstName: "First Name",
				lastName: "Last Name",
				userName: "Username",
				email: "Email",
				password: "Password",
				passwordAtLeast: "Password must be at least 8 characters",
				language: "Language",
				gender: "Gender",
				loginAction: "Login",
				forgotPassword: "Forgot your password?",
				createAccount: "Create Account",
				invalid: "Invalid",
				makeSureFieldsAreNotEmpty: "Please make sure that the fields are not empty",
				unknownError: "Unknown issue happened try again later",
				welcome: "Welcome",
				continue: "Continue",
				networkError: "A connection error occurred. Make sure you are connected to the Internet",
				usernameExist: "Username Exist",
				emailExist: "Email Exist",
			};
	const classes = useStyle(theme);

	useEffect(() => {
		var formdata = new FormData();
		formdata.append("Func", "1");
		formdata.append("Language", localStorage.getItem("lang") == 1 ? "2" : "1");

		var requestOptions = {
			method: 'POST',
			body: formdata,
			redirect: 'follow',
		};

		fetch(servicePath + "Beta/General.php", requestOptions)
			.then(response => response.json())
			.then(result => {
				if (result.ReturnCode === 1) {
					setLanguageOptions(result.Payload.reduce((acc, curr) => {
						return [...acc, {label: curr.Code + " " + curr.Name, value: curr.ID, key: curr.ID}];
					}, []));
				} else {
					NotificationManager.error(text.networkError, '', 5000, null, null, '');
				}

			})
			.catch(error => console.log('error', error));

		formdata = new FormData();
		formdata.append("Func", "2");
		formdata.append("Language", localStorage.getItem("lang") == 1 ? "2" : "1");

		var requestOptions = {
			method: 'POST',
			body: formdata,
			redirect: 'follow',
		};

		fetch(servicePath + "Beta/General.php", requestOptions)
			.then(response => response.json())
			.then(result => {
				if (result.ReturnCode === 1) {
					setGenderOptions(result.Payload.reduce((acc, curr) => {
						return [...acc, {label: curr.Title, value: curr.ID, key: curr.ID}];
					}, []));
				} else {
					NotificationManager.error(text.networkError, '', 5000, null, null, '');
				}

			})
			.catch(error => console.log('error', error));

	}, [text.networkError, lang]);

	const selectCustomStyles = {

		option: (provided, state) => ({
			...provided,
			color: state.isSelected ? "#fff" : theme.theme3,
		}),

		control: (provided, state) => ({
			...provided,
			boxShadow: "none",
			borderColor: state.isFocused ? theme.theme3 + "!important" : theme.theme6 + "!important",
			// borderColor: "red!important"
		}),
	};

	function register(e) {
		e.preventDefault();

		if (password.length < 8){
			NotificationManager.error(text.passwordAtLeast, '', 5000, null, null, '');
			return;
		}

		if (firstName && lastName && userName && email && password && gender && language) {

			setIsLoading(true);

			const data = new FormData();
			//authentication
			data.append("Func", "1");
			data.append("FName", firstName);
			data.append("LName", lastName);
			data.append("UName", userName);
			data.append("Mail", email);
			data.append("Pass", password);
			data.append("Gender", gender.value);
			data.append("Language", language.value);

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
						break;
					case -1:
						setIsLoading(false);
						NotificationManager.error(text.networkError, '', 5000, null, null, '');
						break;
					case -2:
					case -5:
						NotificationManager.error(text.invalid + " " + data.ReturnParam, '', 5000, null, null, '');
						break;
					case -3:
						NotificationManager.error(text.usernameExist, '', 5000, null, null, '');
						break;
					case -4:
						NotificationManager.error(text.emailExist, '', 5000, null, null, '');
						break;
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

	return (
		<div className={"container"}>

			<Loading visible={isLoading}/>

			<form className={classes.mainContainer} onSubmit={register}>

				<h1>
					{text.registerForm}
				</h1>

				<div className={classes.Inputs}>

					<Input theme={theme} placeHolder={text.firstName} onChange={(e) => setFirstName(e.target.value)} value={firstName} required/>

					<Input theme={theme} placeHolder={text.lastName} onChange={(e) => setLastName(e.target.value)} value={lastName} required/>

					<Input theme={theme} placeHolder={text.userName} onChange={(e) => setUsername(e.target.value)} value={userName} required/>

					<Input theme={theme} placeHolder={text.email} onChange={(e) => setEmail(e.target.value)} value={email} type={"email"} required/>

					<Input theme={theme} placeHolder={text.password} onChange={(e) => setPassword(e.target.value)} value={password} type={"password"} required/>

					<Select styles={selectCustomStyles} placeholder={text.language} options={languageOptions} value={language} onChange={(x) => {
						setLanguage(x);
					}}/>

					<Select styles={selectCustomStyles} placeholder={text.gender} options={genderOptions} value={gender} onChange={(x) => {
						setGender(x);
					}}/>

				</div>

				<div style={{marginInlineStart: "auto"}}>

					<Button theme={theme} onClick={() => navigate({pathname: adminRoot + "login"})} type={'reset'} link={true}>
						{text.loginAction}
					</Button>

					<Button theme={theme} type={'submit'} onClick={register}>
						{text.createAccount}
					</Button>

				</div>

			</form>

		</div>
	);
}

export default Register;
