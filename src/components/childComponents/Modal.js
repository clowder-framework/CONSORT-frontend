// Modal for new dataset form

import React from 'react';
import ReactDOM from 'react-dom';
import { NewDatasetForm } from './NewDatasetForm';

export const Modal = ({onSubmit, closeModal}) => {
	return ReactDOM.createPortal(
		<div>
			<aside tag="aside" role="dialog" tabIndex="-1" aria-modal="true" className="modal-cover">
				<div className="modal-area" >
					<button aria-label="Close Modal" aria-labelledby="close-modal" className="_modal-close" onClick={closeModal}>
						<span id="close-modal" className="_hide-visual"> Close </span>
					</button>
					<div className="modal-body">
						<NewDatasetForm onSubmit={onSubmit} />
					</div>
				</div>
			</aside>
		</div>,
		document.body
	);
};
