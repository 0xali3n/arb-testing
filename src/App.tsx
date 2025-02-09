import React, { useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import BackgroundParticles from "./BackgroundParticles";
import logo from "../public/logo.png"; // Make sure logo is in this path

interface Profile {
  id: string;
  name: string;
  address: string;
  ens: string;
  image: string;
  role: string;
}

const App: React.FC = () => {
  const [account, setAccount] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [donateAmount, setDonateAmount] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successProfile, setSuccessProfile] = useState<Profile | null>(null);

  // Sample profiles data
  const profiles: Profile[] = [
    {
      id: "1",
      name: "Alex Rivers",
      address: "0xB7d4369AbFa74AED05d7db358dC3373d787B8997",
      ens: "alex.eth",
      image: "logo/1.webp",
      role: "Lead Developer",
    },
    {
      id: "2",
      name: "Sarah Chen",
      address: "0xbe7f6bBE7f0B5A93CdB4BD8E557896cE2ae695F1",
      ens: "sarah.eth",
      image: "logo/2.webp",
      role: "Community Manager",
    },
  ];

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        setError("");
      } else {
        setError("Please install MetaMask!");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting wallet");
    }
  };

  // Handle donation function
  const handleDonate = (profile: Profile) => {
    if (!account) {
      connectWallet();
      return;
    }
    setSelectedProfile(profile);
    setShowDonateModal(true);
  };

  // Send transaction function
  const sendTransaction = async () => {
    if (!selectedProfile || !donateAmount) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const tx = await signer.sendTransaction({
        to: selectedProfile.address,
        value: ethers.utils.parseEther(donateAmount),
      });

      await tx.wait();
      setShowDonateModal(false);
      setDonateAmount("");
      setSuccessProfile(selectedProfile);
      setShowSuccessModal(true);

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        setSuccessProfile(null);
      }, 5000);
    } catch (err) {
      console.error("Transaction error:", err);
      setError("Transaction failed: " + (err as Error).message);
    }
  };

  // Handle scroll function
  const handleScroll = (direction: "up" | "down") => {
    const container = document.getElementById("profiles-container");
    if (container) {
      const scrollAmount = 200;
      const currentScroll = container.scrollTop;
      const targetScroll =
        direction === "up"
          ? Math.max(0, currentScroll - scrollAmount)
          : Math.min(
              container.scrollHeight - container.clientHeight,
              currentScroll + scrollAmount
            );

      container.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    }
  };

  // Filter profiles based on search
  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.ens.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-[#0A192F] text-white overflow-hidden">
      {/* Dynamic Background Elements */}
      <BackgroundParticles />
      <div className="fixed inset-0 pointer-events-none">
        {/* Floating Star-like Particles */}

        {[...Array(50)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className={`absolute rounded-full ${
              i % 3 === 0
                ? "w-1.5 h-1.5 bg-cyan-400/20"
                : i % 2 === 0
                ? "w-1 h-1 bg-blue-400/20"
                : "w-0.5 h-0.5 bg-white/20"
            }`}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}

        {/* Gradient Orbs */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-[500px] h-[500px] rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2,
            }}
            style={{
              background: `radial-gradient(circle, ${
                i % 2 === 0 ? "rgba(34,211,238,0.1)" : "rgba(37,99,235,0.1)"
              } 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `translate(-50%, -50%)`,
            }}
          />
        ))}

        {/* Background Gradient Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 bg-[#0A192F]/80 backdrop-blur-sm z-20 border-b border-white/5">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between py-4">
              {/* Logo and Title Section */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <img
                      src={logo}
                      alt="W3Chat Logo"
                      className="h-8 w-auto mr-2"
                    />
                    <div className="hidden sm:block">
                      <span className="ml-2 text-sm bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full">
                        Donation
                      </span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <p className="text-gray-400 text-sm">Secure Web3 Donations</p>
                </div>
              </div>

              {/* Connect Wallet Button */}
              <button
                onClick={connectWallet}
                className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 border border-cyan-500/20 whitespace-nowrap"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>

        {/* Search and Content */}
        <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28">
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto relative">
            <input
              type="text"
              placeholder="Search by name or ENS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-12 py-3 sm:py-4 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/30 transition-all text-sm sm:text-base"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Profile Cards Grid */}
          <div
            id="profiles-container"
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8"
          >
            {filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-[#151C32] rounded-xl p-6 border border-white/5 hover:border-cyan-500/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={profile.image}
                        alt={profile.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#151C32]"></div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-white">
                          {profile.name}
                        </h2>
                        <svg
                          className="w-4 h-4 text-blue-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <p className="text-blue-400/70 text-sm">{profile.role}</p>
                      <p className="text-gray-400 text-sm font-mono mt-1">
                        {profile.ens}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDonate(profile)}
                    className="bg-[#1A2847] hover:bg-[#243561] text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Donate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-30">
          <div className="bg-[#151C32] rounded-xl p-6 w-full max-w-sm border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedProfile?.image}
                  alt={selectedProfile?.name}
                  className="w-12 h-12 rounded-full ring-2 ring-cyan-400"
                />
                <div>
                  <h3 className="font-bold text-white">
                    {selectedProfile?.name}
                  </h3>
                  <p className="text-cyan-400 text-sm">
                    {selectedProfile?.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDonateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <input
              type="number"
              placeholder="Amount in ETH"
              className="w-full mb-4 p-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              value={donateAmount}
              onChange={(e) => setDonateAmount(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDonateModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendTransaction}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-30">
          <div className="bg-[#151C32] rounded-xl p-6 text-center border border-white/20">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Transaction Successful!
            </h3>
            <p className="text-gray-400">
              Your donation to {successProfile?.name} has been sent
              successfully.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default App;
