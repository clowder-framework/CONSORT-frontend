// api endpoint for server call
import React, {useState, createContext, useEffect} from 'react';
// can headers be passed as context?
export const ApiContext = createContext();

export const ApiProvider = (props) => {
	const [header, setHeader] = useState(null);
	const headers = {'hostname': ApiContext.hostname, 'apikey': ApiContext.apikey};
	setHeader(headers);

	return (
		<ApiContext.Provider value={[header, setHeader]}>
			{props.children}
		</ApiContext.Provider>
	);
}
