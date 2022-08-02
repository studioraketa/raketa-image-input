import React from 'react'
import { ThemeProvider } from 'styled-components'
import { theme, Row, Col } from '@raketa-cms/raketa-mir'

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
  const [image1, setImage1] = React.useState(false);
  const [image2, setImage2] = React.useState(false);

  return (
    <MediaManagerContext.Provider value={mediaManager}>
      <img src={imagePlaceholder('32x32')} alt='32x32' />

      <ThemeProvider theme={theme}>
        <ImagePicker value={image1} onChange={(img) => setImage1(img)} />
      </ThemeProvider>

      <ImageInput value={image2} onChange={(img) => setImage2(img)} mediaManager={mediaManager} />

      <Row>
        <Col s={6}>
          <label>Image 1</label>
          <pre>{JSON.stringify(image1, null, 2)}</pre>
        </Col>
        <Col s={6}>
          <label>Image 2</label>
          <pre>{JSON.stringify(image2, null, 2)}</pre>
        </Col>
      </Row>
    </MediaManagerContext.Provider>
  )
}

export default App
