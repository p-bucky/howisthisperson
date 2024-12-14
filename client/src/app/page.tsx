"use client";
import { PinataSDK } from "pinata";
import { PeopleManager } from "@/abis/abi";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const PINATA_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0MWU3YzVhOS02OGM1LTQzOTYtOThkYi0yYTU5N2Y2MzYyY2MiLCJlbWFpbCI6InByYXNoYW50amhhOTk4OUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNTQxOTJlMGY3NDljZjY0MjJjZGQiLCJzY29wZWRLZXlTZWNyZXQiOiI5NTNhMjZmNTI4Yjg1MmFjNWQ3NTk5ZGQ5YzU4NzA1MmJhOWJmZjYwN2NiNDFmN2QwMzQyMDdiOWQ0MmQwNmE3IiwiZXhwIjoxNzY1NzIwNjM4fQ.1PeqLRid5ZpWupEdQSOq4qV3tNTKViDUKWa0nE5OgXY";
const PINATA_GATEWAY = "indigo-academic-mink-330.mypinata.cloud";
const PINATA_GATEWAY_KEY =
  "Wngv7gUaZcTSUbfKXw7SxU6-A83ED8chGxqzUOCqIS0DS30cJtrtyoXWTJuXjcuT";
const CONTRACT_ADDRESS = "0x4b1540e251e49c0672C1fe53B8AAD87b9D16eb96";
const RPC_URL = "https://rpc.blaze.soniclabs.com";
const ITEMS_PER_PAGE = 9;

const Input = ({
  label,
  type = "text",
  placeholder,
  rows,
  onChange,
  value,
}: {
  label: string;
  type?: string;
  placeholder: string;
  rows?: number;
  onChange?: (value: string) => void;
  value?: string;
}) => {
  const baseClasses =
    "px-4 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:border-2 transition-colors duration-200";

  return (
    <div className="flex flex-col">
      <label className="text-green-400 font-medium mb-2">{label}</label>
      {type === "textarea" ? (
        <textarea
          className={baseClasses}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          value={value}
        />
      ) : (
        <input
          type={type}
          className={baseClasses}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          value={value}
        />
      )}
    </div>
  );
};

