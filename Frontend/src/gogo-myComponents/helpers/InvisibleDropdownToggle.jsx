import {styled} from "@material-ui/styles";
import {DropdownToggle} from "reactstrap";

export const InvisibleDropdownToggle = styled(DropdownToggle)(({theme}) => ({
    color: "unset",
    padding: 0,
    background: "unset",
    border: "none",

    "&:hover": {
        backgroundColor: ["unset", "!important"],
        border:  ["none", "!important"]
    }
}))
