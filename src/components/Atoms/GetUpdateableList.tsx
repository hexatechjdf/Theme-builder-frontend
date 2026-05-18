import React, { useEffect } from "react";
import makePlain from "../utilities/makePlain";
import * as roots from "../Dictionaries/inputFileds";
import { customStyleColorValuesSelector } from "../store/selectors";
import { useRecoilValue } from "recoil";
import UpdateColorRefrences from "./UpdateColorRefrences";

interface UpdateColorRefrencesProps {
	id: string;
	color: string;
}

const GetUpdateableList: React.FC<UpdateColorRefrencesProps> = ({ id, color, }) => {
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
		customStyleColorValuesSelector({
			keys: quickActionKeys.color,
			optionalParam: id,
		})
	);
	const locationSwitcherColorValues = useRecoilValue(
		customStyleColorValuesSelector({
			keys: locationSwitcherKeys.color,
			optionalParam: id,
		})
	);

	const searchOpenerColorValues = useRecoilValue(
		customStyleColorValuesSelector({
			keys: searchOpenerKeys.color,
			optionalParam: id,
		})
	);

	const sidebarNavbarColorValues = useRecoilValue(
		customStyleColorValuesSelector({
			keys: sidebarNavbarKeys.color,
			optionalParam: id,
		})
	);

	const topHeaderColorValues = useRecoilValue(
		customStyleColorValuesSelector({
			keys: topHeaderKeys.color,
			optionalParam: id,
		})
	);

	const topHeaderTopnavColorValues = useRecoilValue(
		customStyleColorValuesSelector({
			keys: topHeaderTopnavKeys.color,
			optionalParam: id,
		})
	);

	const rightSideDashboardHeaderColorValues = useRecoilValue(
		customStyleColorValuesSelector({
			keys: rightSideDashboardHeaderKeys.color,
			optionalParam: id,
		})
	);

	const dashboardCardColorValues = useRecoilValue(
		customStyleColorValuesSelector({
			keys: dashboardCardKeys.color,
			optionalParam: id,
		})
	);

	const inputDropdownColorValues = useRecoilValue(
		customStyleColorValuesSelector({
			keys: inputDropdownKeys.color,
			optionalParam: id,
		})
	);

	const paginationButtonColorValues = useRecoilValue(
		customStyleColorValuesSelector({
			keys: paginationButtonKeys.color,
			optionalParam: id,
		})
	);

	const buttonColorValues = useRecoilValue(
		customStyleColorValuesSelector({
			keys: buttonKeys.color,
			optionalParam: id,
		})
	);

	const smartListColorValues = useRecoilValue(
		customStyleColorValuesSelector({
			keys: smartListKeys.color,
			optionalParam: id,
		})
	);

	const opportunitiesColorValues = useRecoilValue(
		customStyleColorValuesSelector({
			keys: opportunitiesKeys.color,
			optionalParam: id,
		})
	);

	const reputationCardColorValues = useRecoilValue(
		customStyleColorValuesSelector({
			keys: reputationCardKeys.color,
			optionalParam: id,
		})
	);

	const reportingCardColorValues = useRecoilValue(
		customStyleColorValuesSelector({
			keys: reportingCardKeys.color,
			optionalParam: id,
		})
	);

	useEffect(() => {}, [color]);
	return (
		<>
			{quickActionColorValues.length > 0 &&
				quickActionColorValues.map((item, index) => {
					return (
						<UpdateColorRefrences
							key={index}
							id={Object.keys(item)[0]}
							color={color}
						/>
					);
				})}
			{locationSwitcherColorValues.length > 0 &&
				quickActionColorValues.map((item, index) => {
					return (
						<UpdateColorRefrences
							key={index}
							id={Object.keys(item)[0]}
							color={color}
						/>
					);
				})}

			{searchOpenerColorValues.length > 0 &&
				searchOpenerColorValues.map((item, index) => {
					return (
						<UpdateColorRefrences
							key={index}
							id={Object.keys(item)[0]}
							color={color}
						/>
					);
				})}

			{sidebarNavbarColorValues.length > 0 &&
				sidebarNavbarColorValues.map((item, index) => {
					return (
						<UpdateColorRefrences
							key={index}
							id={Object.keys(item)[0]}
							color={color}
						/>
					);
				})}

			{topHeaderColorValues.length > 0 &&
				topHeaderColorValues.map((item, index) => {
					return (
						<UpdateColorRefrences
							key={index}
							id={Object.keys(item)[0]}
							color={color}
						/>
					);
				})}

			{topHeaderTopnavColorValues.length > 0 &&
				topHeaderTopnavColorValues.map((item, index) => {
					return (
						<UpdateColorRefrences
							key={index}
							id={Object.keys(item)[0]}
							color={color}
						/>
					);
				})}

			{rightSideDashboardHeaderColorValues.length > 0 &&
				rightSideDashboardHeaderColorValues.map((item, index) => {
					return (
						<UpdateColorRefrences
							key={index}
							id={Object.keys(item)[0]}
							color={color}
						/>
					);
				})}

			{dashboardCardColorValues.length > 0 &&
				dashboardCardColorValues.map((item, index) => {
					return (
						<UpdateColorRefrences
							key={index}
							id={Object.keys(item)[0]}
							color={color}
						/>
					);
				})}

			{inputDropdownColorValues.length > 0 &&
				inputDropdownColorValues.map((item, index) => {
					return (
						<UpdateColorRefrences
							key={index}
							id={Object.keys(item)[0]}
							color={color}
						/>
					);
				})}

			{paginationButtonColorValues.length > 0 &&
				paginationButtonColorValues.map((item, index) => {
					return (
						<UpdateColorRefrences
							key={index}
							id={Object.keys(item)[0]}
							color={color}
						/>
					);
				})}

			{buttonColorValues.length > 0 &&
				buttonColorValues.map((item, index) => {
					return (
						<UpdateColorRefrences
							key={index}
							id={Object.keys(item)[0]}
							color={color}
						/>
					);
				})}

			{smartListColorValues.length > 0 &&
				smartListColorValues.map((item, index) => {
					return (
						<UpdateColorRefrences
							key={index}
							id={Object.keys(item)[0]}
							color={color}
						/>
					);
				})}

			{opportunitiesColorValues.length > 0 &&
				opportunitiesColorValues.map((item, index) => {
					return (
						<UpdateColorRefrences
							key={index}
							id={Object.keys(item)[0]}
							color={color}
						/>
					);
				})}

			{reputationCardColorValues.length > 0 &&
				reputationCardColorValues.map((item, index) => {
					return (
						<UpdateColorRefrences
							key={index}
							id={Object.keys(item)[0]}
							color={color}
						/>
					);
				})}

			{reportingCardColorValues.length > 0 &&
				reportingCardColorValues.map((item, index) => {
					return (
						<UpdateColorRefrences
							key={index}
							id={Object.keys(item)[0]}
							color={color}
						/>
					);
				})}
		</>
	);
};

export default GetUpdateableList;
