// Form for new dataset creation
import React from 'react';

export const NewDatasetForm = ({ onSubmit }) => {
	return (
		<form onSubmit={onSubmit}>
			<div className="form-group">
				<label htmlFor="name">Name (str)</label>
				<input type="text" name="name" id="name" placeholder="Name of dataset" />
				<label htmlFor="job">Description (str)</label>
				<input type="text" name="description" id="description" placeholder="Description of dataset" />
				<button className="btn btn-primary" type="submit"> Submit </button>
			</div>
		</form>
	);
};


// class NewDatasetForm extends Component {
//     initialState = { name:'', description: ''};
//     state = this.initialState;
//
//     handleChange = (event) => {
//         const {name, value} = event.target;
//         this.setState({
//             [name]:value,
//         })
//     }
//     submitForm = () => {
//         this.props.handleSubmit(this.state);
//         this.setState(this.initialState);
//     }
//
//     render() {
//         const {name, description} = this.state;
//         return (
//             <form>
//                 <label htmlFor="name">Name (str)</label>
//                 <input type="text" name="name" id="name" value={name} onChange={this.handleChange}/>
//                 <label htmlFor="job">Description (str)</label>
//                 <input type="text" name="description" id="description" value={description} onChange={this.handleChange} />
//                 <input type="button" value="Submit" onClick={this.submitForm} />
//             </form>
//         )
//     }
// }


