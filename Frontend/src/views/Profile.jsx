import React, {useContext, useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/styles";
import {ThemeContext} from "../context/ThemeContext";
import {UserContext} from "../context/userContext";
import {LangContext} from "../context/LangContext";
import {Button, Input, TextArea} from "../StyledComponents";
import Select from "react-select";
import {adminRoot, servicePath} from "../constants/Values";
import {NotificationManager} from "react-notifications";
import Loading from "../components/Loading";
import defaultUserImage from '../logo/user-solid.svg';


function Profile(props) {

	const {userInfo, getUserInfo} = useContext(UserContext);

	const {theme} = useContext(ThemeContext);
	const {lang} = useContext(LangContext);

	const [isLoading, setIsLoading] = useState(false);

	//Input states
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [gender, setGender] = useState("");
	const [country, setCountry] = useState("");
	const [timezone, setTimeZone] = useState("");
	const [language, setLanguage] = useState("");
	const [phone, setPhone] = useState("");
	const [address, setAddress] = useState("");

	const [oldPassword, setOldPassword] = useState("")

	const [newPassword, setNewPassword] = useState("")
	const [reNewPassword, setReNewPassword] = useState("")

	const [timeZones, setTimeZones] = useState([]);
	const [countries, setCountries] = useState([]);
	const [genders, setGenders] = useState([]);
	const [languages, setLanguages] = useState([]);


	const useStyle = makeStyles({

		choosePicModal: {
			position: "fixed",
			width: "100%",
			height: "100%",
			top: 0,
			left: 0,
			background: "#000000ae",
			zIndex: 9999,
			alignItems: "center",
			justifyContent: "center",

			"& > div": {
				width: "min(600px, 60%)",
				display: "flex",
				flexDirection: "column",
				height: "70%",
				gap: 12,
				padding: 24,
				background: theme => theme.backgroundColor,

				"& h1": {
					padding: 0,
					margin: 0,
				},

				"& div:nth-of-type(1)": {
					display: "grid",
					gridTemplateColumns: "1fr 1fr 1fr",
					overflowY: "scroll",
					padding: 4,

					"& img": {
						padding: 16,
					},
				},

			},
		},

		choosePicModalButtons: {
			display: "flex",
			justifyContent: "flex-end",
		},

		userMenu: {
			display: "flex",
			position: "absolute",
			background: theme => theme.backgroundColor,
			boxSizing: "border-box",
			boxShadow: theme => theme.boxShadow2,
			flexDirection: "column",
			width: 180,
			bottom: -65,
			zIndex: 99,
			borderBottomRightRadius: 12,
			borderBottomLeftRadius: 12,


			"&::before": {
				content: "''",
				width: "100%",
				height: "100%",
				position: 'absolute',
				background: theme => theme.elevation4,
				pointerEvents: "none",
				zIndex: theme => theme.name === "dark" ? 2 : -1,
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

		aboutMeOuter: {
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			background: theme => theme.elevation2,
			paddingInlineStart: 24,
			paddingInlineEnd: 24,
			borderRadius: 12,
			maxWidth: 750,
			margin: "0 auto",

			"& img": {

				width: 133,
				height: 133,
				borderRadius: 100,
				alignSelf: 'center',
				padding: 5,
				border: theme => `${theme.theme1} 4px solid`,
				margin: "25px auto",
				transition: "transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
				cursor: "pointer",

			},

			"& img:hover": {
				transform: "scale(1.2)",
			},


			"& > button": {
				width: "100%",
			},

		},

		aboutMeInner: {
			display: "grid",
			width: "100%",
			gridTemplateColumns: "repeat(auto-fit, minmax(45%, auto))",
			gap: 12,
			marginBottom: 24,

			"& > input": {
				boxSizing: "border-box",
				height: 50,
				padding: 12,
			},
		},

		mainContainer: {
			marginBottom: 48,

			"& h1": {
				textAlign: "center",
				color: theme => theme.theme3,
			},
		},

	});

	const classes = useStyle(theme);

	const text =
		lang === "ar" ?
			{
				english: "English",
				aboutMe: "مَلفى الشخصي",
				arabic: "عربي",
				choosePic: "اختر الصوره",
				uploadPic: "ارفع الصوره",
				save: "حفظ",
				chosePic: "أختر صوره",
				incompleteData: "برجاء ملء البيانات المطلوبه",

				makeSureFieldsAreNotEmpty: "يرجى التأكد من أن الحقول ليست فارغة",

				oldPassword: "كلمه المرور الحاليه",

				password: "كلمه السر",
				RePassword: "تكرار كلمه السر",

				passwordAtLeast: "كلمه السر يجب ان تكون علي الأقل 8 أحرف",

				passwordMustMatch: "يجب ان تطابق كلمه المرور",

				email: "البريد الإلكتروني",
				firstName: "الأسم الاول",
				lastName: "الأسم الأخير",
				phone: "الهاتف",
				address: "العنوان",

				changePassword: "تغير كلمه السر",

				wrongPassword: "كلمه السر الحاليه خطأ",

				done: "تم تغير كلمه السر"
			}
			:
			{
				english: "English",
				aboutMe: "My Profile",
				arabic: "عربي",
				choosePic: "Choose Picture",
				uploadPic: "Upload Picture",
				save: "Save",
				chosePic: "Choose a picture",
				incompleteData: "Please fill in required fields",

				makeSureFieldsAreNotEmpty: "Please make sure that the fields are not empty",

				oldPassword: "Current Password",

				password: "Password",
				RePassword: "Repeat Password",

				passwordAtLeast: "Password must be at least 8 characters",

				passwordMustMatch: "Password must match",

				email: "Email",
				firstName: "First Name",
				lastName: "Last Name",
				phone: "Phone",
				address: "Address",

				changePassword: "Change Password",

				wrongPassword: "Current password is invalid",

				done: "Password changed"
			};

	const [userProfilePic, setUserProfilePic] = useState("");

	useEffect(() => {
		if (userInfo) {
			setFirstName(userInfo.FName);
			setLastName(userInfo.LName);
			setUsername(userInfo.UName);
			setEmail(userInfo.Mail);

			let localCountry = countries.find((x) => x.ID == userInfo.Country);
			localCountry && setCountry({
				key: localCountry.ID,
				value: localCountry.ID,
				label: localCountry.Name,
			});

			let localTimezone = timeZones.find((x) => x.ID == userInfo.Timezone);
			localTimezone && setTimeZone({
				key: localTimezone.ID,
				value: localTimezone.ID,
				label: localTimezone.Name,
			});

			let localLang = languages.find((x) => x.ID == userInfo.Language);
			localLang && setLanguage({
				key: localLang.ID,
				value: localLang.ID,
				label: localLang.Code + " " + localLang.Name,
			});

			let localGender = genders.find((x) => x.ID == userInfo.Gender);
			localGender && setGender({
				key: localGender.ID,
				value: localGender.ID,
				label: localGender.Title,
			});

			setPhone(userInfo.Phone);
			setAddress(userInfo.Address);
		}
	}, [userInfo, timeZones, countries, languages, genders]);

	useEffect(() => {

		function getCountires() {
			let formdata = new FormData();
			formdata.append("Func", "0");
			formdata.append("Language", localStorage.getItem("lang") == 1 ? "2" : "1");

			let requestOptions = {
				method: 'POST',
				body: formdata,
				redirect: 'follow',
			};

			fetch(servicePath + "Beta/General.php", requestOptions)
				.then(response => response.json())
				.then(result => {
					setCountries(result.Payload);
					getTimeZones();
				})
				.catch(error => console.log('error', error));
		}

		function getTimeZones() {
			let formdata = new FormData();
			formdata.append("Func", "3");
			formdata.append("Language", localStorage.getItem("lang") == 1 ? "2" : "1");

			let requestOptions = {
				method: 'POST',
				body: formdata,
				redirect: 'follow',
			};

			fetch(servicePath + "Beta/General.php", requestOptions)
				.then(response => response.json())
				.then(result => {
					setTimeZones(result.Payload);
					getLanguages();
				})
				.catch(error => console.log('error', error));
		}

		function getLanguages() {

			let formdata = new FormData();
			formdata.append("Func", "1");
			formdata.append("Language", localStorage.getItem("lang") == 1 ? "2" : "1");

			let requestOptions = {
				method: 'POST',
				body: formdata,
				redirect: 'follow',
			};

			fetch(servicePath + "Beta/General.php", requestOptions)
				.then(response => response.json())
				.then(result => {
					setLanguages(result.Payload);
					getGenders();
				})
				.catch(error => console.log('error', error));
		}

		function getGenders() {

			let formdata = new FormData();
			formdata.append("Func", "2");
			formdata.append("Language", localStorage.getItem("lang") == 1 ? "2" : "1");

			let requestOptions = {
				method: 'POST',
				body: formdata,
				redirect: 'follow',
			};

			fetch(servicePath + "Beta/General.php", requestOptions)
				.then(response => response.json())
				.then(result => {
					setGenders(result.Payload);
				})
				.catch(error => console.log('error', error));
		}


		getCountires();

	}, [lang]);

	const customStyles = {
		menu: (provided, state) => ({
			...provided,
			padding: 4,
			backgroundColor: theme.backgroundColor,

		}),

		option: (provided, state) => {
			return ({
				...provided,
				backgroundColor: state.isSelected ? theme.theme1 : state.isFocused ? theme.theme2 : "transparent",
				color: state.isFocused ? '#000' : theme.fontColor,
				padding: 8,
			});
		},

		control: (_, {selectProps: {width}}) => ({
			..._,
			border: 'none',
			backgroundColor: theme.backgroundColor,
			fontFamily: "'Poppins', sans-serif",
			height: 44,
			outline: 'none',
			boxShadow: "none",

		}),

		placeholder: (_) => ({
			..._,
			color: '#686868',
			fontSize: 15,
		}),

		singleValue: (_) => ({
			..._,
			color: theme.fontColor,
		}),

	};

	function updateProfile(e) {
		e.preventDefault();

		if (!firstName || !lastName || !email || !gender.value || !language.value || !timezone.value || !country.value) {
			NotificationManager.error("", text.incompleteData, 5000, null, null, '');
			return;
		}

		let jwt = localStorage.getItem('token');

		if (jwt) {

			setIsLoading(true);

			const data = new FormData();
			//authentication
			data.append("Token", jwt);
			data.append("Func", "4");

			data.append("FName", firstName);
			data.append("LName", lastName);
			data.append("Mail", email);
			data.append("Gender", gender.value);
			data.append("Country", country.value);
			data.append("Timezone", timezone.value);
			data.append("Language", language.value);
			if (phone) {
				data.append("Phone", phone);
			}

			if (address) {
				data.append("Address", address);
			}


			if (typeof userProfilePic !== 'string') {
				let formdata = new FormData();
				formdata.append("Func", "6");
				formdata.append("Token", jwt);
				formdata.append("Image", userProfilePic, userProfilePic.name);

				let requestOptions = {
					method: 'POST',
					body: formdata,
					redirect: 'follow',
				};

				fetch(servicePath + "Beta/UMan.php", requestOptions)
					.then(response => response.json())
					.then(result => console.log(result))
					.catch(error => console.log('error', error));
			}

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
				if (data.ReturnCode === 1) {
					setIsLoading(false);
					getUserInfo();
				} else {
					setIsLoading(false);
				}
			}).catch(function (error) {
				setIsLoading(false);
				NotificationManager.error("حدث خطاء في الإتصال تأكد من اتصالك بالأنترنيت", 'خظاء في الإتصال', 5000, null, null, '');
			});

		}

	}

	function changePassword(e) {
		e.preventDefault();

		if (!oldPassword || !newPassword || !reNewPassword) {
			NotificationManager.error(text.makeSureFieldsAreNotEmpty, '', 5000, null, null, '');
			return
		}

		if (newPassword.length < 8) {
			NotificationManager.error(text.passwordAtLeast, '', 5000, null, null, '');
			return;
		}

		if (newPassword !== reNewPassword){
			NotificationManager.error(text.passwordMustMatch, '', 5000, null, null, '');
			return;
		}


		setIsLoading(true);

		const data = new FormData();
		//authentication
		data.append("Func", "5");
		data.append("Token", localStorage.getItem("token"));
		data.append("Pass", newPassword);
		data.append("OldPass", oldPassword);


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
				NotificationManager.success('', text.done, 5000, null, null, '');
			} else if (data.ReturnCode === -4){
				NotificationManager.error('', text.wrongPassword, 5000, null, null, '');
			} else {
				NotificationManager.error('', text.networkError, 5000, null, null, '');
			}
		}).catch(function (error) {
			setIsLoading(false);
			NotificationManager.error(text.networkError, '', 5000, null, null, '');
		});


	}

	return (
		<div className={classes.mainContainer + " container"}>

			<Loading visible={isLoading}/>

			<h1>
				{text.aboutMe}
			</h1>

			{userInfo &&
				<div className={classes.aboutMeOuter}>

					<div onClick={() => {
					}
					}>
						<div style={{position: "relative"}}>
							<label htmlFor={"ppuploadinput2"}>

								<input type="file" value=""
									   onChange={(e) => {
										   setUserProfilePic(e.currentTarget.files[0]);
									   }
									   } accept=".gif,.jpg,.jpeg,.png,.bmp" id="ppuploadinput2" style={{
									position: "absolute",
									width: 1,
									height: 1,
									padding: 0,
									overflow: "hidden",
									clip: "rect(0, 0, 0, 0)",
									whiteSpace: "nowrap",
									border: 0,
								}}/>

								<div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
									{
										userProfilePic ?
											<img src={URL.createObjectURL(userProfilePic)} alt={""}/>
											:
											userInfo.PictureLink ? <img src={userInfo.PictureLink}/> :
												<img src={defaultUserImage}/>
									}

									<span style={{
										color: theme.theme1,
										fontSize: 28,
										marginBottom: 8,
										fontWeight: 700,
										position: "relative",
										top: -12,
									}} onClick={(e) => {
										e.preventDefault();
									}
									}>
										{username}
								</span>
								</div>

							</label>

						</div>
					</div>


					<div className={classes.aboutMeInner}>

						<Input theme={theme} placeholder={text.firstName} value={firstName} onChange={(e) => {
							setFirstName(e.target.value);
						}}/>
						<Input theme={theme} placeholder={text.lastName} value={lastName} onChange={(e) => {
							setLastName(e.target.value);
						}}/>

						<Input theme={theme} placeholder={text.email} value={email} onChange={(e) => {
							setEmail(e.target.value);
						}}/>


						<Select
							options={genders?.reduce((acc, x) => {
								return [...acc, {key: x.ID, value: x.ID, label: x.Title}];
							}, [])}
							styles={customStyles}
							value={gender}
							onChange={(e) => {
								setGender(e);
							}}
						/>


						<Select
							options={languages?.reduce((acc, x) => {
								return [...acc, {key: x.ID, value: x.ID, label: x.Code + " " + x.Name}];
							}, [])}
							placeholder={text.language}
							styles={customStyles}
							value={language}
							onChange={(e) => {
								setLanguage(e);
							}}
						/>


						<Select
							options={countries?.reduce((acc, x) => {
								return [...acc, {key: x.ID, value: x.ID, label: x.Name}];
							}, [])}
							styles={customStyles}
							value={country}
							onChange={(e) => {
								setCountry(e);
							}}
						/>

						<Select
							options={timeZones?.reduce((acc, x) => {
								return [...acc, {key: x.ID, value: x.ID, label: x.Name}];
							}, [])}
							styles={customStyles}
							value={timezone}
							onChange={(e) => {
								setTimeZone(e);
							}}
						/>


						<Input theme={theme} placeholder={text.phone} value={phone} onChange={(e) => {
							setPhone(e.target.value);
						}}/>

						<TextArea theme={theme} value={address} onChange={(e) => {
							setAddress(e.target.value);
						}} style={{gridColumnStart: 1, gridColumnEnd: 3}} placeholder={text.address} rows={4}>

						</TextArea>

					</div>


					<Button theme={theme} onClick={updateProfile}>
						{text.save}
					</Button>

				</div>


			}

			<h1>
				{text.changePassword}
			</h1>

			{userInfo &&

				<div className={classes.aboutMeOuter}>

					<br/>

					<div className={classes.aboutMeInner}>

						<Input theme={theme} placeholder={text.oldPassword} value={oldPassword}
							   type={"password"}
							   style={{gridColumnStart: 1, gridColumnEnd: 3}}
							   onChange={(e) => {
								   setOldPassword(e.target.value);
							   }}/>

						<Input theme={theme} type={"password"} placeholder={text.password} value={newPassword} onChange={(e) => {
							setNewPassword(e.target.value);
						}}/>

						<Input theme={theme} type={"password"} placeholder={text.RePassword} value={reNewPassword} onChange={(e) => {
							setReNewPassword(e.target.value);
						}}/>
					</div>


					<Button theme={theme} onClick={changePassword}>
						{text.save}
					</Button>
				</div>
			}

		</div>
	);
}

export default Profile;
