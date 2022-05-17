import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './swap1';
import reportWebVitals from './reportWebVitals';
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from "web3";
import { MoralisProvider } from "react-moralis";

const root = ReactDOM.createRoot(document.getElementById('root'));
function getLibrary(provider) {
  return new Web3(provider)
}
const serverUrl = "https://ozfp7sh4bzvf.usemoralis.com:2053/server"
const appId = "qARyN5DQ2Ql54kBj34ewH4qLV1qSueNR7Ina6X6w"

root.render(
  <React.StrictMode>
        <Web3ReactProvider getLibrary={getLibrary}>
        <MoralisProvider appId={serverUrl} serverUrl={appId}>


    <App />
    </MoralisProvider>
    </Web3ReactProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
