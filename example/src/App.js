import React from "react";
import { ThemeProvider } from "styled-components";
import { theme, Row, Col } from "@raketa-cms/raketa-mir";

import {
  ImagePicker,
  ImageInput,
  MediaManagerContext,
  imagePlaceholder,
} from "@raketa-cms/raketa-image-picker";
import MediaManager from "./MediaManager";

const mediaManager = new MediaManager(
  "https://images.raketa.cloud/api/",
  process.env.REACT_APP_IMAGES_API_KEY
);

export default function App() {
  const [image1, setImage1] = React.useState(false);
  const [image2, setImage2] = React.useState(false);

  return (
    <MediaManagerContext.Provider value={mediaManager}>
      <img src={imagePlaceholder("32x32")} alt="32x32" />

      <ThemeProvider theme={theme}>
        <ImagePicker value={image1} onChange={(img) => setImage1(img)} />
      </ThemeProvider>

      <ImageInput
        value={image2}
        onChange={(img) => setImage2(img)}
        mediaManager={mediaManager}
      />

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
  );
}
