// src/lib/sanityImageUrl.ts
import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'

import { client } from './client'

// Initialize builder with config (dataset/projectId)
const builder = createImageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
