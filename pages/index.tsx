import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { urlFor } from '../sanity'
import { getCollections } from '../api'
import { Collection } from '../typings'

interface HomeProps {
  collections: Collection[]
}

const Home = ({ collections }: HomeProps) => {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col py-20 px-10 2xl:px-0">
      <Head>
        <title>NFT Drop</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="mb-10 text-4xl font-extralight">
        The
        <span className="px-1 font-extrabold underline decoration-pink-600/50">
          PAPAFAM
        </span>
        NFT Market Place
      </h1>

      <main className="bg-slate-100 p-10 shadow-xl shadow-rose-400/20">
        <div className="grid space-x-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {collections.map(({ _id, mainImage, title, description, slug }) => (
            <Link href={`/nft/${slug.current}`} key={_id}>
              <div
                className="flex cursor-pointer flex-col items-center
              transition-all duration-200 hover:scale-105"
              >
                <img
                  className="h-96 w-60 rounded-2xl object-cover"
                  src={urlFor(mainImage).url()}
                  alt={title}
                />
                <div className="p-5">
                  <h2 className="text-3xl">{title}</h2>
                  <p className="mt-2 text-sm text-gray-400">{description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps = async () => {
  const collections = await getCollections()

  return {
    props: {
      collections,
    },
  }
}
