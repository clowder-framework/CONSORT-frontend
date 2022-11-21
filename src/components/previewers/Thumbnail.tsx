import React from "react";
import { Typography } from "@material-ui/core";

type Props = {
	fileId: string,
	imgSrc:string,
	fileType: string
}

export default function Thumbnail(props:Props){
	const {fileId, imgSrc, fileType} = props;
	return (
		(() => {
			if (fileType === "image/jpeg" || fileType === "image/jpg" || fileType === "image/png"
				|| fileType === "image/gif" || fileType === "image/bmp"){
				return <img className="rubberbandimage" src={imgSrc} alt="img" id={`rubberbandCanvas-${fileId}`}/>;
			}
			else if (fileType === "image/tiff"){
				return <embed alt="No plugin capable of displaying TIFF images was found."
							  width={750} height={550} src={imgSrc} type="image/tiff" negative="no" id="embedded" />;
			}
			else{
				return <Typography>ERROR: Unrecognised image format.</Typography>;
			}

		})()
	)
}
