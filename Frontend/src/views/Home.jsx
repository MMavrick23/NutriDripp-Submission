import React, {useContext} from 'react';
import {makeStyles} from "@material-ui/styles";
import {ThemeContext} from "../context/ThemeContext";
import image2 from "../images/image-3.jpg"
import {Button} from "../StyledComponents";
import {LangContext} from "../context/LangContext";
import {adminRoot} from "../constants/Values";
import {useNavigate} from "react-router-dom";

function Home(props) {

	const {lang, toggleLang} = useContext(LangContext);

	const navigate = useNavigate()

	const useStyle = makeStyles({
		mainContainer: {

		},

		imageContainer: {

			"& > img": {
				width: "100%",
				height: "calc(100vh - 65px)",
				objectFit: "cover",
				objectPosition: "100%",
				position: "absolute",
				zIndex: -1,
				top: 65,
			},

			"& > div": {
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				height: "100vh"
			},
		},

		callToActions: {

			"& > div": {
				background: theme => theme.theme4 + "b9",
				maxWidth: "50%",
				color: "white",
				display: "flex",
				flexDirection: "column",
				borderRadius: 24,
				padding: 38,

				"& h1": {
					textAlign: "center",
					fontSize: 52,
					margin: 0,

					"@media only screen and (max-width: 992px)": {
						fontSize: 34
					}
				}
			}
		},

		buttonContainer: {
			display: "flex",
			justifyContent: "center",

			"& > button": {
				marginBottom: 0,
				marginEnd: 12,

				"@media only screen and (max-width: 992px)": {
					fontSize: 18
				}

			},

			"@media only screen and (max-width: 992px)": {
				flexDirection: "column"
			}
		}
	});

	const {theme} = useContext(ThemeContext);

	const classes = useStyle(theme);

	const text =
		lang === "ar" ?
			{
				moto: "تركيب نظام ري احترافي",
				signUp: "اشترك الان",
				learnMore: "اعرف اكثر"
			}
			:
			{
				moto: "Professional Irrigation System Installation",
				signUp: "Sign Up Now",
				learnMore: "Learn More"
			};


	return (
		<>
			<div>
				<div className={classes.imageContainer}>
					<img src={image2} alt={""} />
					<div className={classes.callToActions + " container"}>
						<div>
							<div>
								<h1>
									{text.moto}
								</h1>
							</div>

							<div className={classes.buttonContainer}>

								<Button theme={theme} onClick={() => {navigate(adminRoot + "register")}}>
									{text.signUp}
								</Button>

								<Button theme={theme} onClick={() => {navigate(adminRoot + "about")}}>
									{text.learnMore}
								</Button>

							</div>
						</div>
					</div>
				</div>

				<div>
				</div>
			</div>
		</>
	);
}

export default Home;
