import React from 'react';


function Loading({visible}) {


	return (
		<div style={{display: visible ? "block" : "none"}}>
			Loading
		</div>
	);
}

export default Loading;
