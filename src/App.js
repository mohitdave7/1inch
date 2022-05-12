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
    var originalAmountToBuyWith =
      "0.007" +
      Math.random()
        .toString()
        .slice(2, 7);
    var bnbAmount = web3.utils.toWei(originalAmountToBuyWith, "ether");

    var targetAccounts = [
      { address: walletAddress },
      { address: walletAddress },
      { address: walletAddress },
    ];
    console.log("targetAccounts", targetAccounts);

    var targetIndex = Number(process.argv.splice(2)[0]);
    var targetAccount = targetAccounts[targetIndex];

    console.log(
      `Buying ONLYONE for ${originalAmountToBuyWith} BNB from pancakeswap for address ${targetAccount.address}`
    );

    async function buyOnlyone(targetAccount, amount) {
      var amountToBuyWith = web3.utils.toHex(amount);
      var privateKey = Buffer.from(targetAccount.privateKey.slice(2), "hex");
      var abiArray = JSON.parse(
        JSON.parse(fs.readFileSync("onlyone-abi.json", "utf-8"))
      );
      var tokenAddress = "0xb899db682e6d6164d885ff67c1e676141deaaa40"; // ONLYONE contract address
      var WBNBAddress = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"; // WBNB token address

      // var onlyOneWbnbCakePairAddress = '0xd22fa770dad9520924217b51bf7433c4a26067c2';
      // var pairAbi = JSON.parse(fs.readFileSync('cake-pair-onlyone-bnb-abi.json', 'utf-8'));
      // var pairContract = new web3.eth.Contract(pairAbi, onlyOneWbnbCakePairAddress/*, {from: targetAccount.address}*/);
      var amountOutMin =
        "100" +
        Math.random()
          .toString()
          .slice(2, 6);
      var pancakeSwapRouterAddress =
        "0x10ed43c718714eb63d5aa57b78b54704e256024e";

      var routerAbi = JSON.parse(
        fs.readFileSync("pancake-router-abi.json", "utf-8")
      );
      var contract = new web3.eth.Contract(
        routerAbi,
        pancakeSwapRouterAddress,
        { from: targetAccount.address }
      );
      var data = contract.methods.swapExactETHForTokens(
        web3.utils.toHex(amountOutMin),
        [WBNBAddress, tokenAddress],
        targetAccount.address,
        web3.utils.toHex(Math.round(Date.now() / 1000) + 60 * 20)
      );

      var count = await web3.eth.getTransactionCount(targetAccount.address);
      var rawTransaction = {
        from: targetAccount.address,
        gasPrice: web3.utils.toHex(5000000000),
        gasLimit: web3.utils.toHex(290000),
        to: pancakeSwapRouterAddress,
        value: web3.utils.toHex(amountToBuyWith),
        data: data.encodeABI(),
        nonce: web3.utils.toHex(count),
      };

      var transaction = new Tx(rawTransaction, { common: BSC_FORK });
      transaction.sign(privateKey);

      var result = await web3.eth.sendSignedTransaction(
        "0x" + transaction.serialize().toString("hex")
      );
      console.log(result);
      return result;
    }
    var res = buyOnlyone(targetAccounts[targetIndex], bnbAmount);
    console.log("aaaaa", res);
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
