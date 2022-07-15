import React, {useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/styles";
import Select from "react-select";
import CustomSelectInput from "../components/common/CustomSelectInput";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';

export const FILTER_TEXT = 0;
export const FILTER_SELECT = 1;
export const BETWEEN_DATES = 2;

function filterByFilters(props, filtersState) {
	props.setFilteredList(filtersState.reduce((acc, curr, index) => {
		switch (props.filters[index].type) {
			case FILTER_TEXT:
				return acc.filter((item) => item[props.filters[index].name].toString().toLowerCase().includes(filtersState[index].value.toString().toLowerCase()));
			case FILTER_SELECT:
				return filtersState[index].value === "" || !filtersState[index].value ? acc : acc.filter((item) => filtersState[index].value.some((element) => element.value.toString() === item[props.filters[index].name].toString()));
			case BETWEEN_DATES:
				return (filtersState[index].startDate === null || filtersState[index].endDate === null) ? acc : acc.filter((item) => {return item[props.filters[index].name] >= (filtersState[index].startDate.getTime()/1000) && item[props.filters[index].name] <= (filtersState[index].endDate.getTime()/1000)});
		}
	}, props.mainList));

}

/**
 * @typedef {Object} Filter
 * @property {string} name
 * @property {string} placeHolder
 * @property {number} type - FILTER_TEXT or FILTER_SELECT or BETWEEN_DAtES
 * @property {string} [initial]
 * @property {array<SelectOption>} [options] - only with type FILTER_SELECT
 * @property {boolean} [time] - only with type time
 */

/**
 * the component lays out filters and sets filtered list depending on the main list provided and the filter
 * @param {array} mainList
 * @param {array<Filter>} filters
 * @param {function} setFilteredList
 * @returns {JSX.Element}
 * @constructor
 */
function FilterList({mainList, filters, setFilteredList}) {

	const useStyle = makeStyles({
		mainContainer: {
			display: "grid",
			gridTemplateColumns: "repeat(auto-fill, 180px)",
			alignItems: "center",
			gap: 10,

			"@media screen and (max-width: 400px)": {
				justifyContent: "center",
			},

			"& input": {
				width: 180,
			},
		},
	});

	const classes = useStyle();


	const [filtersState, setFiltersState] = useState(filters.reduce((acc, cur) => {
		if (cur.type === BETWEEN_DATES) {
			return ([...acc, {startDate: null, endDate: null}]);
		} else {
			return ([...acc, {value: cur.initialValue ? cur.initialValue : ""}]);
		}
	}, []));

	useEffect(() => {
		filterByFilters({mainList, filters, setFilteredList}, filtersState);
	}, [filtersState]);

	return (
		<div className={classes.mainContainer}>

			{filters.map((filter, index) => {

				switch (filter.type) {
					case FILTER_TEXT:
						return (
							<div className={"search-sm"} key={index}>
								<input
									type="text"
									name={filter.name}
									id={filter.name}
									placeholder={filter.placeHolder}
									defaultValue={filtersState[index].value ? filtersState[index].value : ""}
									onChange={(e) => {
										let newArr = [...filtersState];
										newArr[index].value = e.target.value;
										setFiltersState(newArr);
									}}
								/>
							</div>
						);
					case FILTER_SELECT:
						return (
							<div key={index}>
								<Select
									components={{Input: CustomSelectInput}}
									className="react-select"
									classNamePrefix="react-select"
									isMulti={true}
									placeholder={filter.placeHolder}
									name={filter.name}
									defaultValue={filtersState[index].value ? filtersState[index].value : ""}
									onChange={(e) => {
										let newArr = [...filtersState];
										newArr[index].value = e;
										setFiltersState(newArr);
									}}
									options={filter.options}
								/>
							</div>
						);
					case BETWEEN_DATES:
						return (
							<>

								<div>
								<span>
									{document.dir === "rtl" ? "تاريخ البدء" : "Start Date"}
								</span>
									<DatePicker
										selected={filtersState[index].startDate}
										onChange={(date) => {
											let newArr = [...filtersState];
											newArr[index].startDate = date;
											setFiltersState(newArr);
										}}
										selectsStart
										startDate={filtersState[index].startDate}
										endDate={filtersState[index].endDate}
									/>
								</div>

								<div>
								<span>
									{document.dir === "rtl" ? "تاريخ الإنتهاء" : "End Date"}
								</span>
									<DatePicker
										selected={filtersState[index].endDate}
										onChange={(date) => {
											let newArr = [...filtersState];
											newArr[index].endDate = date;
											setFiltersState(newArr);
										}}
										selectsEnd
										startDate={filtersState[index].startDate}
										endDate={filtersState[index].endDate}
										minDate={filtersState[index].startDate}
									/>
								</div>

							</>
						);
				}
			})}

		</div>
	);
}

export default FilterList;
