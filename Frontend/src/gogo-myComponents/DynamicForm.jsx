import {useFormikContext, Formik, Field, Form, FieldArray, getIn} from "formik";
import React, {useEffect, useMemo, useState} from "react";
import {makeStyles, styled} from "@material-ui/styles";
import {
	Button,
	Card,
	CustomFileInput, CustomInput,
	FormGroup,
	Label,
	Modal, ModalBody, ModalFooter, ModalHeader,
} from "reactstrap";
import {Scrollbars} from 'react-custom-scrollbars';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {FormikCheckbox, FormikCustomCheckbox, FormikCustomCheckboxGroup, FormikReactSelect} from "./helpers/FormikFields";
import * as Yup from 'yup';
import ReactAutoSuggest from "../components/common/ReactAutoSuggest";
import {Separator} from "../components/common/CustomBootstrap";
import rtl from "@glidejs/glide/src/mutator/transformers/rtl";
import NotificationManager from "../components/common/react-notifications/NotificationManager";


const useStyle = makeStyles({

	myForm: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
	},

	mainMenu: {
		height: "100%",
		display: "flex",
	},

	header: {

		height: ["unset", "!important"],

		"& > h5": {
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
			width: "100%",
		},

	},

	close: {
		cursor: "pointer",
		fontSize: 16,
	},

	buttonsHolder: {
		display: "flex",
		justifyContent: ["space-evenly", "!important"],

	},

	modalBody: {
		height: "100vh",
	},

	expandableBox: {
		position: "relative",
		boxShadow: "inset 0px 0px 5px 0px #000000",
		padding: 12,
		borderRadius: 8,
	},

});


const FormImageContainer = styled('div')(({theme}) => ({
	width: "100%",
	height: 300,
	display: "flex",
	justifyContent: "center",

	'& img': {
		maxWidth: "100%",
	},

}));

const ErrorMessage = ({name}) => (
	<Field
		name={name}
		render={({form}) => {
			const error = getIn(form.errors, name);
			const touch = getIn(form.touched, name);
			return touch && error ? error : null;
		}}
	/>
);

export const FORM_SECTION_HEADER = -1;
export const FORM_INPUT_TEXT = 0;
export const FORM_INPUT_SELECT = 1;
export const FORM_INPUT_TEXT_AREA = 2;
export const FORM_INPUT_FILE = 3;
export const FORM_INPUT_DATE = 4;
export const FORM_INPUT_AUTO_SUGGEST = 5;
export const FORM_CHECK_BOX_TOGGLE = 6;
export const FORM_EXPANDABLE = 7;

/**
 * @typedef {object} FormField
 * @property {number} type - one of the following <br/>
 * - FORM_SECTION_HEADER {label, type} <br/>
 * - FORM_INPUT_TEXT {label, name, initialValue, yupValidation, type} <br/>
 * - FORM_INPUT_SELECT {label, name, initialValue, yupValidation, options(array of objects shaped like {label: string, value: string, key: number}), multi (boolean) if the user can select multiple options, type} <br/>
 * - FORM_INPUT_TEXT_AREA {label, name, initialValue, yupValidation, type} <br/>
 * - FORM_INPUT_FILE {label, name, initialValue, yupValidation, accept(the type of files the input accepts) (optional) written in that form (xx/xx), type} <br/>
 * - FORM_INPUT_DATE {label, name, initialValue, yupValidation, time[optional default false](boolean), type} <br/>
 * - FORM_INPUT_AUTO_SUGGEST {label, name, initialValue, yupValidation,options(shape {name: string}) ,type} <br/>
 * - FORM_CHECK_BOX_TOGGLE {label, name, initialValue, yupValidation, type} <br/>
 * - FORM_EXPANDABLE {label, name, initialValue, yupValidation, itemName, subTemplate(no validation for sub components), type} Expandable list of other inputs with a schema for example order(name(input), location(input))	 <br/>
 * @property {string} label - name visible in the form
 * @property {boolean} [static] - if value can be changed in edit
 * @property {string} [name] - name used in sending data to the api
 * @property {string} [initialValue] - if any of the inputs has initial value good example of this discount percentage defaults to 0
 * @property {Object} [yupValidation]
 * @property {array} [options] - for auto suggest and select input
 * @property {boolean} [multi] - for select input only
 * @property {string} [accept] - for file input only in the form of **\/**
 * @property {boolean} [time] - for date input only do you want the date to have time selection as well
 * @property {boolean} [timeOnly] - for date input only do you want to have time only
 * @property {string} [itemName] - for expandable only the text within the add more item button ex add (client)
 * @property {array<FormField>} [subTemplate] - for expandable only the fields in each item
 */

