import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Moralis from "moralis";
import { abi } from "./abi"; // Import the ABI

const BATCH_TRANSFER_ADDRESS = "0x19c5C11D24efc8D7528c2E747908dFd6f4b94A42";
const TOKEN_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const App: React.FC = () => {
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [checkAddresses, setCheckAddresses] = useState<string>("");
  const [otherBalances, setOtherBalances] = useState<{ [key: string]: string }>(
    {}
  );
  const [error, setError] = useState<string>("");
  const [batchRecipients, setBatchRecipients] = useState<string>("");
  const [batchAmounts, setBatchAmounts] = useState<string>("");
  const [isToken, setIsToken] = useState<boolean>(false);
  const [tokenAddress, setTokenAddress] = useState<string>(TOKEN_ADDRESS);

  // Initialize Moralis
  useEffect(() => {
    const initializeMoralis = async () => {
      try {
        await Moralis.start({
          apiKey:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjU0NzU1Zjc3LWRkYWUtNDFlNS04MjFmLTAyMmViZDExMTNjYSIsIm9yZ0lkIjoiNDE1MzUyIiwidXNlcklkIjoiNDI2ODUzIiwidHlwZUlkIjoiN2E4ZDJhNDItZmU1OC00Zjg0LWE4ZDItZTE1N2YxZmUzNjA5IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MzEwNTc3MzQsImV4cCI6NDg4NjgxNzczNH0.4C5GZcc_LhrF4v0_vEZruYqmQDszX4Og6TFY8zsuAg8", // Replace with your actual API key
        });
      } catch (error) {
        console.error("Error initializing Moralis:", error);
      }
    };
    initializeMoralis();
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        await getBalance(accounts[0]);
      } else {
        setError("Please install MetaMask!");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting wallet");
    }
  };

  // Get balance function
  const getBalance = async (address: string) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(balance));
    } catch (err) {
      console.error(err);
      setError("Error fetching balance");
    }
  };

  // Send transaction function
  const sendTransaction = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Check if it's an ENS name using Moralis
      let resolvedAddress = recipient;
      if (recipient.endsWith(".eth")) {
        const response = await Moralis.EvmApi.resolve.resolveENSDomain({
          domain: recipient,
        });

        if (response) {
          resolvedAddress = response.raw?.address || "";
          if (!resolvedAddress) throw new Error("Invalid ENS name");
        } else {
          throw new Error("No response from ENS resolution");
        }
      }

      const tx = await signer.sendTransaction({
        to: resolvedAddress,
        value: ethers.utils.parseEther(amount),
      });

      await tx.wait();
      await getBalance(account);
    } catch (err) {
      console.error("Transaction error:", err);
      setError("Transaction failed: " + (err as Error).message);
    }
  };

  // Check multiple balances
  const checkMultipleBalances = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const addresses = checkAddresses.split(",").map((addr) => addr.trim());
      const balances: { [key: string]: string } = {};

      for (const addr of addresses) {
        let resolvedAddr = addr;
        if (addr.endsWith(".eth")) {
          const response = await Moralis.EvmApi.resolve.resolveENSDomain({
            domain: addr,
          });

          if (response) {
            resolvedAddr = response.raw?.address || addr; // Get the resolved Ethereum address
            if (!resolvedAddr) {
              balances[addr] = "Invalid ENS name";
              continue;
            }
          } else {
            balances[addr] = "Resolution failed";
            continue;
          }
        }

        const balance = await provider.getBalance(resolvedAddr);
        balances[addr] = ethers.utils.formatEther(balance);
      }

      setOtherBalances(balances);
    } catch (err) {
      console.error(err);
      setError("Error checking balances");
    }
  };

  const handleBatchTransfer = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(BATCH_TRANSFER_ADDRESS, abi, signer);

      // Parse recipients and amounts
      const rawRecipients = batchRecipients
        .split(",")
        .map((addr) => addr.trim());
      const amounts = batchAmounts
        .split(",")
        .map((amount) => ethers.utils.parseEther(amount.trim()));

      // Validate inputs
      if (rawRecipients.length === 0 || amounts.length === 0) {
        throw new Error("Recipients and amounts cannot be empty");
      }
      if (rawRecipients.length !== amounts.length) {
        throw new Error("Number of recipients must match number of amounts");
      }

      // Resolve ENS names and validate addresses
      const recipients = await Promise.all(
        rawRecipients.map(async (recipient) => {
          if (recipient.endsWith(".eth")) {
            const response = await Moralis.EvmApi.resolve.resolveENSDomain({
              domain: recipient,
            });
            const resolvedAddress = response?.raw?.address;
            if (!resolvedAddress)
              throw new Error(`Could not resolve ENS name: ${recipient}`);
            return resolvedAddress;
          }
          if (!ethers.utils.isAddress(recipient)) {
            throw new Error(`Invalid address format: ${recipient}`);
          }
          return recipient;
        })
      );

      let tx;
      if (isToken) {
        // Handle ERC20 token transfer
        const tokenContract = new ethers.Contract(
          tokenAddress,
          [
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function balanceOf(address account) public view returns (uint256)",
          ],
          signer
        );

        const totalAmount = amounts.reduce((a, b) => a.add(b));

        // Check token balance
        const balance = await tokenContract.balanceOf(
          await signer.getAddress()
        );
        if (balance.lt(totalAmount)) {
          throw new Error("Insufficient token balance");
        }

        // Approve tokens first
        const approveTx = await tokenContract.approve(
          BATCH_TRANSFER_ADDRESS,
          totalAmount
        );
        await approveTx.wait();

        // Execute batch transfer
        tx = await contract.batchTransferToken(
          tokenAddress,
          recipients,
          amounts
        );
      } else {
        // Handle native ETH transfer
        const totalAmount = amounts.reduce((a, b) => a.add(b));

        // Check ETH balance
        const balance = await provider.getBalance(await signer.getAddress());
        if (balance.lt(totalAmount)) {
          throw new Error("Insufficient ETH balance");
        }

        // Execute batch transfer
        tx = await contract.batchTransferNative(recipients, amounts, {
          value: totalAmount,
        });
      }

      // Wait for transaction confirmation
      setError("Transaction pending...");
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        setError("Batch transfer successful!");
        setBatchRecipients("");
        setBatchAmounts("");
      } else {
        throw new Error("Transaction failed");
      }
    } catch (err) {
      console.error("Transaction error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError("Transaction failed: " + errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
      <div className="text-center p-8 rounded-lg shadow-lg bg-opacity-80 bg-gray-800 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Web3 Wallet Interface</h1>

        {/* Wallet Connection */}
        <button
          onClick={connectWallet}
          className="inline-block px-6 py-2 bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 mb-4"
        >
          {account
            ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
            : "Connect Wallet"}
        </button>

        {account && (
          <div className="mb-4">
            <p className="text-lg">Balance: {balance} ETH</p>
          </div>
        )}

        {/* Send Transaction Form */}
        <div className="mb-6">
          <h2 className="text-2xl mb-2">Send Transaction</h2>
          <input
            type="text"
            placeholder="Recipient Address or ENS"
            className="w-full mb-2 p-2 rounded text-black"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount in ETH"
            className="w-full mb-2 p-2 rounded text-black"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            onClick={sendTransaction}
            className="bg-green-500 px-6 py-2 rounded hover:bg-green-600"
          >
            Send
          </button>
        </div>

        {/* Check Multiple Balances */}
        <div className="mb-4">
          <h2 className="text-2xl mb-2">Check Other Balances</h2>
          <textarea
            placeholder="Enter addresses or ENS names (comma-separated)"
            className="w-full mb-2 p-2 rounded text-black"
            value={checkAddresses}
            onChange={(e) => setCheckAddresses(e.target.value)}
          />
          <button
            onClick={checkMultipleBalances}
            className="bg-purple-500 px-6 py-2 rounded hover:bg-purple-600"
          >
            Check Balances
          </button>
        </div>

        {/* Display Other Balances */}
        {Object.keys(otherBalances).length > 0 && (
          <div className="mt-4">
            <h3 className="text-xl mb-2">Other Wallet Balances:</h3>
            {Object.entries(otherBalances).map(([addr, bal]) => (
              <p key={addr}>
                {addr}: {bal} ETH
              </p>
            ))}
          </div>
        )}

        {/* Batch Transfer Section - available to all users */}
        <div className="mb-6 mt-8">
          <h2 className="text-2xl mb-4">Batch Transfer</h2>

          {/* Toggle between Native and Token */}
          <div className="mb-4">
            <button
              onClick={() => setIsToken(false)}
              className={`mr-2 px-4 py-2 rounded ${
                !isToken ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              Native ETH
            </button>
            <button
              onClick={() => setIsToken(true)}
              className={`px-4 py-2 rounded ${
                isToken ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              ERC20 Token
            </button>
          </div>

          {isToken && (
            <input
              type="text"
              placeholder="Token Address"
              className="w-full mb-2 p-2 rounded text-black"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
            />
          )}

          <textarea
            placeholder="Recipients (comma-separated addresses or ENS names)"
            className="w-full mb-2 p-2 rounded text-black"
            value={batchRecipients}
            onChange={(e) => setBatchRecipients(e.target.value)}
          />
          <textarea
            placeholder="Amounts (comma-separated, in ETH/tokens)"
            className="w-full mb-2 p-2 rounded text-black"
            value={batchAmounts}
            onChange={(e) => setBatchAmounts(e.target.value)}
          />
          <button
            onClick={handleBatchTransfer}
            className="bg-green-500 px-6 py-2 rounded hover:bg-green-600"
            disabled={!account}
          >
            Execute Batch Transfer
          </button>
        </div>

        {/* Error Display */}
        {error && <div className="text-red-400 mt-4">{error}</div>}
      </div>
    </div>
  );
};

export default App;
