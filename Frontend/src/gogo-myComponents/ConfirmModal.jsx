import React from 'react';
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";

/**
 * Displays confirmation modal if accepted performs an action given to the function usually used on critical actions for example deleting an entry
 * @param {string} header - the header of the dialog
 * @param {function} action - what action function should be called if done button clicked
 * @param {boolean} isOpen - if the dialog should be visible
 * @param {function(boolean)} setIsOpen - function to change the open value so the close buttons hides the dialog
 * @param {boolean} [rtl] - if the dialog in arabic right to left
 * @param {array} [actionParams] - optional if the action function has parameters
 * @returns {JSX.Element}
 * @constructor
 */
function ConfirmModal({header, action, isOpen, setIsOpen, rtl, actionParams}) {
	return (
		<Modal isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
			<ModalHeader>
				{header}
			</ModalHeader>
			<ModalFooter>

				<Button
					color="secondary"
					onClick={() => setIsOpen(false)}
				>
					{rtl ? "إلغاء" : "Close"}
				</Button>

				<Button
					color="primary"
					onClick={() => {
						action.apply(this, actionParams ? actionParams : []);
						setIsOpen(false);
					}
					}
				>
					{rtl ? "تم" : "Done"}
				</Button>
			</ModalFooter>
		</Modal>
	);
}

export default ConfirmModal;
