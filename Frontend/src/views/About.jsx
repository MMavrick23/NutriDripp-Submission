import React, {useContext} from 'react';
import {makeStyles} from "@material-ui/styles";
import {ThemeContext} from "../context/ThemeContext";
import aboutLogo from "../logo/about-logo.svg";
import {LangContext} from "../context/LangContext";

function About(props) {

	const useStyle = makeStyles({
		outerContainer: {
			"& h1": {
				fontSize: "2.4rem",
				color: theme => theme.theme3,
			},

			"& p": {
				fontSize: "1.4rem",
			},
		},

		aboutArea: {
			display: "flex",
			alignItems: "center",
			paddingTop: 64,

			"& > *": {

				"@media screen and (min-width: 992px)": {
					maxWidth: "50%",
				},
			},


			"& img": {
				maxHeight: 400,
				objectFit: "contain",
				width: "100%",

				"@media screen and (max-width: 992px)": {
					display: "none",
					width: 0,
				},
			},

		},

		missionVision: {
			paddingTop: 64,
			paddingBottom: 64,
			display: "flex",
			gap: 32,

			"@media screen and (max-width: 768px)": {
				flexDirection: "column",
			},
		},
	});

	const {theme} = useContext(ThemeContext);

	const classes = useStyle(theme);

	const {lang, toggleLang} = useContext(LangContext);

	const text =
		lang === "ar" ?
			{
				header: "عن NutriDripp",
				paragraph: `NutriDripp هو حل إدارة متعدد الأغراض للمزارع والحدائق والمناظر الطبيعية وجميع أنواع
الاستخدام الزراعي: سيتم استخدام النظام لإدارة و
مراقب
الري والتغذية وأوضاع المنطقة الزراعية. مبدأ البناء الرئيسي
ال
النظام هو قابلية التوسع وسهولة الاستخدام والتركيب ، مما يجعله مثاليًا لمختلف المستخدمين
أنواع
من التطبيقات.
				`,
				vision: `الرؤية`,
				visionP: `
				محصول زراعي عالي الغلة ، تدار و تروى بشكل كامل بأنظمة آلية ، ب
تصحيح الأخطاء العالية والمراقبة الصحية.
				`,
				mission: `المهمة`,
				missionP: `
توفير بيئة زراعية أسهل وأكثر أمانًا ويمكن التحكم فيها بشكل أكبر من خلال توفير الري
وأنظمة التغذية الأوتوماتيكية.				
				`
			}
			:
			{
				header: "About NutriDripp",
				paragraph: `NutriDripp is a multipurpose management solution for farms, gardens, landscapes and all kinds of
				agricultural usage.The system will be used to both manually and automatically manage and
				monitor
				the irrigation, nutrition and statuses of the agricultural zone. The main building principle of
				the
				system is its scalability and easiness of usage and installation, making it ideal for various
				kinds
				of applications.
				`,
				vision: `Vision`,
				visionP: `A high yielding agricultural crops, managed and irrigated completely by automatic systems, with high error correction and health monitoring.`,
				mission: `Mission`,
				missionP: `Providing an easier, safer and more controllable agricultural environment by creating irrigation and nutrition automatic systems.`
			};

	return (
		<div className={"container " + classes.outerContainer}>

			<div className={classes.aboutArea}>

				<div>
					<h1>
						{text.header}
					</h1>

					<p>
						{text.paragraph}
					</p>
				</div>

				<img src={aboutLogo}/>

			</div>

			<div className={classes.missionVision}>
				<div>
					<h1>
						{text.vision}
					</h1>
					<p>
						{text.visionP}
					</p>
				</div>

				<div>
					<h1>
						{text.mission}
					</h1>
					<p>
						{text.missionP}
					</p>
				</div>
			</div>

		</div>
	);
}

export default About;
