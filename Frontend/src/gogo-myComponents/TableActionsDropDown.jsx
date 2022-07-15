import React, {useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/styles";
import {ButtonDropdown, CustomInput, Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
import {InvisibleDropdownToggle} from "./helpers/InvisibleDropdownToggle";
import {ThemeColors} from "../helpers/ThemeColors";
import ConfirmModal from "./ConfirmModal";

/**
 * @typedef {Object} Action
 * @property {string} name
 * @property {array<action>} [sub]
 * @property {function} [onclick]
 * @property {array<string>} [params]
 * @property {boolean} [areYouSure]
 */

/**
 * it's responsible for handling actions and nested actions
 * @param {array<Action>} actions - list of actions to be performed on the checked items
 * @param {array<number>} checkedList - the list of checked items to perform actions
 * @param {array} filteredList - array of table items filtered
 * @param {function} setCheckedList - setting selected items so when the user clicks select all
 * @param {boolean} [rtl] - optional right to left
 * @returns {JSX.Element}
 * @constructor
 */
function TableActionsDropDown({actions, checkedList, filteredList, setCheckedList, rtl}) {

	const useStyle = makeStyles({});

	const classes = useStyle();

	const [dropdownSplitOpen, setDropdownSplitOpen] = useState(false);

	const [subsDropDowns, setSubsDropDowns] = useState([]);

	const [confirmModal, setConfirmModal] = useState(false);
	const [ConformModalHeader, setConfirmModalHeader] = useState("");
	const [ConformModalAction, setConfirmModalAction] = useState(() => {
	});
	const [confirmModalParams, setConfirmModalParams] = useState([]);


	const handleChangeSelectAll = () => {
		if (checkedList.length >= filteredList.length) {
			setCheckedList([]);
		} else {
			setCheckedList(filteredList.map((x) => x.id));
		}
	};

	return (
		<div>

			<ConfirmModal isOpen={confirmModal} setIsOpen={setConfirmModal} header={ConformModalHeader} action={ConformModalAction} actionParams={confirmModalParams} rtl/>

			<ButtonDropdown
				isOpen={dropdownSplitOpen}
				toggle={() => setDropdownSplitOpen(!dropdownSplitOpen)}>

				<div className={`btn btn-primary btn-lg check-button check-all ${rtl ? "pr-2 pl-0" : "pr-0 pl-4"}`}>
					<CustomInput
						className="custom-checkbox mb-0 d-inline-block"
						type="checkbox"
						id="checkAll"
						checked={checkedList.length >= filteredList.length}
						onClick={() => handleChangeSelectAll()}
						label={
							<span
								className={`custom-control-label ${
									checkedList.length > 0 &&
									checkedList.length < filteredList.length
										? 'indeterminate'
										: ''
								}`}
							/>
						}
					/>
				</div>

				<DropdownToggle
					caret
					color="primary"
					className="dropdown-toggle-split btn-lg"
				/>

				<DropdownMenu right>
					{actions.map((action, index) => {
						return action.subs ?
							<DropdownItem toggle={false} onMouseOver={() => {
								let newArr = [...subsDropDowns];
								newArr[index] = true;
								setSubsDropDowns(newArr);
							}} onMouseLeave={() => {
								let newArr = [...subsDropDowns];
								newArr[index] = false;
								setSubsDropDowns(newArr);
							}} onClick={() => {
								let newArr = [...subsDropDowns];
								newArr[index] = true;
								setSubsDropDowns(newArr);
							}}>

								<ButtonDropdown
									direction="left"
									onMouseOver={() => {
										let newArr = [...subsDropDowns];
										newArr[index] = true;
										setSubsDropDowns(newArr);
									}} onMouseLeave={() => {
									let newArr = [...subsDropDowns];
									newArr[index] = false;
									setSubsDropDowns(newArr);
								}}
									isOpen={subsDropDowns[index]}
									toggle={() => {
										let newArr = [...subsDropDowns];
										newArr[index] = !newArr[index];
										setSubsDropDowns(newArr);
									}}
								>

									<InvisibleDropdownToggle
										style={{color: subsDropDowns[index] ? ThemeColors().themeColor1 : 'unset'}}
										clickable={false}>
										{action.name}
									</InvisibleDropdownToggle>
									<DropdownMenu>
										{action.subs.map((sub) => {
											return (
												<DropdownItem onClick={() => {
													if (sub.areYouSure) {
														setConfirmModal(true);
														setConfirmModalHeader(sub.name);
														setConfirmModalParams(sub.params);
														setConfirmModalAction(() => sub.onclick);
													} else {
														sub.onclick.apply(this, action.params);
													}
												}
												}>
													{sub.name}
												</DropdownItem>
											);
										})}
									</DropdownMenu>
								</ButtonDropdown>

							</DropdownItem>
							:
							<DropdownItem onClick={() => {
								if (action.areYouSure) {
									setConfirmModal(true);
									setConfirmModalHeader(action.name);
									setConfirmModalParams(action.params);
									setConfirmModalAction(() => action.onclick);
								} else {
									action.onclick.apply(this, action.params);
								}
							}}>{action.name}</DropdownItem>;

					})}

				</DropdownMenu>

			</ButtonDropdown>
		</div>
	);
}


export default TableActionsDropDown;
