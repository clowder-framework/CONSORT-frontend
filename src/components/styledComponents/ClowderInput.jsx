import {styled} from "@material-ui/core/styles";
import {TextField} from "@material-ui/core";

export const ClowderInput = styled(TextField)({
	width: "100%",
	"& .MuiInputBase-root": {
		height: "41px",
		width: "100%",
		fontSize: "16px",
		backgroundColor: "#FFFFFF",
		padding: "6px 12px",
		border: "1px solid #CED4DA",
		borderRadius: "4px",
		color: "#6C757D",
	},
});
