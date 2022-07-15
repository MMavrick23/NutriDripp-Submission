/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-use-before-define */
import React, {useState} from 'react';
import {injectIntl} from 'react-intl';

import {
	UncontrolledDropdown,
	DropdownItem,
	DropdownToggle,
	DropdownMenu,
} from 'reactstrap';

import {NavLink} from 'react-router-dom';
import {connect} from 'react-redux';
import {Offline} from "react-detect-offline";

import {
	setContainerClassnames,
	clickOnMobileMenu,
	changeLocale,
} from '../redux/actions';

import {
	isDarkSwitchActive,
	adminRoot,
} from '../constants/defaultValues';

import {MobileMenuIcon, MenuIcon} from '../components/svg';
import TopnavDarkSwitch from '../gogo-myComponents/helpers/Topnav.DarkSwitch';

import {ThemeColors} from "../helpers/ThemeColors";

const TopNav = ({
					intl,
					history,
					containerClassnames,
					menuClickCount,
					selectedMenuHasSubItems,
					locale,
					setContainerClassnamesAction,
					clickOnMobileMenuAction,
					changeLocaleAction,
					newVersionAvailable,
					updateServiceWorker,
				}) => {
	const [isInFullScreen, setIsInFullScreen] = useState(false);

	const isInFullScreenFn = () => {
		return ((document.fullscreenElement && true) || (document.webkitFullscreenElement && true) || (document.mozFullScreenElement && true) || (document.msFullscreenElement && true));
	};

	const toggleFullScreen = () => {
		const isFS = isInFullScreenFn();

		const docElm = document.documentElement;
		if (!isFS) {
			if (docElm.requestFullscreen) {
				docElm.requestFullscreen();
			} else if (docElm.mozRequestFullScreen) {
				docElm.mozRequestFullScreen();
			} else if (docElm.webkitRequestFullScreen) {
				docElm.webkitRequestFullScreen();
			} else if (docElm.msRequestFullscreen) {
				docElm.msRequestFullscreen();
			}
		} else if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		}
		setIsInFullScreen(!isFS);
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("name");
		localStorage.removeItem("permissions");
		localStorage.removeItem("profilepic");
		localStorage.removeItem("userId");
		history.push({adminRoot});
	};

	const menuButtonClick = (e, _clickCount, _conClassnames) => {
		e.preventDefault();

		setTimeout(() => {
			const event = document.createEvent('HTMLEvents');
			event.initEvent('resize', false, false);
			window.dispatchEvent(event);
		}, 350);
		setContainerClassnamesAction(
			_clickCount + 1,
			_conClassnames,
			selectedMenuHasSubItems,
		);
	};

	const mobileMenuButtonClick = (e, _containerClassnames) => {
		e.preventDefault();
		clickOnMobileMenuAction(_containerClassnames);
	};

	const colors = ThemeColors();

	return (
		<nav className="navbar fixed-top">
			<div className="d-flex align-items-center navbar-left">
				<NavLink
					to="#"
					location={{}}
					className="menu-button d-none d-md-block"
					onClick={(e) =>
						menuButtonClick(e, menuClickCount, containerClassnames)
					}
				>
					<MenuIcon/>
				</NavLink>
				<NavLink
					to="#"
					location={{}}
					className="menu-button-mobile d-xs-block d-sm-block d-md-none"
					onClick={(e) => mobileMenuButtonClick(e, containerClassnames)}
				>
					<MobileMenuIcon/>
				</NavLink>

			</div>

			<NavLink className="navbar-logo" to={adminRoot}>
				<span className="logo d-none d-xs-block"/>
				<span className="logo-mobile d-block d-xs-none"/>
			</NavLink>

			<div className="navbar-right">
				<div className="d-inline-block header-icons align-middle" style={{paddingInlineEnd: 10}}>
					{<Offline >
						<div className="d-flex header-icons">
							<svg style={{height: 32, width: 32}} enable-background="new 0 0 512 512" fill={colors.themeColor1} height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg">
								<g>
									<g>
										<path d="m349.5 212.514c7.799-.001 15.595-2.968 21.518-8.899 5.747-5.733 8.912-13.375 8.912-21.518s-3.165-15.784-8.912-21.518h.001c-41.015-40.923-95.543-63.46-153.541-63.46s-112.526 22.537-153.554 63.473c-11.842 11.857-11.842 31.152.014 43.022 11.881 11.855 31.215 11.854 43.096 0 60.907-60.772 160.011-60.772 220.918 0 5.946 5.934 13.749 8.9 21.548 8.9zm-256.594-23.058c-4.092 4.085-10.75 4.084-14.83.013-4.06-4.064-4.06-10.68-.013-14.731 38.441-38.355 88.92-57.526 139.414-57.526 50.483 0 100.982 19.18 139.414 57.526h.001c1.958 1.954 3.037 4.567 3.037 7.359s-1.079 5.405-3.051 7.372c-4.001 4.008-10.78 4-14.801-.013-68.695-68.542-180.473-68.544-249.171 0z"/>
										<path d="m291.606 270.255c7.794 0 15.589-2.959 21.518-8.874 5.747-5.714 8.916-13.347 8.923-21.492.007-8.16-3.157-15.814-8.91-21.556-52.738-52.621-138.551-52.621-191.289 0-5.753 5.741-8.917 13.396-8.91 21.556.007 8.146 3.176 15.778 8.91 21.479 11.872 11.846 31.191 11.847 43.065.003 28.994-28.904 76.167-28.903 105.155-.003 5.94 5.926 13.739 8.887 21.538 8.887zm-140.816-23.045c-4.086 4.075-10.73 4.077-14.828-.013-1.948-1.937-3.021-4.538-3.024-7.326-.003-2.803 1.076-5.424 3.037-7.38 44.949-44.85 118.086-44.85 163.035 0 1.961 1.956 3.04 4.577 3.037 7.38-.003 2.788-1.076 5.39-3.036 7.339-4.087 4.075-10.731 4.074-14.818-.003-18.39-18.333-42.544-27.499-66.699-27.499s-48.313 9.167-66.704 27.502z"/>
										<path d="m189.538 280.838c-7.474 7.457-11.59 17.369-11.59 27.909 0 10.541 4.116 20.453 11.59 27.91 7.707 7.689 17.831 11.535 27.954 11.535s20.247-3.846 27.954-11.535c7.474-7.457 11.59-17.369 11.59-27.91 0-10.54-4.116-20.452-11.59-27.909-15.414-15.379-40.494-15.379-55.908 0zm47.498 27.909c0 5.19-2.03 10.074-5.717 13.752-7.623 7.607-20.031 7.607-27.654 0-3.687-3.678-5.717-8.562-5.717-13.752 0-5.189 2.03-10.073 5.717-13.751 7.623-7.607 20.031-7.607 27.654 0 3.687 3.678 5.717 8.562 5.717 13.751z"/>
										<path d="m426.596 277.4c5.563-19.4 8.388-39.473 8.388-59.822 0-41.44-11.729-81.699-33.916-116.424-2.974-4.653-9.156-6.018-13.812-3.042-4.653 2.974-6.016 9.157-3.042 13.812 20.13 31.502 30.77 68.037 30.77 105.654 0 18.966-2.693 37.664-8.01 55.704-4.838-.596-9.762-.908-14.758-.908-66.049 0-119.783 53.625-119.783 119.539 0 4.977.312 9.882.906 14.7-18.085 5.307-36.832 7.995-55.847 7.995-108.897 0-197.492-88.387-197.492-197.03 0-108.644 88.595-197.031 197.492-197.031 38.095 0 75.049 10.824 106.866 31.302 4.646 2.988 10.833 1.647 13.821-2.997s1.646-10.832-2.997-13.821c-35.053-22.56-75.749-34.483-117.69-34.483-58.094 0-112.709 22.571-153.785 63.556-41.082 40.99-63.707 95.495-63.707 153.474s22.625 112.483 63.707 153.475c41.076 40.984 95.691 63.556 153.785 63.556 20.403 0 40.528-2.822 59.979-8.379 14.814 49.241 60.644 85.224 114.745 85.224 66.049 0 119.784-53.625 119.784-119.54 0-53.994-36.059-99.732-85.404-114.514zm-34.38 214.053c-55.021 0-99.783-44.653-99.783-99.54 0-54.886 44.763-99.539 99.783-99.539 55.021 0 99.784 44.653 99.784 99.539 0 54.887-44.763 99.54-99.784 99.54z"/>
										<path d="m455.684 362.557c0-9.108-3.542-17.66-9.974-24.078-13.279-13.25-34.888-13.25-48.169 0l-5.325 5.312-5.335-5.323c-13.281-13.213-34.895-13.211-48.176 0-.007.008-.015.015-.021.021-13.26 13.271-13.26 34.863.011 48.144l5.293 5.28-5.292 5.281c-6.418 6.403-9.953 14.948-9.953 24.062s3.534 17.66 9.952 24.064c6.644 6.629 15.371 9.943 24.099 9.943s17.455-3.314 24.1-9.944l5.323-5.312 5.314 5.302c6.413 6.418 14.97 9.953 24.095 9.953 9.126 0 17.683-3.535 24.074-9.932 6.438-6.405 9.984-14.956 9.984-24.075s-3.546-17.668-9.974-24.061l-5.293-5.282 5.292-5.28c6.433-6.416 9.975-14.966 9.975-24.075zm-36.488 36.434 12.398 12.372c2.637 2.623 4.089 6.137 4.089 9.894s-1.452 7.271-4.111 9.916c-2.635 2.637-6.167 4.09-9.947 4.09-3.779 0-7.312-1.453-9.958-4.101l-12.388-12.36c-3.904-3.895-10.225-3.896-14.127.001l-12.386 12.359c-5.499 5.485-14.446 5.487-19.945 0-2.631-2.625-4.079-6.143-4.079-9.905s1.448-7.28 4.079-9.905l12.387-12.36c1.88-1.876 2.937-4.423 2.937-7.078 0-2.656-1.057-5.203-2.937-7.079l-12.377-12.349c-5.467-5.471-5.47-14.371-.011-19.848 5.505-5.466 14.456-5.463 19.945-.001l12.387 12.359c3.904 3.895 10.224 3.895 14.126 0l12.388-12.359c5.492-5.479 14.427-5.479 19.917 0 2.645 2.639 4.101 6.161 4.101 9.92 0 3.758-1.456 7.28-4.101 9.918l-12.387 12.359c-1.88 1.876-2.937 4.423-2.937 7.079.001 2.655 1.057 5.202 2.937 7.078z"/>
										<path d="m364.239 81.214c2.56 0 5.118-.977 7.071-2.929 3.905-3.905 3.905-10.237 0-14.143l-.028-.028c-3.905-3.904-10.223-3.892-14.128.015-3.905 3.905-3.892 10.251.014 14.156 1.953 1.952 4.512 2.929 7.071 2.929z"/>
									</g>
								</g>
							</svg>
						</div>
					</Offline>}
				</div>

				{newVersionAvailable && <div className="d-inline-block header-icons">
					<button
						className="header-icon btn btn-empty d-sm-inline-block"
						type="button"
						onClick={updateServiceWorker}
					>
						<i className="iconsminds-upload-1" style={{color: colors.themeColor1}}/>
					</button>
				</div>}

				{isDarkSwitchActive && <TopnavDarkSwitch/>}
				<div className="header-icons d-inline-block align-middle">
					<button
						className="header-icon btn btn-empty d-none d-sm-inline-block"
						type="button"
						id="fullScreenButton"
						onClick={toggleFullScreen}
					>
						{isInFullScreen ? (
							<i className="simple-icon-size-actual d-block"/>
						) : (
							<i className="simple-icon-size-fullscreen d-block"/>
						)}
					</button>
				</div>

				<div className="user d-inline-block">
					<UncontrolledDropdown className="dropdown-menu-right">
						<DropdownToggle className="p-0" color="empty">
							<span className="name mr-1">{localStorage.getItem("name")}</span>
							<span>
                <img alt="Profile" style={{aspectRatio: "1/1"}} src={localStorage.getItem("profilepic")}/>
              </span>
						</DropdownToggle>
						<DropdownMenu className="mt-3" right>
							<DropdownItem onClick={() => handleLogout()}>
								Sign out
							</DropdownItem>
						</DropdownMenu>
					</UncontrolledDropdown>
				</div>


			</div>

		</nav>
	);
};

const mapStateToProps = ({menu, settings}) => {
	const {containerClassnames, menuClickCount, selectedMenuHasSubItems} = menu;
	const {locale} = settings;
	return {
		containerClassnames,
		menuClickCount,
		selectedMenuHasSubItems,
		locale,
	};
};
export default injectIntl(
	connect(mapStateToProps, {
		setContainerClassnamesAction: setContainerClassnames,
		clickOnMobileMenuAction: clickOnMobileMenu,
		changeLocaleAction: changeLocale,
	})(TopNav),
);
