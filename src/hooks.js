import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import React, { Component, useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import Web3 from "web3";
// import yesno from 'yesno';
import { useWeb3React } from "@web3-react/core";
import { MoralisProvider } from "react-moralis";
import { NATIVE_ADDRESS,ONEINCH_ADDRESS, Options } from "./constant";

export function useMoralisFunctions() {
  const [blockNumber, setBlockNumber] = useState();
  const[token,setTokens]=useState('');
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

  const init =async () => {
      console.log("in init file",Options)
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
         
    let amount = Number(Options.amount);
    // let amount = Number(fromAmount) * 10**fromTokenDecimals;

    const quote = await Moralis.Plugins.oneInch.quote({
    chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
    fromTokenAddress: Options.fromTokenAddress, // The token you want to swap
    toTokenAddress: Options.toTokenAddress, // The token you want to receive
    amount: amount,
    });
    console.log('quote',quote);
    return quote
}
const fetchTokenAllowance = async () => {
//Get token allowace on ETH
const allowanceOptions = {
  chain :'bsc',
  //token holder
  owner_address: Options.fromAddress,
  //uniswap v3 router 2 contract address
  spender_address: NATIVE_ADDRESS,
  //ENS token contract address
  address: ONEINCH_ADDRESS,
  amount:Options.amount
};
const allowance = await Web3Api.token.getTokenAllowance(allowanceOptions);
console.log(allowance);
};
const listAvailableTokens = async () => {
const result = await Moralis.Plugins.oneInch.getSupportedTokens({
  chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
});
const tokensObject = await result.tokens;
setTokens(tokensObject)
// const tokensImg = Object.values(tokensObject).map(val => val.logoURI);
// setImgVal(tokensImg)
};
const  trySwap=async ()=>  {
console.log("inside try swap")

      let amount = Number(Options.amount);
          // const allowance = await Moralis.Plugins.oneInch.hasAllowance({
          // chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
          // fromTokenAddress: Options.fromTokenAddress, // The token you want to swap
          // fromAddress: Options.fromAddress, // Your wallet address
          // amount: amount,
          // });
          const allowance=await fetchTokenAllowance();
          // if (!allowance.allowance) {
          // await Moralis.Plugins.oneInch.approve({
          //     chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
          //     tokenAddress: Options.fromTokenAddress, // The token you want to swap
          //     fromAddress: Options.fromAddress, // Your wallet address
          // });
          // }
      
      try {
          let receipt = await doSwap(Options.fromAddress, amount,Options.fromTokenAddress,Options.toTokenAddress);
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

 


  return {
    init,doSwap,trySwap,fetchTokenAllowance,listAvailableTokens,getQuote
  };
}
