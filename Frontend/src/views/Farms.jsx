import React, {useContext, useEffect} from 'react';
import background from "./background.png";
import {adminRoot, servicePath} from "../constants/Values";

function Farms(props) {

	useEffect(() => {

		const data = new FormData();
		//authentication
		data.append("Func", "8");
		data.append("Token", "asdjfhasdfjkhasdjk");

		fetch(`${servicePath}Beta/DMan.php`, {
			method: 'POST',
			body: data,
			headers:
				{
					"Accept": "application/json",
				},
		}).then(function (res) {
			return res.json();
		}).then(function (data) {
			console.log(data)
		}).catch(function (error) {
			console.log(data)
		});

	}, []);


	return (
		<div className={"container "} style={{display: "flex", height: "100vh"}}>
			<img src={background} />
			<div style={{position: "absolute", left: 0, top: 0, display: "flex", height: "100vh", width: "100vw", justifyContent: "center", alignItems: "center", backdropFilter: "blur(8px)"}}>
				<img src={"logo/about-logo.svg"} style={{height: "20vh", marginRight: 12}}/>
				<h1 >
					Please connect device first
				</h1>
			</div>
		</div>
	);
}

export default Farms;
