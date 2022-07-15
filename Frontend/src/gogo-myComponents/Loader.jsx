import React from 'react';
import {makeStyles} from "@material-ui/styles";

/**
 * simple blocking loading screen
 * @param {boolean} visible
 * @returns {JSX.Element}
 * @constructor
 */
function Loader({visible}) {

	const useStyle = makeStyles({});

	const classes = useStyle();

	return (
		<div style={{display: visible ? "flex" : "none", position: "fixed", zIndex: 9999, top: 0, left: 0, justifyContent: "center", alignItems: "center", background: "#000a", width: "100vw", height: "100vh",}}>
			<div className={"loading"}/>
		</div>
	);
}

export default Loader;
