import React, {useState} from 'react';
import TooltipItem from "../components/common/TooltipItem";
import {Tooltip} from "reactstrap";

/**
 * Image that works in tables with cool hover effect
 * @param {number} id - unique identifier
 * @param {string} link - image link
 * @returns {JSX.Element}
 * @constructor
 */
function TableImage({id, link}) {

    const [tooltipOpen, setTooltipOpen] = useState(false);

    return (
        <div key={id}>
            <div style={{display: 'flex', justifyContent: "center", padding: 0}}>
                <img id={"tooltip_" + id} style={{maxWidth: 150, height: 24, cursor: "pointer"}} alt={""} onClick={() => {
                    window.open(link)
                }} src={link}/>

            </div>

            <Tooltip
                placement={"right"}
                isOpen={tooltipOpen}
                target={`tooltip_${id}`}
                toggle={() => setTooltipOpen(!tooltipOpen)}
            >

                <img style={{maxWidth: 150, height: 150, cursor: "pointer"}} alt={""} src={link}/>

            </Tooltip>
        </div>

    );
}

export default TableImage;
