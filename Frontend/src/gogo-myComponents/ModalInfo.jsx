import React from 'react';
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";

/**
 * in the middle of the screen blocking modal containing table
 * @param {string} info - json data of the table
 * @param {string} header - table header shown on the top
 * @param {boolean} isOpen - if the modal is open
 * @param {function(boolean)} setIsOpen - changes the open state of the modal
 * @param {boolean} [rtl] - if the website is right to left
 * @returns {JSX.Element}
 * @constructor
 */
function ModalInfo({info, header, isOpen, setIsOpen, rtl}) {
	return (
		<Modal isOpen={isOpen} size="xl" toggle={() => setIsOpen(!isOpen)}>
			<ModalHeader>
				{header}
			</ModalHeader>

			<ModalBody>
				<p style={{whiteSpace: "pre-line"}} >
					{info}
				</p>
			</ModalBody>
			<ModalFooter>

				<Button
					color="secondary"
					onClick={() => setIsOpen(false)}
				>
					Close
				</Button>
			</ModalFooter>
		</Modal>
	);
}

export default ModalInfo;

