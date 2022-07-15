import React, {useEffect, useState} from 'react';
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import PerfectScrollbar from "react-perfect-scrollbar";
import Table from "./Table";
import {PDFDownloadLink, Document, Page, Text, View, StyleSheet} from '@react-pdf/renderer';
import ExcelFile from "react-export-excel/dist/ExcelPlugin/components/ExcelFile";
import FilterList from "./FilterList";

/**
 * in the middle of the screen blocking modal containing table
 * @param {array<Col>} cols - the columns of the table
 * @param {array} data - json data of the table
 * @param {string} header - table header shown on the top
 * @param {boolean} isOpen - if the modal is open
 * @param {function(boolean)} setIsOpen - changes the open state of the modal
 * @param {boolean} [rtl] - if the website is right to left
 * @param exportSheet
 * @param exportPdf
 * @param {array<Filter>} filters
 * @returns {JSX.Element}
 * @constructor
 */
function ModalTable({cols, data, header, isOpen, setIsOpen, rtl,exportSheet = null, exportPdf = null, filters}) {

	const [filteredList, setFilteredList] = useState(data);

	useEffect(() => {
		setFilteredList(data)
	},[data])

	return (
		<Modal isOpen={isOpen} size="xl" toggle={() => setIsOpen(!isOpen)}>
			<ModalHeader>
				{header}
			</ModalHeader>

			<ModalBody>

				{filters && <FilterList filters={filters} setFilteredList={setFilteredList} mainList={data}/>}

				<PerfectScrollbar
					options={{suppressScrollX: false, wheelPropagation: true}}
					style={{maxWidth: "100%"}}
				>

					<Table columns={cols} data={filteredList} rtl={rtl === true} divided/>

				</PerfectScrollbar>
			</ModalBody>
			<ModalFooter style={{display: "flex"}}>

				{exportPdf &&
					<PDFDownloadLink document={exportPdf} fileName={"Exported-Pdf- " + header + ".pdf"}>
						<Button color={"secondary"} onClick={() => setIsOpen(false)}>
							Export Pdf
						</Button>
					</PDFDownloadLink>
				}

				{exportSheet ?
					<ExcelFile element={
						<Button
							color={"primary"}
						>
							Export Excel
						</Button>
					}>
						{exportSheet}
					</ExcelFile>
					: <></>}

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

export default ModalTable;
