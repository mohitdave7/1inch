import React, { Component, useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import Web3 from "web3";
// import yesno from 'yesno';
import { useWeb3React } from "@web3-react/core";
import { useRouter } from "next/router";
import {ethers} from "ethers"
import { InjectedConnector } from '@web3-react/injected-connector'

var Tx = require("ethereumjs-tx").Transaction;
var Common = require("ethereumjs-common").default;
 const injected = new InjectedConnector({
  supportedChainIds: [56],
})
function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [signature,setSignature]=useState('');
  const { active, account, library, connector, activate, deactivate,chainId } = useWeb3React()
  async function connect() {
    try {
      await activate(injected)
    } catch (ex) {
      console.log(ex)
    }
  }

  async function disconnect() {
    try {
      deactivate()
    } catch (ex) {
      console.log(ex)
    }
  }
  function getLibrary(provider) {
    return new Web3(provider)
  }
  // const chainId = 56;
  const web3RpcUrl = "https://bsc-dataseed.binance.org";

  const swapParams = {
    toTokenAddress: "0x90Ed8F1dc86388f14b64ba8fb4bbd23099f18240", // SDAO
    fromTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // BNB
    amount: 100000000000000000,
    fromAddress: account,
    slippage: 0.5,
    disableEstimate: false,
    allowPartialFill: false,
    nonce: '0x00', // ignored by MetaMask
    chainId,
   
  };
  const broadcastApiUrl =
    "https://tx-gateway.1inch.io/v1.1/" + chainId + "/broadcast";
  const apiBaseUrl = "https://api.1inch.io/v4.0/" + chainId;
  // const web3 = new Web3(web3RpcUrl);

  var web3 = new Web3(
    new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/")
  );
  var BSC_FORK = Common.forCustomChain(
    "mainnet",
    {
      name: "Binance Smart Chain Mainnet",
      networkId: 56,
      chainId: 56,
      url: "https://bsc-dataseed.binance.org/",
    },
    "istanbul"
  );
  function apiRequestUrl(methodName, queryParams) {
    return (
      apiBaseUrl +
      methodName +
      "?" +
      new URLSearchParams(queryParams).toString()
    );
  }

  function checkAllowance(tokenAddress, walletAddress) {
    return fetch(
      apiRequestUrl("/approve/allowance", { tokenAddress, walletAddress })
    )
      .then((res) => res.json())
      .then((res) => res.allowance);
  }

  async function broadCastRawTransaction(rawTransaction) {
    return fetch(broadcastApiUrl, {
      method: "post",
      body: JSON.stringify({ rawTransaction }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((res) => {
        return res.transactionHash;
      });
  }

  async function signAndSendTransaction(transaction) {
// console.log('transaction',transaction)
// const web3 = new Web3(window.ethereum);
// const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
// var account = accounts[0];
// account = web3.utils.toChecksumAddress(account);
// transaction.from=account;
// console.log(transaction,'>>>')
console.log('...........',transaction)
const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    const signer = await provider.getSigner(account);

const signPromise = await signer.signTransaction(transaction)
console.log(signer,'cccccccccc',signPromise)
// console.log("signPromise", signPromise);
const {rawTransaction} = await web3.eth.signTransaction(transaction);
// console.log('rawTransactionrawTransactionrawTransactionrawTransaction',rawTransaction)
// const {rawTransaction} = await web3.eth.accounts.signTransaction(transaction, privateKey);
console.log('signPromise',signPromise)
console.log('rawTransaction',rawTransaction)

return await broadCastRawTransaction(rawTransaction);
  }

  async function buildTxForApproveTradeWithRouter(tokenAddress, amount) {
    const url = apiRequestUrl(
      "/approve/transaction",
      amount ? { tokenAddress, amount } : { tokenAddress }
    );
    const transaction = await fetch(url).then((res) => res.json());
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    const signer = provider.getSigner(account);

    const gasPrice = await signer.getGasPrice();
console.log('gasPrice',gasPrice)
    const gasLimit = await web3.eth.estimateGas({
      ...transaction,
      from: account,
    });
    console.log("gasLimit", gasLimit, transaction);

    return {
      ...transaction,
      gasLimit: gasLimit,
      gasPrice,
      from: account,

    };
  }
  async function buildTxForSwap(swapParams) {
    const url = apiRequestUrl("/swap", swapParams);

    return fetch(url)
      .then((res) => res.json())
      .then((res) => res.tx);
  }

  const handleSwap = async () => {
    const allowance = await checkAllowance(
      swapParams.fromTokenAddress,
      walletAddress
    );
    const provider = new ethers.providers.Web3Provider(window.ethereum);
   await provider.send("eth_requestAccounts", []);
  console.log(account,provider)
    const signer = provider.getSigner(account);
    // console.log('library',library)
    // const signer = await library.getSigner();
    console.log(signer)

    // First, let's build the body of the transaction
    const transactionForSign = await buildTxForApproveTradeWithRouter(
      swapParams.fromTokenAddress
    );
    console.log("Transaction for approve: ", transactionForSign);
    let signature = await signer.signMessage('do you want to sign ?')
    setSignature(signature)
    console.log(transactionForSign,'..........')
    // const a = await web3.eth.sendSignedTransaction(signature);
    console.log('....',signature)

// let rwtrs=await broadCastRawTransaction(signer)
// console.log('rwtrs',rwtrs)
// let nonce = await provider.getTransactionCount(walletAddress);
// console.log("nonce tx noncenonce: ", nonce);

// transactionForSign.nonce = nonce;
    const approveTxHash = await signAndSendTransaction(transactionForSign);

    console.log("Approve tx hash: ", approveTxHash);
  
    const swapTransaction = await buildTxForSwap(swapParams);
    console.log("Transaction for swap: ", swapTransaction);

    // Send a transaction and get its hash
    const swapTxHash = await signAndSendTransaction(swapTransaction);
    console.log("Swap transaction hash: ", swapTxHash);
  };
  const connectWallet = async () => {
    console.log("connectwallet");
    console.log(walletAddress);
    // Check if MetaMask is installed on user's browser
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      console.log("chainId", chainId);
      // Check if user is connected to Mainnet
      if (chainId != "0x38") {
        alert("Please connect to BSCMainnet");
      } else {
        let wallet = accounts[0];
        setWalletAddress(wallet);
      }
    } else {
      alert("Please install Mask");
    }
  };

  return (

    <div className="App">
      {active ? (
        <div>connected account:{account}</div>
      ) : (
        "please connect"
      )}
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <a className="App-link" rel="noopener noreferrer" onClick={handleSwap}>
          swap
        </a>
        <a
          className="App-link"
          rel="noopener noreferrer"
          onClick={connect}
        >
{active ? <span>Connected with <b>{account}</b></span> : <span>Not connected</span>}
        </a>
      </header>
    </div>

  );
}

export default App;
