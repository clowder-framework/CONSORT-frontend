import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  footer: {
    background: "#FFFFFF",
    padding: "20px 0",
    textAlign: "center",
    borderTop: "1px solid #e0e0e0",
  },
  logo: {
    verticalAlign: "middle",
    marginLeft: "10px",
  },
  text: {
    display: "inline-block",
    verticalAlign: "middle",
    fontSize: "16px",
    color: "#495057",
  },
}));

export default function Footer() {
  const classes = useStyles();
  return (
    <div className={classes.footer}>
      <span className={classes.text}>Powered by Clowder</span>
      <img className={classes.logo} src="../../public/assets/clowder-logo-sm.svg" alt="clowder-logo" width="50" height="50" />
    </div>
  );
} 