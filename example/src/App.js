import React from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '@raketa-cms/raketa-mir'

import {
  ImagePicker,
  ImageInput,
  MediaManagerContext,
  imagePlaceholder
} from '@raketa-cms/raketa-image-picker'
import IMAGES from './IMAGES'

class FakeMediaManager {
  findAll(callback, params = {}) {
    if (params.f && params.f.name) {
      const term = params.f.name.toLowerCase()

      return callback(IMAGES.filter((i) => i.name.toLowerCase().includes(term)))
    } else {
      return callback(IMAGES)
    }
  }
}

const mediaManager = new FakeMediaManager('/')

const App = () => {
  return (
    <MediaManagerContext.Provider value={mediaManager}>
      <img src={imagePlaceholder('32x32')} alt='32x32' />

      <ThemeProvider theme={theme}>
        <ImagePicker />
      </ThemeProvider>

      <ImageInput mediaManager={mediaManager} />
    </MediaManagerContext.Provider>
  )
}

export default App
