import React, { useMemo, useState, useEffect, useCallback } from 'react'
import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import {
  useAddress,
  useDisconnect,
  useMetamask,
  useNFTDrop,
} from '@thirdweb-dev/react'
import { getCollectionsById } from '../../api'
import { Collection } from '../../typings'
import { urlFor } from '../../sanity'
import { BigNumber } from 'ethers'

interface NFTDropPageProps {
  collection: Collection
}

function NFTDropPage({ collection }: NFTDropPageProps) {
  const [claimedSupply, setClaimedSupply] = useState(0)
  const [totalSupply, setTotalSupply] = useState<BigNumber>()
  const [priceInEth, setPriceInEth] = useState('')
  const [loading, setLoading] = useState(true)
  const nftDrop = useNFTDrop(collection.address)

  // Auth
  const connectWithMetamask = useMetamask()
  const address = useAddress() || ''
  const disconnect = useDisconnect()

  useEffect(() => {
    if (!nftDrop) return
    const fetchPrice = async () => {
      const claimConditions = await nftDrop.claimConditions.getAll()
      setPriceInEth(claimConditions?.[0].currencyMetadata.displayValue)
    }
    fetchPrice()
  }, [nftDrop])

  useEffect(() => {
    if (!nftDrop) return
    const fetchNFTDDropData = async () => {
      setLoading(true)
      const claimed = await nftDrop.getAllClaimed()
      const total = await nftDrop.totalSupply()
      setClaimedSupply(claimed.length)
      setTotalSupply(total)
      setLoading(false)
    }
    fetchNFTDDropData()
  }, [nftDrop])

  const getFormatNFTClaimedText = useMemo(() => {
    const total = totalSupply ? totalSupply?.toString() : ''
    return `${claimedSupply} / ${total} NFT's claimed`
  }, [claimedSupply, totalSupply])

  const formatAddress = useMemo(() => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }, [address])

  const renderNFTCaimedText = useCallback(() => {
    let displayText = loading
      ? 'Loading Supply Count...'
      : getFormatNFTClaimedText

    return <p className="pt-2 text-xl text-green-500">{displayText}</p>
  }, [loading, getFormatNFTClaimedText])

  const renderMintButton = useCallback(() => {
    const isDisabledMintButton =
      loading || claimedSupply === totalSupply?.toNumber() || !address

    let buttonText = `Mint NFT (${priceInEth ? priceInEth : 'loading...'} ETH)`

    if (loading) {
      buttonText = 'loading'
    } else if (!address) {
      buttonText = 'Sign in to Mint'
    } else if (claimedSupply === totalSupply?.toNumber()) {
      buttonText = 'SOLD OUT'
    }

    return (
      <button
        className="mt-10 h-16 rounded-full bg-red-600 text-white disabled:bg-gray-400"
        disabled={isDisabledMintButton}
      >
        <span className="font-bold">{buttonText}</span>
      </button>
    )
  }, [loading, claimedSupply, totalSupply, address, priceInEth])

  return (
    <div className="flex h-screen flex-col lg:grid lg:grid-cols-10">
      {/* Left */}
      <div className="bg-gradient-to-br from-cyan-800 to-rose-500 lg:col-span-4">
        <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen">
          <div className="rounded-xl bg-gradient-to-br from-yellow-400 to-purple-600 p-2">
            <img
              className="w-44 rounded-xl object-cover lg:h-96 lg:w-72"
              src={urlFor(collection.previewImage).url()}
            />
          </div>
          <div className="space-y-2 p-5 text-center">
            <h1 className="text-4xl font-bold text-white">
              {collection.nftCollectionName}
            </h1>
            <h1 className="text-xl text-gray-300">{collection.description}</h1>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-1 flex-col p-12 lg:col-span-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href="/">
            <h1 className="w-52 cursor-pointer text-xl font-extralight sm:w-80">
              The
              <span className="px-1 font-extrabold underline decoration-pink-600/50">
                PAPAFAM
              </span>
              NFT Market Place
            </h1>
          </Link>
          <button
            onClick={() => (address ? disconnect() : connectWithMetamask())}
            className="pxy-4 rounded-full bg-rose-400 px-4 py-2 text-xs font-bold text-white lg:px-5 lg:py-3 lg:text-base"
          >
            {address ? 'Sign Out' : 'Sign In'}
          </button>
        </header>

        <hr className="my-2 border" />

        {address && (
          <p className="text-center text-sm text-rose-400">
            You're logged in with wallet {formatAddress}
          </p>
        )}

        {/* Content */}
        <div className="mt-10 flex flex-1 flex-col items-center space-y-6 text-center lg:justify-center lg:space-y-0">
          <img
            className="w-80 object-cover pb-10 lg:h-40"
            src={urlFor(collection.mainImage).url()}
            alt={collection.title}
          />

          <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold">
            {collection.title}
          </h1>

          {renderNFTCaimedText()}

          {loading && (
            <img
              className="h-80 w-80 object-contain"
              src="https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif"
              alt="loading"
            />
          )}
        </div>

        {/* Mint Button */}
        {renderMintButton()}
      </div>
    </div>
  )
}

export default NFTDropPage

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  let collection = null

  if (params?.id) {
    collection = await getCollectionsById(params.id as string)
  }

  if (!collection) {
    return {
      notFound: true,
    }
  }

  return {
    props: { collection },
  }
}
