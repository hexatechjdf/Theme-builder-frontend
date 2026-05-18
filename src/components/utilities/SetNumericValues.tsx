import React, { useEffect } from "react";
import makePlain from "../utilities/makePlain";
import * as roots from "../Dictionaries/inputFileds";
// import {
// 	// generalRootStyles,
// 	quickActionStyles,
// 	locationSwitcherStyles,
// 	searchOpenerStyles,
// 	sidebarNavbarStyles,
// 	topHeaderStyles,
// 	topHeaderTopnavStyles,
// 	rightSideDashboardHeaderStyles,
// 	dashboardCardStyles,
// 	inputDropdownStyles,
// 	paginationButtonStyles,
// 	buttonStyles,
// 	smartListStyles,
// 	opportunitiesStyles,
// 	reputationCardStyles,
// 	reportingCardStyles,
// } from "../Dictionaries/inputFileds";
import { customStyleNumericValuesSelector } from "../store/selectors";
import { useRecoilValue } from "recoil";
import UpdateNumericValueRefrences from "../Atoms/UpdateNumericValueRefrences";
interface UpdateColorRefrencesProps {
	id: string;
	value: string;
}

const SetNumericValues: React.FC<UpdateColorRefrencesProps> = ({
	id,
	value,
}) => {
	const quickActionKeys = makePlain(roots.quickActionStyles);
	const locationSwitcherKeys = makePlain(roots.locationSwitcherStyles);

	const searchOpenerKeys = makePlain(roots.searchOpenerStyles);
	const sidebarNavbarKeys = makePlain(roots.sidebarNavStyles);
	const topHeaderKeys = makePlain(roots.headerTopNavStyles);
	const topHeaderTopnavKeys = makePlain(roots.headerStyles);
	const rightSideDashboardHeaderKeys = makePlain(roots.dashboardHeaderStyles);
	const dashboardCardKeys = makePlain(roots.dashboardCardStyles);
	const inputDropdownKeys = makePlain(roots.dashboardInputStyles);
	const paginationButtonKeys = makePlain(roots.paginationButtonStyles);
	const buttonKeys = makePlain(roots.buttonStyles);
	const smartListKeys = makePlain(roots.smartListStyles);
	const opportunitiesKeys = makePlain(roots.opportunitiesCardStyles);
	const reputationCardKeys = makePlain(roots.reputationCardStyles);
	const reportingCardKeys = makePlain(roots.reportingCardStyles);

	const quickActionColorValues = useRecoilValue(
		customStyleNumericValuesSelector({
			keys: quickActionKeys.numeric,
			optionalParam: id,
		})
	);
	const locationSwitcherColorValues = useRecoilValue(
		customStyleNumericValuesSelector({
			keys: locationSwitcherKeys.numeric,
			optionalParam: id,
		})
	);

	const searchOpenerColorValues = useRecoilValue(
		customStyleNumericValuesSelector({
			keys: searchOpenerKeys.numeric,
			optionalParam: id,
		})
	);

	const sidebarNavbarColorValues = useRecoilValue(
		customStyleNumericValuesSelector({
			keys: sidebarNavbarKeys.numeric,
			optionalParam: id,
		})
	);

	const topHeaderColorValues = useRecoilValue(
		customStyleNumericValuesSelector({
			keys: topHeaderKeys.numeric,
			optionalParam: id,
		})
	);

	const topHeaderTopnavColorValues = useRecoilValue(
		customStyleNumericValuesSelector({
			keys: topHeaderTopnavKeys.numeric,
			optionalParam: id,
		})
	);

	const rightSideDashboardHeaderColorValues = useRecoilValue(
		customStyleNumericValuesSelector({
			keys: rightSideDashboardHeaderKeys.numeric,
			optionalParam: id,
		})
	);

	const dashboardCardColorValues = useRecoilValue(
		customStyleNumericValuesSelector({
			keys: dashboardCardKeys.numeric,
			optionalParam: id,
		})
	);

	const inputDropdownColorValues = useRecoilValue(
		customStyleNumericValuesSelector({
			keys: inputDropdownKeys.numeric,
			optionalParam: id,
		})
	);

	const paginationButtonColorValues = useRecoilValue(
		customStyleNumericValuesSelector({
			keys: paginationButtonKeys.numeric,
			optionalParam: id,
		})
	);

	const buttonColorValues = useRecoilValue(
		customStyleNumericValuesSelector({
			keys: buttonKeys.numeric,
			optionalParam: id,
		})
	);

	const smartListColorValues = useRecoilValue(
		customStyleNumericValuesSelector({
			keys: smartListKeys.numeric,
			optionalParam: id,
		})
	);

	const opportunitiesColorValues = useRecoilValue(
		customStyleNumericValuesSelector({
			keys: opportunitiesKeys.numeric,
			optionalParam: id,
		})
	);

	const reputationCardColorValues = useRecoilValue(
		customStyleNumericValuesSelector({
			keys: reputationCardKeys.numeric,
			optionalParam: id,
		})
	);

	const reportingCardColorValues = useRecoilValue(
		customStyleNumericValuesSelector({
			keys: reportingCardKeys.numeric,
			optionalParam: id,
		})
	);

	// console.log(
	// 	reputationCardColorValues,
	// 	reportingCardColorValues,
	// 	opportunitiesColorValues,
	// 	smartListColorValues,
	// 	buttonColorValues,
	// 	paginationButtonColorValues,
	// 	inputDropdownColorValues,
	// 	dashboardCardColorValues
	// );

	useEffect(() => {}, [value]);
	return (
		<>
			{quickActionColorValues.length > 0 &&
				quickActionColorValues.map((item, index) => {
					return (
						<UpdateNumericValueRefrences
							key={index}
							id={Object.keys(item)[0]}
							value={value}
						/>
					);
				})}
			{locationSwitcherColorValues.length > 0 &&
				quickActionColorValues.map((item, index) => {
					return (
						<UpdateNumericValueRefrences
							key={index}
							id={Object.keys(item)[0]}
							value={value}
						/>
					);
				})}

			{searchOpenerColorValues.length > 0 &&
				searchOpenerColorValues.map((item, index) => {
					return (
						<UpdateNumericValueRefrences
							key={index}
							id={Object.keys(item)[0]}
							value={value}
						/>
					);
				})}

			{sidebarNavbarColorValues.length > 0 &&
				sidebarNavbarColorValues.map((item, index) => {
					return (
						<UpdateNumericValueRefrences
							key={index}
							id={Object.keys(item)[0]}
							value={value}
						/>
					);
				})}

			{topHeaderColorValues.length > 0 &&
				topHeaderColorValues.map((item, index) => {
					return (
						<UpdateNumericValueRefrences
							key={index}
							id={Object.keys(item)[0]}
							value={value}
						/>
					);
				})}

			{topHeaderTopnavColorValues.length > 0 &&
				topHeaderTopnavColorValues.map((item, index) => {
					return (
						<UpdateNumericValueRefrences
							key={index}
							id={Object.keys(item)[0]}
							value={value}
						/>
					);
				})}

			{rightSideDashboardHeaderColorValues.length > 0 &&
				rightSideDashboardHeaderColorValues.map((item, index) => {
					return (
						<UpdateNumericValueRefrences
							key={index}
							id={Object.keys(item)[0]}
							value={value}
						/>
					);
				})}

			{dashboardCardColorValues.length > 0 &&
				dashboardCardColorValues.map((item, index) => {
					return (
						<UpdateNumericValueRefrences
							key={index}
							id={Object.keys(item)[0]}
							value={value}
						/>
					);
				})}

			{inputDropdownColorValues.length > 0 &&
				inputDropdownColorValues.map((item, index) => {
					return (
						<UpdateNumericValueRefrences
							key={index}
							id={Object.keys(item)[0]}
							value={value}
						/>
					);
				})}

			{paginationButtonColorValues.length > 0 &&
				paginationButtonColorValues.map((item, index) => {
					return (
						<UpdateNumericValueRefrences
							key={index}
							id={Object.keys(item)[0]}
							value={value}
						/>
					);
				})}

			{buttonColorValues.length > 0 &&
				buttonColorValues.map((item, index) => {
					return (
						<UpdateNumericValueRefrences
							key={index}
							id={Object.keys(item)[0]}
							value={value}
						/>
					);
				})}

			{smartListColorValues.length > 0 &&
				smartListColorValues.map((item, index) => {
					return (
						<UpdateNumericValueRefrences
							key={index}
							id={Object.keys(item)[0]}
							value={value}
						/>
					);
				})}

			{opportunitiesColorValues.length > 0 &&
				opportunitiesColorValues.map((item, index) => {
					return (
						<UpdateNumericValueRefrences
							key={index}
							id={Object.keys(item)[0]}
							value={value}
						/>
					);
				})}

			{reputationCardColorValues.length > 0 &&
				reputationCardColorValues.map((item, index) => {
					return (
						<UpdateNumericValueRefrences
							key={index}
							id={Object.keys(item)[0]}
							value={value}
						/>
					);
				})}

			{reportingCardColorValues.length > 0 &&
				reportingCardColorValues.map((item, index) => {
					return (
						<UpdateNumericValueRefrences
							key={index}
							id={Object.keys(item)[0]}
							value={value}
						/>
					);
				})}
		</>
	);
};

export default SetNumericValues;
