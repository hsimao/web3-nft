import React, { useMemo } from 'react'
import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useAddress, useDisconnect, useMetamask } from '@thirdweb-dev/react'
import { getCollectionsById } from '../../api'
import { Collection } from '../../typings'
import { urlFor } from '../../sanity'

interface NFTDropPageProps {
  collection: Collection
}

function NFTDropPage({ collection }: NFTDropPageProps) {
  // Auth
  const connectWithMetamask = useMetamask()
  const address = useAddress() || ''
  const disconnect = useDisconnect()

  const formatAddress = useMemo(() => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }, [address])

  console.log('collection', collection)

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

          <p className="pt-2 text-xl text-green-500">13 / 21 NFT's claimed</p>
        </div>

        {/* Mint Button */}
        <button className="mt-10 h-16 rounded-full bg-red-600 text-white">
          Mint NFT (0.01 ETH)
        </button>
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
