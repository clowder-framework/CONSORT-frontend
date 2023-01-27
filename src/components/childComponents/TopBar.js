import React from 'react';
import ClowderLogo from "../../assets/clowder-logo-sm.svg";
import { NavLink } from 'react-router-dom';

export default function TopBar() {
	return (
		<nav className="top-nav">
			<a className="clowder-home" href="/">
				<img src={ClowderLogo} alt="clowder-logo-sm"/>
			</a>
		</nav>
	)
}
