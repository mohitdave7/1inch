    import { useMoralis, useMoralisWeb3Api } from "react-moralis";
    import React, { Component, useState, useEffect } from "react";
    import logo from "./logo.svg";
    import "./App.css";
    import Web3 from "web3";
    // import yesno from 'yesno';
    import { useWeb3React } from "@web3-react/core";
    import { MoralisProvider } from "react-moralis";
    import {useMoralisFunctions} from './hooks';

    
 
    function App() {
      const [walletAddress, setWalletAddress] = useState("");
      const [signature,setSignature]=useState('');
      const { active, account, library, connector, activate, deactivate,chainId } = useWeb3React()
      const {
        authenticate,
        isWeb3Enabled,
        isAuthenticated,
        isAuthenticating,
        user,
        enableWeb3,
        logout,
        authError,
        userError,
        Moralis,
        web3,
      } = useMoralis();
      const { init ,getQuote,trySwap} = useMoralisFunctions()

      const[token,setTokens]=useState('');
    
      const Web3Api = useMoralisWeb3Api();
    
    
     
    
 
    const swap = async () => {
      await init();
      console.log('from swap',Moralis.Units.ETH)
      console.log('from user',Moralis.User)

      const quote=await getQuote();
      const allowance=await trySwap();
      console.log('...',quote)
   

  }

    
      return (
    
        <div className="App">
          {active ? (
            <div>connected account:{account}</div>
          ) : (
            "please connect"
          )}
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
    
            <a className="App-link" rel="noopener noreferrer" onClick={swap}>
              swap
            </a>
            <a
              className="App-link"
              rel="noopener noreferrer"
              // onClick={connect}
            >
    {/* {active ? <span>Connected with <b>{account}</b></span> : <span>Not connected</span>} */}
            </a>
          </header>
        </div>
    
      );
    }
    
    export default App;
    