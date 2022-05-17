    import { useMoralis, useMoralisWeb3Api } from "react-moralis";
    import React, { Component, useState, useEffect } from "react";
    import logo from "./logo.svg";
    import "./App.css";
    import Web3 from "web3";
    // import yesno from 'yesno';
    import { useWeb3React } from "@web3-react/core";
    import { MoralisProvider } from "react-moralis";

    
 
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
    
      const Web3Api = useMoralisWeb3Api();
    
    
      const swapParams = {
        fromTokenAddress: "0x90Ed8F1dc86388f14b64ba8fb4bbd23099f18240", // SDAO
        toTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // BNB
        amount: 10000000000000000000,
        fromAddress: account,
        slippage: 0.5,
        disableEstimate: false,
        allowPartialFill: false,
        nonce: '0x00', // ignored by MetaMask
        chainId,
       
      };
      const NATIVE_ADDRESS = "0x90Ed8F1dc86388f14b64ba8fb4bbd23099f18240";
      const ONEINCH_ADDRESS = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";

  
      const options = {
          chainId: 56,
          fromTokenAddress: NATIVE_ADDRESS,
          toTokenAddress: ONEINCH_ADDRESS,
          amount: '10000000000000000000',
          fromAddress: '0xC06483D50DB87909241b7186EDD6e250dC4677d4',
          slippage: 100000000000000000000,
          disableEstimate: false,
          allowPartialFill: false,
          
      }
    const init =async () => {
      let serverUrl = "https://ozfp7sh4bzvf.usemoralis.com:2053/server"
      let appId = "qARyN5DQ2Ql54kBj34ewH4qLV1qSueNR7Ina6X6w"
      Moralis.start({ serverUrl, appId });
      await Moralis.initPlugins();
      var dex = Moralis.Plugins.oneInch;
      await Moralis.enableWeb3();
      console.log('user')
      const user = await Moralis.authenticate();
  
              console.log('user',user)
    var currentUser = Moralis.User.current();
    console.log('user',currentUser)
  
    if (currentUser) {
      console.log('user',currentUser)
    }
    }
        const getQuote = async () => {
              console.log('dorm quote')
              const NATIVE_ADDRESS = "0x90Ed8F1dc86388f14b64ba8fb4bbd23099f18240";
              const ONEINCH_ADDRESS = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
        
          
              const options = {
                  chainId: 56,
                  fromTokenAddress: NATIVE_ADDRESS,
                  toTokenAddress: ONEINCH_ADDRESS,
                  amount: '10000000000000000000',
                  fromAddress: '0xC06483D50DB87909241b7186EDD6e250dC4677d4',
                  slippage: 100000000000000000000,
                  disableEstimate: false,
                  allowPartialFill: false,
                  
              }

      let amount = Number(options.amount);

      const quote = await Moralis.Plugins.oneInch.quote({
      chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: options.fromTokenAddress, // The token you want to swap
      toTokenAddress: options.toTokenAddress, // The token you want to receive
      amount: amount,
      });
      console.log('quote',quote);
      return quote
}
const  trySwap=async ()=>  {
  console.log("inside try swap")
  const NATIVE_ADDRESS = "0x90Ed8F1dc86388f14b64ba8fb4bbd23099f18240";
  const ONEINCH_ADDRESS = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";

    
        const options = {
            chainId: 56,
            fromTokenAddress: NATIVE_ADDRESS,
            toTokenAddress: ONEINCH_ADDRESS,
            amount: '10000000000000000000',
            fromAddress: '0xC06483D50DB87909241b7186EDD6e250dC4677d4',
            slippage: 100000000000000000000,
            disableEstimate: false,
            allowPartialFill: false,
            
        }
        let amount = Number(options.amount);
            const allowance = await Moralis.Plugins.oneInch.hasAllowance({
            chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
            fromTokenAddress: options.fromTokenAddress, // The token you want to swap
            fromAddress: options.fromAddress, // Your wallet address
            amount: amount,
            });
            console.log('allowance',allowance);
            if (!allowance) {
            await Moralis.Plugins.oneInch.approve({
                chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
                tokenAddress: options.fromTokenAddress, // The token you want to swap
                fromAddress: options.fromAddress, // Your wallet address
            });
            }
        
        try {
            let receipt = await doSwap(options.fromAddress, amount,options.fromTokenAddress,options.toTokenAddress);
            alert("Swap Complete");
            console.log('receipt',receipt)
        } catch (error) {
            console.log(error);
        }
}
    const  doSwap=(userAddress, amount,add1,add2)=> {
        console.log('swap')
        return Moralis.Plugins.oneInch.swap({
        chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: add1, // The token you want to swap
        toTokenAddress: add2, // The token you want to receive
        amount: amount,
        fromAddress: userAddress, // Your wallet address
        slippage: 1,
        });
    }
    const swap = async () => {
      console.log('from swap')
       await init();

      const quote=await getQuote();
      const allowance=await trySwap();
      console.log('...',quote)
      const NATIVE_ADDRESS = "0x90Ed8F1dc86388f14b64ba8fb4bbd23099f18240";
      const ONEINCH_ADDRESS = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";




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
    