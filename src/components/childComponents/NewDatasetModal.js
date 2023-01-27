// Modal for Clowder create dataset API

import React, { Component } from 'react';
import {Box, Button} from "@material-ui/core";

import { Modal } from './Modal';

export class NewDatasetModal extends Component {
	state = { isShown: false };
	showModal = () => {
		this.setState({ isShown: true });
	};
	closeModal = () => {
		this.setState({ isShown: false });
	};

	// try to have a DisplayModal function which returns <Modal> if isShown is true

	render() {
		return (
			<>
				<Button onClick={this.showModal}> Create Dataset </Button>
				{
					this.state.isShown ? (
						<Modal onSubmit={this.props.onSubmit} closeModal={this.closeModal}/>
					) : null
				}
			</>
		);
	}
}

export default NewDatasetModal;
