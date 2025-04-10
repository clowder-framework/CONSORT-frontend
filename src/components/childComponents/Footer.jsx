import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { theme } from '../../theme';
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
    color: theme.palette.secondary.main,
    // do not change color of the link
    "& a": {
      color: theme.palette.secondary.main,
    },
    "& a:hover": {
      color: theme.palette.secondary.dark,
    },
    "& a:active": {
      color: theme.palette.secondary.dark,
    },
    "& a:visited": {
      color: theme.palette.secondary.dark,
    },
    "& a:focus": {
      color: theme.palette.secondary.dark,
    },

  },
}));

export default function Footer() {
  const classes = useStyles();
  return (
    <>
      <div className={classes.footer}>
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ gridColumn: '1 / span 1', gridRow: '1 / span 1' }}>
            <span className={classes.text} style={{color: theme.palette.secondary.dark}}>
              See our Scientific Data paper for further details.
            </span>
          <div style={{ height: '20px' }}></div>
          <span className={classes.text} style={{color: theme.palette.secondary.dark}}>
            Jiang L, Vorland CJ, Ying X, Brown AW, Menke JD, Hong G, Lan M, Mayo-Wilson E, Kilicoglu H.  
            <div>
              <a href="https://doi.org/10.1038/s41597-025-04629-1" target="_blank" rel="noopener noreferrer" className={classes.citation} style={{color: theme.palette.secondary.dark}}>
                SPIRIT-CONSORT-TM: a corpus for assessing transparency of clinical trial protocol and results publications.
              </a>
            </div>
            <div>
              Scientific Data. 2025;12(1):355.
            </div>
          </span>
          </div>
          <div style={{ gridColumn: '2 / span 1', gridRow: '1 / span 1' }}>
            <span className={classes.text} style={{color: theme.palette.secondary.dark}}>
                Powered by <a href="https://consort.clowderframework.org/clowder/" target="_blank" rel="noopener noreferrer" style={{color: theme.palette.secondary.dark}}>Clowder</a>
            </span>
          </div>
        </div>
      </div>
    </>
  );
} 