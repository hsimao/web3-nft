import { sanityClient } from '../sanity'

export const getCollections = () => {
  const query = `
  *[_type == "collection"] {
    _id,
    title,
    address,
    description,
    mainImage {
      asset
    },
    previewImage {
      asset
    },
    slug {
      current
    },
    creator-> {
      _id,
      name,
      address,
      slug {
        current
      },
    },
  }
  `

  return sanityClient.fetch(query)
}

export const getCollectionsById = (id: string) => {
  const query = `
  *[_type == "collection" && slug.current == $id][0] {
    _id,
    title,
    address,
    description,
    nftCollectionName,
    mainImage {
      asset
    },
    previewImage {
      asset
    },
    slug {
      current
    },
    creator-> {
      _id,
      name,
      address,
      slug {
        current
      },
    },
  }
  `

  return sanityClient.fetch(query, { id })
}