const Button = ({
  onClick,
  children,
  variant = "primary",
  className = "",
  disabled = false,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "icon";
  className?: string;
  disabled?: boolean;
}) => {
  const baseClasses = "transition-colors duration-200";
  const variants = {
    primary:
      "px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed",
    icon: "text-gray-400 hover:text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const CloseIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const AddPerson = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [name, setName] = useState("");
  const [imgHash, setImgHash] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const uploadToIPFS = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const pinata = new PinataSDK({
        pinataJwt: PINATA_JWT,
        pinataGateway: PINATA_GATEWAY,
        pinataGatewayKey: PINATA_GATEWAY_KEY,
      });
      const result = await pinata.upload.file(file);
      setImgHash(result.cid);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !imgHash || !description) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!window.ethereum) throw new Error("No crypto wallet found");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        PeopleManager,
        signer
      );

      const tx = await contract.addPerson(name, imgHash, description);
      await tx.wait();

      toast.success("Person added successfully!");
      onSuccess(); // Trigger refetch
      onClose(); // Close modal
    } catch (error) {
      console.error("Error adding person:", error);
      toast.error("Failed to add person. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-xl w-full mx-4 animate-slideIn">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-green-400">
            Add New Person
          </h3>
          <Button variant="icon" onClick={onClose}>
            <CloseIcon />
          </Button>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <Input
              label="Name"
              placeholder="Vitalik Buterin"
              value={name}
              onChange={setName}
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Image Upload
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-500 file:text-white
                  hover:file:bg-green-600"
              />
              <Button
                onClick={uploadToIPFS}
                disabled={!file || isUploading}
                className="mt-2"
              >
                {isUploading ? "Uploading..." : "Upload to IPFS"}
              </Button>
              {imgHash && (
                <p className="text-sm text-gray-400 break-all">
                  IPFS Hash: {imgHash}
                </p>
              )}
            </div>
            <Input
              label="Description"
              type="textarea"
              rows={4}
              placeholder="Co-founder of Ethereum, crypto pioneer and researcher. Known for developing the initial implementation of Ethereum and contributing significantly to blockchain technology and cryptocurrency ecosystem."
              value={description}
              onChange={setDescription}
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchBar = () => (
  <div className="w-full max-w-xl mb-8 md:mb-10 px-4 sm:px-6 lg:px-8">
    <div className="flex gap-4 items-end">
      <div className="flex-1">
        <Input type="text" placeholder="Search for a person..." label="" />
      </div>
      <div className="mb-[2px]">
        <Button>Search</Button>
      </div>
    </div>
  </div>
);

interface Person {
  id: string;
  image: string;
  name: string;
  description: string;
}

interface PeopleGridProps {
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  refetchTrigger: number;
}

const PeopleGrid = ({
  currentPage,
  itemsPerPage,
  onPageChange,
  refetchTrigger,
}: PeopleGridProps) => {
  const [fetchedPeople, setFetchedPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const totalPages = Math.ceil(fetchedPeople.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedPeople = fetchedPeople.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    const fetchPeople = async () => {
      setIsLoading(true);
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          PeopleManager,
          provider
        );

        const currentId = await contract.getCurrentId();
        console.log(currentId);
        const people = [];

        const pinata = new PinataSDK({
          pinataJwt: PINATA_JWT,
          pinataGateway: PINATA_GATEWAY,
          pinataGatewayKey: PINATA_GATEWAY_KEY,
          customHeaders: { requestMode: "no-cors" },
        });

        for (let i = 0; i < currentId; i++) {
          const person = await contract.people(i);
          const url = await pinata.gateways.createSignedURL({
            cid: person.imgHash,
            expires: 300000,
          });
          console.log({ url });
          people.push({
            id: person.id.toString(),
            name: person.name,
            image: url,
            description: person.desc,
          });
        }

        console.log({ people });
        setFetchedPeople(people);
      } catch (error) {
        console.error("Error fetching people:", error);
        toast.error("Failed to fetch people");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPeople();
  }, [refetchTrigger]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
        {displayedPeople.map((person) => (
          <div
            key={person.id}
            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
          >
            <img
              src={person.image}
              alt={person.name}
              className="w-full h-64 object-contain"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-green-400 mb-2">
                {person.name}
              </h3>
              <p className="text-gray-300">{person.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center space-x-2 mt-8">
        {(() => {
          const pages = [];
          pages.push(1);

          if (currentPage > 3) pages.push("...");

          for (
            let i = Math.max(2, currentPage - 1);
            i <= Math.min(totalPages - 1, currentPage + 1);
            i++
          ) {
            pages.push(i);
          }

          if (currentPage < totalPages - 2) pages.push("...");
          if (totalPages > 1) pages.push(totalPages);

          return pages.map((page, index) => (
            <button
              key={index}
              onClick={() =>
                typeof page === "number" ? onPageChange(page) : null
              }
              className={`px-4 py-2 rounded-md ${
                page === currentPage
                  ? "bg-green-500 text-white"
                  : page === "..."
                  ? "text-gray-400 cursor-default"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              disabled={page === "..."}
            >
              {page}
            </button>
          ));
        })()}
      </div>
    </>
  );
};

export default function Home() {
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const itemsPerPage = ITEMS_PER_PAGE;

  const handlePersonAdded = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full px-4 py-8 md:py-12 lg:py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animate-gradient">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-400 mb-8 md:mb-10 text-center animate-pulse">
        How is this person?
      </h1>

      <SearchBar />

      <div className="flex flex-col items-center w-full px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl text-gray-300 mb-6 text-center">
          Your Directory for People Information
        </h2>
        <Button
          onClick={() => setShowAddPerson(!showAddPerson)}
          className="mb-8 text-base animate-bounce"
        >
          Add Person
        </Button>
      </div>

      {showAddPerson && (
        <AddPerson
          onClose={() => setShowAddPerson(false)}
          onSuccess={handlePersonAdded}
        />
      )}

      <PeopleGrid
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        refetchTrigger={refetchTrigger}
      />
    </div>
  );
}