/**
 * This Complex function is responsible for rendering all kinds of forms on the screen from the side with the help of formik
 * @param {boolean} visibility - if the form is visible
 * @param {string} itemName - a name on the top part of the form
 * @param {array<FormField>} fields - main form fields
 * @param {function(boolean)} setVisibility - sets the visibility of the form modal
 * @param {function} addFunction - function that is called when the done button is clicked if edit is false
 * @param {function} editFunction - function that is called when the done button is called if edit is true
 * @param {boolean} edit - if it's for editing if false then it's for adding
 * @param {array} toEditValues - if editing the default values that should be put in the form the edited user
 * @param {boolean} formLoading - if the done button should display loading
 * @param {boolean} [rtl] - if it's arabic right to left
 * @returns {JSX.Element}
 * @constructor
 */
function DynamicForm({visibility, itemName, fields, setVisibility, addFunction, editFunction, edit, toEditValues, formLoading, rtl}) {


	let formik;

	const classes = useStyle();

	function remove() {
		setVisibility(false);
	}

	function clearAndRemove() {
		formik.resetForm();
		remove();
	}

	const SignupSchema = Yup.object().shape(
		fields.reduce((acc, cur) => (cur.type === -1 ? {...acc} : {...acc, [cur.name]: cur.yupValidation}), {}),
	);


	function formInputSelect(field, values, setFieldValue, setFieldTouched, touched, errors, array) {
		switch (field.type) {
			case FORM_SECTION_HEADER:
				return (
					<div>
						<h3 className="m-0">{field.label}</h3>
						<Separator className="mt-2 mb-2"/>
					</div>
				);
			case FORM_INPUT_TEXT:
				return (
					<FormGroup className="error-l-100">
						<Label>{field.label}</Label>
						<Field
							className="form-control"
							name={field.name}
							disabled={edit && field.static}
						/>

						{array && getIn(errors, field.name) && getIn(touched, field.name) ?
							<ErrorMessage name={field.name}/> === null ?
								<></>
								:
								<div className="invalid-feedback d-block">
									<ErrorMessage name={field.name}/>
								</div>

							:
							errors[field.name] && touched[field.name] && (
								<div className="invalid-feedback d-block">
									{errors[field.name]}
								</div>
							)}

					</FormGroup>
				);
			case FORM_INPUT_SELECT:
				return (
					<FormGroup className="error-l-100">

						<Label>{field.label}</Label>

						<FormikReactSelect
							name={field.name}
							id={field.name}
							value={array ?
								// field.name comes in the form of expandableName[index].selectName
								// this complex string manipulation is to get the value out of it
								values[field.name.toString().split("[")[0]]
									[field.name.toString().split('[')[1].split(']')[0]]
									[field.name.toString().split('.')[1]]
									: values[field.name]}
							isMulti={field.multi}
							options={field.options}
							onChange={setFieldValue}
							onBlur={setFieldTouched}
							disabled={edit && field.static}
						/>


						{array && getIn(errors, field.name) && getIn(touched, field.name) ?
							<ErrorMessage name={field.name}/> === null ?
								<></>
								:
								<div className="invalid-feedback d-block">
									<ErrorMessage name={field.name}/>
								</div>

							:
							errors[field.name] && touched[field.name] && (
								<div className="invalid-feedback d-block">
									{errors[field.name]}
								</div>
							)}


					</FormGroup>

				);
			case FORM_INPUT_TEXT_AREA:
				return (
					<FormGroup className="error-l-100">
						<Label>{field.label}</Label>
						<Field
							className="form-control"
							as="textarea"
							name={field.name}
							disabled={edit && field.static}
						/>

						{array && getIn(errors, field.name) && getIn(touched, field.name) ?
							<ErrorMessage name={field.name}/> === null ?
								<></>
								:
								<div className="invalid-feedback d-block">
									<ErrorMessage name={field.name}/>
								</div>

							:
							errors[field.name] && touched[field.name] && (
								<div className="invalid-feedback d-block">
									{errors[field.name]}
								</div>
							)}

					</FormGroup>
				);
			case FORM_INPUT_FILE:
				return (
					<FormGroup className="error-l-100">
						<Label>{field.label}</Label>
						<CustomFileInput id={field.name} name={field.name} disabled={edit && field.static} accept={field.accept ? field.accept : "*/*"} type="file" onChange={(event) => {
							setFieldValue(field.name, event.currentTarget.files[0]);
						}} className="form-control"/>

						{values[field.name] ?
							<FormImageContainer>
								{
									typeof values[field.name] === 'string' ?
										<img src={values[field.name]} alt={""}/>
										:
										<img src={URL.createObjectURL(values[field.name])} alt={""}/>

								}
							</FormImageContainer>

							:

							<></>}


						{array && getIn(errors, field.name) && getIn(touched, field.name) ?
							<ErrorMessage name={field.name}/> === null ?
								<></>
								:
								<div className="invalid-feedback d-block">
									<ErrorMessage name={field.name}/>
								</div>

							:
							errors[field.name] && touched[field.name] && (
								<div className="invalid-feedback d-block">
									{errors[field.name]}
								</div>
							)}

					</FormGroup>
				);
			case FORM_INPUT_DATE:
				return (
					<FormGroup className="error-l-100">
						<Label>{field.label}</Label>

						<DatePicker
							name={field.name}
							selected={values[field.name]}
							selectsStart
							onChange={(value) => setFieldValue(field.name, value)}
							showTimeSelect={field.time}
							showTimeSelectOnly={field.timeOnly}
							timeFormat="HH:mm"
							timeIntervals={15}
							dateFormat={field.timeOnly ? "HH:mm" : field.time ? "yyyy LLL dd HH:mm" : "yyyy LLL dd"}
							timeCaption="Time"
							placeholderText={"date"}
							disabled={edit && field.static}
						/>
					</FormGroup>

				);
			case FORM_INPUT_AUTO_SUGGEST:
				return (
					<FormGroup className="error-l-100">
						<Label>{field.label}</Label>

						<ReactAutoSuggest
							name={field.name}
							id={field.name}
							value={values[field.name]}
							onChange={setFieldValue}
							onBlur={setFieldTouched}
							data={field.options}
							disabled={edit && field.static}
						/>


						{array && getIn(errors, field.name) && getIn(touched, field.name) ?
							<ErrorMessage name={field.name}/> === null ?
								<></>
								:
								<div className="invalid-feedback d-block">
									<ErrorMessage name={field.name}/>
								</div>

							:
							errors[field.name] && touched[field.name] && (
								<div className="invalid-feedback d-block">
									{errors[field.name]}
								</div>
							)}

					</FormGroup>
				);
			case FORM_CHECK_BOX_TOGGLE:
				return (
					<FormGroup className="error-l-100">

						<div className="d-flex align-items-center">

							<Label style={{margin: 0, marginInlineEnd: 8}}>{field.label}</Label>
							<Field
								name={field.name}
								type="checkbox"
								disabled={edit && field.static}
							/>
						</div>


						{array && getIn(errors, field.name) && getIn(touched, field.name) ?
							<ErrorMessage name={field.name}/> === null ?
								<></>
								:
								<div className="invalid-feedback d-block">
									<ErrorMessage name={field.name}/>
								</div>

							:
							errors[field.name] && touched[field.name] && (
								<div className="invalid-feedback d-block">
									{errors[field.name]}
								</div>
							)}

					</FormGroup>
				);
			case FORM_EXPANDABLE:
				return (
					<FormGroup className="error-l-100">
						<FieldArray
							name={field.name}
							render={arrayHelpers => (
								<div style={{marginBottom: "1rem"}}>
									{formInputSelect({
										label: field.label,
										type: FORM_SECTION_HEADER,
									}, values, setFieldValue, setFieldTouched, touched, errors)}

									{values[field.name] && values[field.name].length > 0 ? (
										values[field.name].map((friend, index) => (
											<div key={index} style={{
												display: "flex",
												flexDirection: "column",
												"alignItems": "space-between",
												marginBottom: 10,
											}}>


												<div className={classes.expandableBox}>

													{field.subTemplate.reduce((acc, curr) => {
														let newCurr = JSON.parse(JSON.stringify(curr));
														newCurr.name = `${field.name}[${index}].${curr.name}`;
														acc.push(newCurr);
														return acc;
													}, []).map((subField, index, array) => {
														return (
															formInputSelect(subField, values, setFieldValue, setFieldTouched, touched, errors, true)
														);
													})}


													<i
														style={{
															position: "absolute",
															top: 8,
															right: rtl ? "unset" : 8,
															left: rtl ? 8 : "unset",
															opacity: (field.static && edit ? 0.5 : 1)
														}}
														className={classes.close + " simple-icon-close"}
														onClick={(field.static && edit) ? () => {NotificationManager.error("غير مسموح")} : () => arrayHelpers.remove(index)}
													>

													</i>

												</div>

											</div>
										))
									) : <></>}

									<Button type="button" color={"primary"} style={{width: "100%"}} disabled={edit && field.static} onClick={() => arrayHelpers.push({})}>
										{rtl ? "ضيف" : "add"} {field.itemName}
									</Button>
								</div>
							)}
						/>

						{typeof errors[field.name] === 'string' && touched[field.name] && (
							<div className="invalid-feedback d-block">
								{errors[field.name]}
							</div>
						)}


					</FormGroup>

				);
		}
	}

	useEffect(() => {

		if (edit && visibility) {

			let toMakeSureThatFormikIsNotNull = setInterval(() => {
				if (formik) {
					formik.setValues(fields.reduce((acc, cur) => (
						cur.type === -1 ? {...acc} : {
							...acc,
							[cur.name]: toEditValues[cur.name],
						}), {}));

					clearInterval(toMakeSureThatFormikIsNotNull);
				}

				if (!visibility) {
					clearInterval(toMakeSureThatFormikIsNotNull);
				}

			}, 1);

		}

	}, [visibility]);

	const MyFormikContextHooker = () => {
		formik = useFormikContext();
		return null;
	};

	return (
		<Modal
			className={classes.mainMenu}
			style={rtl ? {margin: 0} : {}}
			isOpen={visibility}
			wrapClassName={"modal-right"}
			backdrop="static"
		>

			<ModalHeader className={classes.header}>

				<h2 style={{margin: 0}}>
					{edit ? (rtl ? "عدل " : "Edit ") + itemName : (rtl ? "ضيف " : "Add ") + itemName}
				</h2>

				<i className={classes.close + " iconsminds-close"} onClick={() => clearAndRemove()}/>


			</ModalHeader>

			<ModalBody className={classes.modalBody + " d-flex p-0"}>

				<Scrollbars style={{height: 'auto'}} width={"100%"}
							renderView={sprops => rtl ? (<div {...sprops} style={{
								...sprops.style,
								marginLeft: sprops.style.marginRight,
								marginRight: 0,
								paddingLeft: 12,
							}}/>) : (<div {...sprops}/>)}
				>

					<Formik
						initialValues={fields.reduce((acc, cur) => (cur.type === -1 ? {...acc} : {
							...acc,
							[cur.name]: cur.initialValue,
						}), {})}
						validationSchema={SignupSchema}
						onSubmit={(values, actions) => {
							edit ? editFunction(values) : addFunction(values);

						}}
					>


						{({errors, setFieldTouched, touched, handleBlur, handleChange, values, setFieldValue}) => (


							<Form className="av-tooltip tooltip-label-right pr-3 pl-3 pt-3 pb-3">

								<MyFormikContextHooker/>


								<div>
									{fields.map((field) => formInputSelect(field, values, setFieldValue, setFieldTouched, touched, errors))}
								</div>


							</Form>
						)}

					</Formik>

				</Scrollbars>

			</ModalBody>

			<ModalFooter className={classes.buttonsHolder}>

				<Button color="primary" onClick={() => clearAndRemove()}>{rtl ? "إلغاء" : "Cancel"}</Button>

				<Button
					color="primary"
					onClick={() => formik.submitForm()}
					disabled={formLoading}
					className={`btn-multiple-state ${
						formLoading ? 'show-spinner' : ''
					}`}
				>
                      <span className="spinner d-inline-block">
                        <span className="bounce1"/>
                        <span className="bounce2"/>
                        <span className="bounce3"/>
                      </span>
					<span className="label">
						{rtl ? "تم" : "Done"}
                      </span>
				</Button>


			</ModalFooter>

		</Modal>
	);
}

export default DynamicForm;
