import {cloneElement, useContext, useEffect, useState} from "react";
import {InstallPwaContext} from "./context/InstallPwaContext";

/**
 * accepted child node and displays it as a button for installing the app
 * @param props
 * @returns {React.DetailedReactHTMLElement<{onClick: onClick, alt: string, id: string, "aria-label": string}, HTMLElement>|null}
 * @constructor
 */


const InstallPWA = (props) => {

    const {supportsPWA, promptInstall} = useContext(InstallPwaContext);

    const onClick = evt => {
        evt.preventDefault();

        if (!promptInstall) {
            return;
        }

        promptInstall.prompt();
    };

    if (!supportsPWA) {
        return null;
    }

    return (
        cloneElement(props.children, {onClick: onClick, id: "setup_button", "aria-label": "Install app", alt: "Install App"})
    );
};

export default InstallPWA;
