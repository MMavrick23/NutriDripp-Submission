import {usePagination, useSortBy, useTable} from "react-table";
import classnames from "classnames";
import DatatablePagination from "../components/DatatablePagination";
import React, {useState} from "react";
import {CustomInput} from "reactstrap";
import Skeleton, {SkeletonTheme} from "react-loading-skeleton";
import {ThemeColors} from "../helpers/ThemeColors";
import {makeStyles} from "@material-ui/styles";

function getLoadingTd() {
	return <td>
		<div>
			<SkeletonTheme color={ThemeColors().separatorColor} highlightColor={ThemeColors().themeColor1}>
				<Skeleton height={58} style={{borderRadius: 0, width: "100%"}}/>
			</SkeletonTheme>
		</div>
	</td>;
}

/**
 * the main table layout if checklist provided setChecklist must be provided and the table will render
 * extra column called check to follow selected items and if checklist is not provided it will just
 * render columns provided
 * @param {array<Col>} columns - the columns of the table
 * @param {array} data - json data of the table
 * @param {boolean} [showPageSizeOptions] - if you want the user to be able to change the number of visible items
 * @param {boolean} [divided] - if you want the table to divided or not
 * @param {boolean} [bordered] - if you want the table to have borders or not
 * @param {boolean} [striped] - if you want the table to have stripes or not
 * @param {number} [defaultPageSize] - default number of pages if not edited is equal to 12
 * @param {array<number>} [checkedList] - optional checklist shows checks
 * @param {function} [setCheckedList] - if a check is clicked change the check list provided
 * @param {boolean} [rtl] - if it's right to left arabic
 * @param {boolean} [isContentReady]
 * @returns {JSX.Element}
 * @constructor
 */
function Table({
				   columns,
				   data,
				   showPageSizeOptions = false,
				   divided = false,
	               bordered = false,
	               striped = false,
				   defaultPageSize = 7,
				   checkedList,
				   setCheckedList,
				   rtl = false,
				   isContentReady = true,
			   }) {


	const {
		getTableProps,
		getTableBodyProps,
		prepareRow,
		headerGroups,
		page,
		canPreviousPage,
		canNextPage,
		pageCount,
		gotoPage,
		setPageSize,
		state: {pageIndex, pageSize},
	} = useTable(
		{
			columns,
			data,
			initialState: {pageIndex: 0, pageSize: defaultPageSize},
		},
		useSortBy,
		usePagination,
	);


	const useStyle = makeStyles({
		loadingTr: {
			"& > td": {
				background: "none!important",
				paddingTop: [0, "!important"],
				paddingBottom: [0, "!important"],

				"& div": {
					width: "100%",
				},
			},
		},
	});

	const classes = useStyle();

	return (
		<>
			<div
				style={{width: 'calc(100%)'}}
			>
				<table
					{...getTableProps()}
					className={`table ${classnames({'table-divided': divided})} ${classnames({'table-bordered': bordered})} ${classnames({'table-striped': striped})} ${(!bordered && !striped) ? "r-table" : ""}`}
				>
					<thead>
					{headerGroups.map((headerGroup) => (
						<tr {...headerGroup.getHeaderGroupProps()}>
							{checkedList ?
								<th style={rtl ? {textAlign: "right"} : {}}>{rtl ? "الاختيار" : "check"}</th> : <></>}
							{headerGroup.headers.map((column, columnIndex) => (
								<th
									key={`th_${columnIndex}`}
									{...column.getHeaderProps(column.getSortByToggleProps())}
									style={rtl ? {textAlign: "right"} : {}}
									className={
										column.isSorted
											? column.isSortedDesc
												? 'sorted-desc'
												: 'sorted-asc'
											: ''
									}
								>

									{column.render('Header')}

									<span/>
								</th>
							))}
						</tr>
					))}


					</thead>

					{isContentReady ?
						<tbody {...getTableBodyProps()}>
						{page.map((row) => {
							prepareRow(row);
							return (
								<tr {...row.getRowProps()} >

									{checkedList ?
										<td className={checkedList.includes(data[row.id].id) ? "selected-table-td" : ""}>
											<div style={{display: "flex", width: "100%"}}>
												<CustomInput

													className="custom-checkbox mb-0 d-inline-block"
													type="checkbox"
													id={data[row.id].id}
													checked={checkedList.includes(data[row.id].id)}
													onChange={() => {

														const tempArray = [...checkedList];

														const index = tempArray.indexOf(data[row.id].id);
														if (index !== -1) {
															tempArray.splice(index, 1);
														} else {
															tempArray.push(data[row.id].id);
														}

														setCheckedList(tempArray);

													}}

												/>
											</div>
										</td> : <></>}

									{row.cells.map((cell, cellIndex) => (
										<td
											key={`td_${cellIndex}`}
											{...cell.getCellProps({
												className: (checkedList && checkedList.includes(data[row.id].id) && "selected-table-td ") + cell.column.cellClass,
											})}
										>
											{cell.render('Cell')}
										</td>
									))}

								</tr>

							);
						})}


						</tbody>
						:
						Array.apply(null, { length: pageSize }).map((e, i) => (
							<tr key={i} className={classes.loadingTr}>

								{checkedList && getLoadingTd()}

								{columns.map(() => getLoadingTd())}

							</tr>
						))
					}

				</table>

				<DatatablePagination
					page={pageIndex}
					pages={pageCount}
					canPrevious={canPreviousPage}
					canNext={canNextPage}
					pageSizeOptions={[4, 6, 8, 12, 14, 16]}
					showPageSizeOptions={showPageSizeOptions}
					showPageJump={true}
					defaultPageSize={pageSize}
					onPageChange={(p) => gotoPage(p)}
					onPageSizeChange={(s) => setPageSize(s)}
					paginationMaxSize={12}
				/>

			</div>

		</>
	);
}

export default Table;
