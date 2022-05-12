import React, { Component, useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import Web3 from "web3";
// import yesno from 'yesno';
import { useWeb3React } from "@web3-react/core";
import { useRouter } from "next/router";
import data from "./data.json";
import { InjectedConnector } from "@web3-react/injected-connector";

var Tx = require("ethereumjs-tx").Transaction;
var Common = require("ethereumjs-common").default;
var fs = require("fs");

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const {
    connector,
    account,
    activate,
    deactivate,
    library,
    error,
    ...r
  } = useWeb3React();
  const freeze = Object.freeze;
  const WALLET_TYPES = freeze({
    INJECTED: "injected",
  });
  const NetworkMap = {
    BSCMainnet: 56,
    BSCTestNetwork: 97,
  };
  const SUPPORTED_CONNECTORS = freeze([WALLET_TYPES.INJECTED]);

  const SUPPORTED_CHAIN_IDS = [
    NetworkMap.BSCMainnet,
    NetworkMap.BSCTestNetwork,
  ];
  const LOCAL_STORAGE_KEYS = freeze({
    CONNECTED: "connected",
  });
  const injected = new InjectedConnector({
    supportedChainIds: SUPPORTED_CHAIN_IDS,
  });

  const chainId = 56;
  const web3RpcUrl = "https://bsc-dataseed.binance.org";

  const swapParams = {
    toTokenAddress: "0x90Ed8F1dc86388f14b64ba8fb4bbd23099f18240", // SDAO
    fromTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // BNB
    amount: 100000000000000000,
    fromAddress: walletAddress,
    slippage: 0.5,
    disableEstimate: false,
    allowPartialFill: false,
    nonce: 1,
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

  // SPECIFY_THE_AMOUNT_OF_BNB_YOU_WANT_TO_BUY_FOR_HERE

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
    console.log("transactiontransaction", transaction);
    let accs = await web3.eth.getAccounts();
    console.log("accs", accs);
    const currentNetwork = await web3.eth.getChainId();
    console.log("currentNetwork", currentNetwork);
    web3.defaultAccount = web3.utils.toChecksumAddress(
      "0xC06483D50DB87909241b7186EDD6e250dC4677d4",
      currentNetwork
    );

    accs = await web3.eth.getAccounts();
    console.log("manually set acc", accs);

    const signPromise = await web3.eth.signTransaction(
      transaction,
      transaction.from
    );
    console.log("signPromise", signPromise);
  }

  async function buildTxForApproveTradeWithRouter(tokenAddress, amount) {
    const url = apiRequestUrl(
      "/approve/transaction",
      amount ? { tokenAddress, amount } : { tokenAddress }
    );

    const transaction = await fetch(url).then((res) => res.json());
    console.log("transaction", transaction, walletAddress);
    const gasLimit = await web3.eth.estimateGas({
      ...transaction,
      from: walletAddress,
    });
    console.log("gasLimit", gasLimit, transaction);

    return {
      ...transaction,
      gas: gasLimit,
      from: walletAddress,
    };
  }
  async function buildTxForSwap(swapParams) {
    const url = apiRequestUrl("/swap", swapParams);

    return fetch(url)
      .then((res) => res.json())
      .then((res) => res.tx);
  }
  const handleSwap = async () => {
    console.log("swap");
    // console.log('....',connector, account, activate, deactivate, chainId, library, error)
 
    const allowance = await checkAllowance(
      swapParams.fromTokenAddress,
      walletAddress
    );

    console.log("Allowance: ", allowance);
    // First, let's build the body of the transaction
    const transactionForSign = await buildTxForApproveTradeWithRouter(
      swapParams.fromTokenAddress
    );
    console.log("Transaction for approve: ", transactionForSign);
    // console.log("nonce tx noncenonce: ", await web3.eth.getTransactionCount(walletAddress));
    // Send a transaction and get its hash
    const approveTxHash = await signAndSendTransaction(transactionForSign);

    console.log("Approve tx hash: ", approveTxHash);
    let nonce = await web3.eth.getTransactionCount();
    console.log("nonce tx noncenonce: ", nonce);

    swapParams.nonce = nonce;
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
      {walletAddress ? (
        <div>connected account:{walletAddress}</div>
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
          onClick={connectWallet}
        >
          {walletAddress ? "connected" : "connect"}
        </a>
      </header>
    </div>
  );
}

export default App;
