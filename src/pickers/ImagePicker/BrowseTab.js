import React from "react";
import styled from "styled-components";

import {
  reset,
  buttonReset,
  Button,
  Stack,
  H,
  P,
} from "@raketa-cms/raketa-mir";
import MediaManagerContext from "../../MediaManagerContext";

import Img from "../../lib/Image";
import TextInput from "../../forms/TextInput";

const ImageList = styled.div`
  ${reset};
  flex: 3;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  margin-top: 1em;
  min-height: 500px;
`;

const Thumb = styled.div`
  ${reset};
  position: relative;
  cursor: pointer;
  width: 116px;
  height: 116px;
  border: 8px solid
    ${(props) => (props.selected ? props.theme.colors.success : "transparent")};
`;

const ImageWrapper = styled.div`
  ${reset};
  width: 100px;
  height: 100px;
  background-color: ${(props) => props.theme.colors.lighterGray};

  & > img {
    width: 100%;
  }
`;

const getPreviewImage = (image) => {
  const LARGE_FILE_TRESHOLD = 2 * 1024 * 1024;

  // Check for large SVGs
  if (image.mime_type === "image/svg+xml" && image.size > LARGE_FILE_TRESHOLD) {
    return LARGE_FILE_PLACEHOLDER;
  }

  return image;
};

const ImageItem = ({ image, selected, onSelect, onFastSelect }) => (
  <Thumb
    selected={selected ? "selected" : ""}
    onClick={() => onSelect(image)}
    onDoubleClick={() => onFastSelect(image)}
  >
    <ImageWrapper title={image.name}>
      <Img
        src={getPreviewImage(image)}
        variant="thumb"
        title={image && image.name}
      />
    </ImageWrapper>
  </Thumb>
);

const ImagePreviewWrapper = styled.div`
  width: 100%;
  margin-bottom: 1rem;
  text-align: center;

  & > img {
    object-fit: contain;
    width: 100%;
    max-height: 200px;
    margin-bottom: 0.5rem;
  }
`;

const ImageInspector = styled.div`
  flex: 1;
  padding-left: 1rem;
  border-left: 1px solid ${(props) => props.theme.colors.gray};
`;

const isImageEditable = (image) => {
  if (!image) return false;

  if (typeof image === "string") {
    return false;
  }

  return true;
};

const ImagePreview = ({ image, onSave, onDelete }) => {
  const [state, setState] = React.useState({
    alt: "",
  });

  React.useEffect(() => {
    if (isImageEditable(image)) {
      setState({
        ...state,
        alt: image.settings.find((s) => s.key === "alt")?.value || "",
      });
    }
  }, [image]);

  const handleUpdate = () => {
    const altIdx = image.settings.findIndex((s) => s.key === "alt");

    onSave(image, {
      settings: [
        ...image.settings.slice(0, altIdx),
        { key: "alt", value: state.alt },
        ...image.settings.slice(altIdx + 1),
      ],
    });
  };

  return (
    <ImageInspector>
      <ImagePreviewWrapper>
        <Img src={image} variant="original" />

        {isImageEditable(image) && (
          <React.Fragment>
            <H
              size="regular"
              style={{
                maxWidth: "200px",
                fontWeight: 500,
                margin: "0 auto",
                wordWrap: "break-word",
              }}
            >
              {image.name}
            </H>
            <div style={{ opacity: 0.5 }}>
              {(image.size / 1024).toFixed(2)} KB / {image.width}&times;
              {image.height}
            </div>
          </React.Fragment>
        )}
      </ImagePreviewWrapper>

      {isImageEditable(image) && (
        <React.Fragment>
          <TextInput
            label="Image alt text"
            value={state.alt}
            onChange={(alt) => setState({ ...state, alt })}
          />

          <Button type="button" variant="primary" onClick={handleUpdate}>
            Update
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(image);
            }}
          >
            Remove image
          </Button>
        </React.Fragment>
      )}
    </ImageInspector>
  );
};

const BrowseTab = ({
  images,
  q,
  selectedImage: initialImage,
  onSelect,
  onFastSelect,
  onDelete,
  onSearch,
  onSearchTermChange,
  onUpdateImage,
}) => {
  const mediaManager = React.useContext(MediaManagerContext);
  const [selectedImage, setSelectedImage] = React.useState(initialImage);

  const handleSelectImage = (newSelected) => {
    setSelectedImage(newSelected);
    onSelect(newSelected);
  };

  const handleUpdateImage = (image, updates) => {
    mediaManager.update(image, updates, (updatedImage) => {
      setSelectedImage(updatedImage);
      onUpdateImage(updatedImage);
      onSelect(updatedImage);
    });
  };

  return (
    <React.Fragment>
      <Stack v="center" h="flex-start" g="0.5rem">
        <TextInput
          label="Search images"
          value={q}
          onChange={(term) => onSearchTermChange(term)}
        />

        <Button type="button" variant="secondary" onClick={() => onSearch()}>
          Search
        </Button>
      </Stack>

      <Stack g="1rem">
        <ImageList>
          {images.map((image) => (
            <ImageItem
              key={image.id}
              image={image}
              selected={selectedImage && selectedImage.id === image.id}
              onSelect={handleSelectImage}
              onFastSelect={onFastSelect}
            />
          ))}
        </ImageList>

        {selectedImage && (
          <ImagePreview
            image={selectedImage}
            onSave={handleUpdateImage}
            onDelete={(image) => {
              setSelectedImage(null);
              onDelete(image);
            }}
          />
        )}
      </Stack>
    </React.Fragment>
  );
};

const LARGE_FILE_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIHdpZHRoPSIzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTAgMGgzMDB2MzAwaC0zMDB6IiBmaWxsPSIjZWFlZGYwIi8+PGcgZmlsbD0iIzAwMCI+PHBhdGggZD0ibTM5LjQ1OTcgMTIyLjA2N3YxOC42NzloLTMuMzc1M2wtOC4wNDEyLTExLjc1NmgtLjEzNTR2MTEuNzU2aC0zLjkwNzh2LTE4LjY3OWgzLjQyOTVsNy45NzggMTEuNzQ4aC4xNjI0di0xMS43NDh6Ii8+PHBhdGggZD0ibTQ4Ljg3OTQgMTQxLjAyYy0xLjQwMTggMC0yLjYxNDItLjMwMS0zLjYzNy0uOTAzLTEuMDE2OC0uNjA4LTEuODAyLTEuNDUzLTIuMzU1NS0yLjUzNS0uNTUzNS0xLjA4OS0uODMwMy0yLjM1MS0uODMwMy0zLjc4NiAwLTEuNDQ3LjI3NjgtMi43MTEuODMwMy0zLjc5NC41NTM1LTEuMDg4IDEuMzM4Ny0xLjkzMyAyLjM1NTUtMi41MzUgMS4wMjI4LS42MDggMi4yMzUyLS45MTIgMy42MzctLjkxMiAxLjQwMTkgMCAyLjYxMTIuMzA0IDMuNjI4MS45MTIgMS4wMjI4LjYwMiAxLjgxMSAxLjQ0NyAyLjM2NDUgMi41MzUuNTUzNSAxLjA4My44MzAzIDIuMzQ3LjgzMDMgMy43OTQgMCAxLjQzNS0uMjc2OCAyLjY5Ny0uODMwMyAzLjc4Ni0uNTUzNSAxLjA4Mi0xLjM0MTcgMS45MjctMi4zNjQ1IDIuNTM1LTEuMDE2OS42MDItMi4yMjYyLjkwMy0zLjYyODEuOTAzem0uMDE4MS0zLjAxYy42Mzc4IDAgMS4xNzAyLS4xODIgMS41OTc0LS41NDcuNDI3Mi0uMzcxLjc0OTEtLjg3Ni45NjU3LTEuNTE0LjIyMjYtLjYzOS4zMzM5LTEuMzY1LjMzMzktMi4xOHMtLjExMTMtMS41NDEtLjMzMzktMi4xOGMtLjIxNjYtLjYzOC0uNTM4NS0xLjE0My0uOTY1Ny0xLjUxNHMtLjk1OTYtLjU1Ni0xLjU5NzQtLjU1NmMtLjY0MzggMC0xLjE4NTMuMTg1LTEuNjI0NS41NTYtLjQzMzIuMzcxLS43NjExLjg3Ni0uOTgzNyAxLjUxNC0uMjE2Ni42MzktLjMyNDkgMS4zNjUtLjMyNDkgMi4xOHMuMTA4MyAxLjU0MS4zMjQ5IDIuMThjLjIyMjYuNjM4LjU1MDUgMS4xNDMuOTgzNyAxLjUxNC40MzkyLjM2NS45ODA3LjU0NyAxLjYyNDUuNTQ3eiIvPjxwYXRoIGQ9Im02NC4wODQyIDE0NnYtMTkuMjYzaDMuNzkwNHYyLjM1M2guMTcxNWMuMTY4NS0uMzc3LjQxMjEtLjc2LjczMS0xLjE0OS4zMjQ5LS4zOTUuNzQ2MS0uNzI0IDEuMjYzNS0uOTg1LjUyMzUtLjI2OCAxLjE3MzMtLjQwMSAxLjk0OTQtLjQwMSAxLjAxMDggMCAxLjk0MzQuMjY3IDIuNzk3Ny44MDIuODU0NC41MjkgMS41MzczIDEuMzI5IDIuMDQ4NyAyLjM5OS41MTE0IDEuMDY0Ljc2NzEgMi4zOTkuNzY3MSA0LjAwNCAwIDEuNTYzLS4yNDk3IDIuODgyLS43NDkxIDMuOTU4LS40OTMzIDEuMDcxLTEuMTY3MiAxLjg4Mi0yLjAyMTYgMi40MzYtLjg0ODMuNTQ3LTEuNzk4OS44Mi0yLjg1MTguODItLjc0NjEgMC0xLjM4MDgtLjEyNC0xLjkwNDMtLjM3My0uNTE3NC0uMjUtLjk0MTYtLjU2My0xLjI3MjUtLjk0LS4zMzA5LS4zODMtLjU4MzYtLjc2OS0uNzU4MS0xLjE1OGgtLjExNzN2Ny40OTd6bTMuNzYzNC0xMi4yNThjMCAuODMzLjExNDMgMS41NTkuMzQyOSAyLjE4LjIyODYuNjIuNTU5NiAxLjEwMy45OTI4IDEuNDUuNDMzMS4zNC45NTk2LjUxMSAxLjU3OTMuNTExLjYyNTcgMCAxLjE1NTItLjE3NCAxLjU4ODQtLjUyLjQzMzItLjM1My43NjExLS44MzkuOTgzNy0xLjQ2LjIyODYtLjYyNi4zNDMtMS4zNDcuMzQzLTIuMTYxIDAtLjgwOS0uMTExMy0xLjUyLS4zMzQtMi4xMzUtLjIyMjYtLjYxNC0uNTUwNS0xLjA5NC0uOTgzNy0xLjQ0MS0uNDMzMi0uMzQ2LS45NjU2LS41Mi0xLjU5NzQtLjUyLS42MjU3IDAtMS4xNTUyLjE2OC0xLjU4ODQuNTAyLS40MjcyLjMzNS0uNzU1MS44MDktLjk4MzcgMS40MjNzLS4zNDI5IDEuMzM4LS4zNDI5IDIuMTcxeiIvPjxwYXRoIGQ9Im04MC4xNjY2IDE0MC43NDZ2LTE0LjAwOWgzLjcyNzN2Mi40NDRoLjE0NDRjLjI1MjctLjg2OS42NzY4LTEuNTI2IDEuMjcyNS0xLjk3LjU5NTYtLjQ1IDEuMjgxNS0uNjc1IDIuMDU3Ny0uNjc1LjE5MjUgMCAuNDAwMS4wMTIuNjIyNy4wMzcuMjIyNi4wMjQuNDE4MS4wNTguNTg2Ni4xdjMuNDQ4Yy0uMTgwNS0uMDU1LS40MzAyLS4xMDQtLjc0OTEtLjE0Ni0uMzE4OS0uMDQzLS42MTA3LS4wNjQtLjg3NTQtLjA2NC0uNTY1NSAwLTEuMDcwOS4xMjUtMS41MTYyLjM3NC0uNDM5Mi4yNDMtLjc4ODIuNTg0LTEuMDQ2OSAxLjAyMS0uMjUyNy40MzgtLjM3OS45NDMtLjM3OSAxLjUxNXY3LjkyNXoiLz48cGF0aCBkPSJtOTYuMjM3NyAxNDEuMDJjLTEuNDI1OSAwLTIuNjUzMy0uMjkyLTMuNjgyMi0uODc2LTEuMDIyOC0uNTg5LTEuODExLTEuNDIyLTIuMzY0NS0yLjQ5OS0uNTUzNS0xLjA4Mi0uODMwMy0yLjM2Mi0uODMwMy0zLjgzOSAwLTEuNDQyLjI3NjgtMi43MDYuODMwMy0zLjc5NS41NTM1LTEuMDg4IDEuMzMyNy0xLjkzNiAyLjMzNzUtMi41NDQgMS4wMTA3LS42MDggMi4xOTYtLjkxMiAzLjU1NTgtLjkxMi45MTQ1IDAgMS43NjU4LjE0OSAyLjU1NC40NDYuNzk0Mi4yOTIgMS40ODU3LjczMyAyLjA3NTcgMS4zMjMuNTk2LjU5IDEuMDU5IDEuMzMyIDEuMzkgMi4yMjUuMzMxLjg4OC40OTYgMS45MjguNDk2IDMuMTJ2MS4wNjdoLTExLjcwNTF2LTIuNDA4aDguMDg2NGMwLS41NTktLjEyMDQtMS4wNTUtLjM2MS0xLjQ4Ny0uMjQwNy0uNDMxLS41NzQ2LS43NjktMS4wMDE4LTEuMDEyLS40MjEyLS4yNDktLjkxMTUtLjM3NC0xLjQ3MTEtLjM3NC0uNTgzNiAwLTEuMTAxLjEzNy0xLjU1MjIuNDEtLjQ0NTMuMjY4LS43OTQyLjYzLTEuMDQ2OSAxLjA4Ni0uMjUyNy40NS0uMzgyMS45NTEtLjM4ODEgMS41MDV2Mi4yODljMCAuNjkzLjEyNjMgMS4yOTIuMzc5IDEuNzk3LjI1ODguNTA0LjYyMjguODk0IDEuMDkyMSAxLjE2Ny40NjkzLjI3NCAxLjAyNTguNDExIDEuNjY5Ni40MTEuNDI3MiAwIC44MTgyLS4wNjEgMS4xNzMyLS4xODMuMzU1LS4xMjEuNjU4OC0uMzA0LjkxMTUtLjU0N3MuNDQ1My0uNTQxLjU3NzYtLjg5NGwzLjU1NTguMjM3Yy0uMTguODY0LS41NSAxLjYxOC0xLjExIDIuMjYyLS41NTQuNjM5LTEuMjcgMS4xMzctMi4xNDggMS40OTYtLjg3MjQuMzUzLTEuODgwMi41MjktMy4wMjMzLjUyOXoiLz48cGF0aCBkPSJtMTE3LjY2MSAxMjYuNzM3LTQuODQ3IDE0LjAwOWgtNC4zMzJsLTQuODQ2LTE0LjAwOWg0LjA2MWwyLjg3OSAxMC4wMjRoLjE0NGwyLjg3LTEwLjAyNHoiLz48cGF0aCBkPSJtMTE5LjYyOCAxNDAuNzQ2di0xNC4wMDloMy44NDV2MTQuMDA5em0xLjkzMS0xNS44MTVjLS41NzEgMC0xLjA2Mi0uMTkxLTEuNDcxLS41NzUtLjQwMy0uMzg5LS42MDQtLjg1NC0uNjA0LTEuMzk1IDAtLjUzNS4yMDEtLjk5NC42MDQtMS4zNzcuNDA5LS4zODkuOS0uNTg0IDEuNDcxLS41ODQuNTcyIDAgMS4wNTkuMTk1IDEuNDYyLjU4NC40MS4zODMuNjE0Ljg0Mi42MTQgMS4zNzcgMCAuNTQxLS4yMDQgMS4wMDYtLjYxNCAxLjM5NS0uNDAzLjM4NC0uODkuNTc1LTEuNDYyLjU3NXoiLz48cGF0aCBkPSJtMTMyLjg3IDE0MS4wMmMtMS40MjYgMC0yLjY1My0uMjkyLTMuNjgyLS44NzYtMS4wMjMtLjU4OS0xLjgxMS0xLjQyMi0yLjM2NS0yLjQ5OS0uNTUzLTEuMDgyLS44My0yLjM2Mi0uODMtMy44MzkgMC0xLjQ0Mi4yNzctMi43MDYuODMtMy43OTUuNTU0LTEuMDg4IDEuMzMzLTEuOTM2IDIuMzM4LTIuNTQ0IDEuMDEtLjYwOCAyLjE5Ni0uOTEyIDMuNTU1LS45MTIuOTE1IDAgMS43NjYuMTQ5IDIuNTU0LjQ0Ni43OTUuMjkyIDEuNDg3LjczMyAyLjA3NiAxLjMyMy41OTYuNTkgMS4wNTkgMS4zMzIgMS4zOSAyLjIyNS4zMzEuODg4LjQ5NiAxLjkyOC40OTYgMy4xMnYxLjA2N2gtMTEuNzA1di0yLjQwOGg4LjA4NmMwLS41NTktLjEyLTEuMDU1LS4zNjEtMS40ODctLjI0LS40MzEtLjU3NC0uNzY5LTEuMDAxLTEuMDEyLS40MjItLjI0OS0uOTEyLS4zNzQtMS40NzEtLjM3NC0uNTg0IDAtMS4xMDEuMTM3LTEuNTUzLjQxLS40NDUuMjY4LS43OTQuNjMtMS4wNDcgMS4wODYtLjI1Mi40NS0uMzgyLjk1MS0uMzg4IDEuNTA1djIuMjg5YzAgLjY5My4xMjcgMS4yOTIuMzc5IDEuNzk3LjI1OS41MDQuNjIzLjg5NCAxLjA5MiAxLjE2Ny40Ny4yNzQgMS4wMjYuNDExIDEuNjcuNDExLjQyNyAwIC44MTgtLjA2MSAxLjE3My0uMTgzLjM1NS0uMTIxLjY1OS0uMzA0LjkxMi0uNTQ3LjI1Mi0uMjQzLjQ0NS0uNTQxLjU3Ny0uODk0bDMuNTU2LjIzN2MtLjE4Ljg2NC0uNTUgMS42MTgtMS4xMSAyLjI2Mi0uNTUzLjYzOS0xLjI2OSAxLjEzNy0yLjE0OCAxLjQ5Ni0uODcyLjM1My0xLjg4LjUyOS0zLjAyMy41Mjl6Ii8+PHBhdGggZD0ibTE0NC4zNzcgMTQwLjc0Ni0zLjc3My0xNC4wMDloMy44OWwyLjE0OCA5LjQxM2guMTI2bDIuMjM4LTkuNDEzaDMuODE4bDIuMjc0IDkuMzU4aC4xMThsMi4xMTEtOS4zNThoMy44ODFsLTMuNzYzIDE0LjAwOWgtNC4wNzFsLTIuMzgyLTguODFoLS4xNzJsLTIuMzgyIDguODF6Ii8+PHBhdGggZD0ibTE3My4wOTQgMTQxLjAxMWMtLjg4NSAwLTEuNjczLS4xNTUtMi4zNjUtLjQ2NS0uNjkyLS4zMTYtMS4yMzktLjc4Mi0xLjY0Mi0xLjM5Ni0uMzk3LS42Mi0uNTk2LTEuMzkyLS41OTYtMi4zMTYgMC0uNzc5LjE0Mi0xLjQzMi40MjQtMS45NjEuMjgzLS41MjkuNjY4LS45NTUgMS4xNTYtMS4yNzcuNDg3LS4zMjIgMS4wNC0uNTY2IDEuNjYtLjczLjYyNi0uMTY0IDEuMjgyLS4yOCAxLjk2OC0uMzQ2LjgwNi0uMDg2IDEuNDU2LS4xNjUgMS45NDktLjIzOC40OTMtLjA3OS44NTEtLjE5NCAxLjA3NC0uMzQ2cy4zMzQtLjM3Ny4zMzQtLjY3NXYtLjA1NWMwLS41NzgtLjE4MS0xLjAyNC0uNTQyLTEuMzQxLS4zNTUtLjMxNi0uODYtLjQ3NC0xLjUxNi0uNDc0LS42OTIgMC0xLjI0Mi4xNTUtMS42NTEuNDY1LS40MS4zMDQtLjY4LjY4Ny0uODEzIDEuMTQ5bC0zLjU1NS0uMjkxYy4xOC0uODUyLjUzNS0xLjU4NyAxLjA2NC0yLjIwOC41My0uNjI2IDEuMjEzLTEuMTA2IDIuMDQ5LTEuNDQxLjg0Mi0uMzQgMS44MTctLjUxIDIuOTI0LS41MS43NyAwIDEuNTA3LjA5MSAyLjIxMS4yNzMuNzEuMTgzIDEuMzM5LjQ2NSAxLjg4Ni44NDguNTU0LjM4My45OS44NzYgMS4zMDkgMS40NzguMzE5LjU5Ni40NzggMS4zMS40NzggMi4xNDN2OS40NDloLTMuNjQ2di0xLjk0MmgtLjEwOGMtLjIyMy40MzgtLjUyLjgyNC0uODkzIDEuMTU4LS4zNzMuMzI4LS44MjIuNTg3LTEuMzQ1Ljc3NS0uNTI0LjE4My0xLjEyOC4yNzQtMS44MTQuMjc0em0xLjEwMS0yLjY4MmMuNTY1IDAgMS4wNjUtLjExMiAxLjQ5OC0uMzM3LjQzMy0uMjMxLjc3My0uNTQxIDEuMDItLjkzcy4zNy0uODMuMzctMS4zMjN2LTEuNDg3Yy0uMTIuMDgtLjI4Ni4xNTItLjQ5Ni4yMTktLjIwNS4wNjEtLjQzNy4xMTktLjY5NS4xNzQtLjI1OS4wNDgtLjUxOC4wOTQtLjc3Ny4xMzYtLjI1OC4wMzctLjQ5My4wNy0uNzAzLjEwMS0uNDUyLjA2Ny0uODQ2LjE3My0xLjE4My4zMTlzLS41OTguMzQ0LS43ODUuNTkzYy0uMTg2LjI0My0uMjguNTQ3LS4yOC45MTIgMCAuNTI5LjE5LjkzMy41NjkgMS4yMTMuMzg1LjI3NC44NzIuNDEgMS40NjIuNDF6Ii8+PHBhdGggZD0ibTE5Ni4zMSAxMjYuNzM3LTQuODQ2IDE0LjAwOWgtNC4zMzJsLTQuODQ2LTE0LjAwOWg0LjA2MWwyLjg3OSAxMC4wMjRoLjE0NGwyLjg3LTEwLjAyNHoiLz48cGF0aCBkPSJtMjAxLjg1OSAxNDEuMDExYy0uODg1IDAtMS42NzMtLjE1NS0yLjM2NS0uNDY1LS42OTItLjMxNi0xLjIzOS0uNzgyLTEuNjQzLTEuMzk2LS4zOTctLjYyLS41OTUtMS4zOTItLjU5NS0yLjMxNiAwLS43NzkuMTQxLTEuNDMyLjQyNC0xLjk2MXMuNjY4LS45NTUgMS4xNTUtMS4yNzdjLjQ4OC0uMzIyIDEuMDQxLS41NjYgMS42NjEtLjczLjYyNi0uMTY0IDEuMjgxLS4yOCAxLjk2Ny0uMzQ2LjgwNi0uMDg2IDEuNDU2LS4xNjUgMS45NS0uMjM4LjQ5My0uMDc5Ljg1MS0uMTk0IDEuMDc0LS4zNDYuMjIyLS4xNTIuMzMzLS4zNzcuMzMzLS42NzV2LS4wNTVjMC0uNTc4LS4xOC0xLjAyNC0uNTQxLTEuMzQxLS4zNTUtLjMxNi0uODYtLjQ3NC0xLjUxNi0uNDc0LS42OTIgMC0xLjI0My4xNTUtMS42NTIuNDY1LS40MDkuMzA0LS42OC42ODctLjgxMiAxLjE0OWwtMy41NTYtLjI5MWMuMTgxLS44NTIuNTM2LTEuNTg3IDEuMDY1LTIuMjA4LjUzLS42MjYgMS4yMTItMS4xMDYgMi4wNDktMS40NDEuODQyLS4zNCAxLjgxNy0uNTEgMi45MjQtLjUxLjc3IDAgMS41MDcuMDkxIDIuMjExLjI3My43MS4xODMgMS4zMzkuNDY1IDEuODg2Ljg0OC41NTQuMzgzLjk5Ljg3NiAxLjMwOSAxLjQ3OC4zMTkuNTk2LjQ3OCAxLjMxLjQ3OCAyLjE0M3Y5LjQ0OWgtMy42NDZ2LTEuOTQyaC0uMTA4Yy0uMjIzLjQzOC0uNTIxLjgyNC0uODk0IDEuMTU4LS4zNzMuMzI4LS44MjEuNTg3LTEuMzQ0Ljc3NS0uNTI0LjE4My0xLjEyOS4yNzQtMS44MTQuMjc0em0xLjEwMS0yLjY4MmMuNTY1IDAgMS4wNjUtLjExMiAxLjQ5OC0uMzM3LjQzMy0uMjMxLjc3My0uNTQxIDEuMDItLjkzLjI0Ni0uMzg5LjM3LS44My4zNy0xLjMyM3YtMS40ODdjLS4xMjEuMDgtLjI4Ni4xNTItLjQ5Ny4yMTktLjIwNC4wNjEtLjQzNi4xMTktLjY5NS4xNzQtLjI1OC4wNDgtLjUxNy4wOTQtLjc3Ni4xMzYtLjI1OS4wMzctLjQ5My4wNy0uNzA0LjEwMS0uNDUxLjA2Ny0uODQ1LjE3My0xLjE4Mi4zMTlzLS41OTkuMzQ0LS43ODUuNTkzYy0uMTg3LjI0My0uMjguNTQ3LS4yOC45MTIgMCAuNTI5LjE5LjkzMy41NjkgMS4yMTMuMzg1LjI3NC44NzIuNDEgMS40NjIuNDF6Ii8+PHBhdGggZD0ibTIxMi42NDggMTQwLjc0NnYtMTQuMDA5aDMuODQ0djE0LjAwOXptMS45MzEtMTUuODE1Yy0uNTcxIDAtMS4wNjItLjE5MS0xLjQ3MS0uNTc1LS40MDMtLjM4OS0uNjA1LS44NTQtLjYwNS0xLjM5NSAwLS41MzUuMjAyLS45OTQuNjA1LTEuMzc3LjQwOS0uMzg5LjktLjU4NCAxLjQ3MS0uNTg0LjU3MiAwIDEuMDU5LjE5NSAxLjQ2Mi41ODQuNDA5LjM4My42MTQuODQyLjYxNCAxLjM3NyAwIC41NDEtLjIwNSAxLjAwNi0uNjE0IDEuMzk1LS40MDMuMzg0LS44OS41NzUtMS40NjIuNTc1eiIvPjxwYXRoIGQ9Im0yMjMuNDE3IDEyMi4wNjd2MTguNjc5aC0zLjg0NXYtMTguNjc5eiIvPjxwYXRoIGQ9Im0yMzAuNDQ5IDE0MS4wMTFjLS44ODQgMC0xLjY3Mi0uMTU1LTIuMzY0LS40NjUtLjY5Mi0uMzE2LTEuMjM5LS43ODItMS42NDMtMS4zOTYtLjM5Ny0uNjItLjU5NS0xLjM5Mi0uNTk1LTIuMzE2IDAtLjc3OS4xNDEtMS40MzIuNDI0LTEuOTYxcy42NjgtLjk1NSAxLjE1NS0xLjI3NyAxLjA0MS0uNTY2IDEuNjYxLS43M2MuNjI1LS4xNjQgMS4yODEtLjI4IDEuOTY3LS4zNDYuODA2LS4wODYgMS40NTYtLjE2NSAxLjk1LS4yMzguNDkzLS4wNzkuODUxLS4xOTQgMS4wNzQtLjM0Ni4yMjItLjE1Mi4zMzMtLjM3Ny4zMzMtLjY3NXYtLjA1NWMwLS41NzgtLjE4LTEuMDI0LS41NDEtMS4zNDEtLjM1NS0uMzE2LS44Ni0uNDc0LTEuNTE2LS40NzQtLjY5MiAwLTEuMjQzLjE1NS0xLjY1Mi40NjUtLjQwOS4zMDQtLjY4LjY4Ny0uODEyIDEuMTQ5bC0zLjU1Ni0uMjkxYy4xODEtLjg1Mi41MzYtMS41ODcgMS4wNjUtMi4yMDguNTMtLjYyNiAxLjIxMi0xLjEwNiAyLjA0OS0xLjQ0MS44NDItLjM0IDEuODE3LS41MSAyLjkyNC0uNTEuNzcgMCAxLjUwNy4wOTEgMi4yMTEuMjczLjcxLjE4MyAxLjMzOS40NjUgMS44ODYuODQ4LjU1NC4zODMuOTkuODc2IDEuMzA5IDEuNDc4LjMxOS41OTYuNDc4IDEuMzEuNDc4IDIuMTQzdjkuNDQ5aC0zLjY0NnYtMS45NDJoLS4xMDhjLS4yMjMuNDM4LS41MjEuODI0LS44OTQgMS4xNTgtLjM3My4zMjgtLjgyMS41ODctMS4zNDUuNzc1LS41MjMuMTgzLTEuMTI4LjI3NC0xLjgxNC4yNzR6bTEuMTAyLTIuNjgyYy41NjUgMCAxLjA2NC0uMTEyIDEuNDk4LS4zMzcuNDMzLS4yMzEuNzczLS41NDEgMS4wMTktLjkzLjI0Ny0uMzg5LjM3MS0uODMuMzcxLTEuMzIzdi0xLjQ4N2MtLjEyMS4wOC0uMjg2LjE1Mi0uNDk3LjIxOS0uMjA0LjA2MS0uNDM2LjExOS0uNjk1LjE3NC0uMjU4LjA0OC0uNTE3LjA5NC0uNzc2LjEzNi0uMjU5LjAzNy0uNDkzLjA3LS43MDQuMTAxLS40NTEuMDY3LS44NDUuMTczLTEuMTgyLjMxOXMtLjU5OS4zNDQtLjc4NS41OTNjLS4xODcuMjQzLS4yOC41NDctLjI4LjkxMiAwIC41MjkuMTg5LjkzMy41NjggMS4yMTMuMzg2LjI3NC44NzMuNDEgMS40NjMuNDF6Ii8+PHBhdGggZD0ibTI0MS4zMTEgMTQwLjc0NnYtMTguNjc5aDMuODQ1djcuMDIzaC4xMTdjLjE2OC0uMzc3LjQxMi0uNzYuNzMxLTEuMTQ5LjMyNS0uMzk1Ljc0Ni0uNzI0IDEuMjYzLS45ODUuNTI0LS4yNjggMS4xNzQtLjQwMSAxLjk1LS40MDEgMS4wMTEgMCAxLjk0My4yNjcgMi43OTguODAyLjg1NC41MjkgMS41MzcgMS4zMjkgMi4wNDggMi4zOTkuNTEyIDEuMDY0Ljc2NyAyLjM5OS43NjcgNC4wMDQgMCAxLjU2My0uMjQ5IDIuODgyLS43NDkgMy45NTgtLjQ5MyAxLjA3MS0xLjE2NyAxLjg4Mi0yLjAyMSAyLjQzNi0uODQ5LjU0Ny0xLjc5OS44Mi0yLjg1Mi44Mi0uNzQ2IDAtMS4zODEtLjEyNC0xLjkwNC0uMzczLS41MTgtLjI1LS45NDItLjU2My0xLjI3My0uOTQtLjMzMS0uMzgzLS41ODQtLjc2OS0uNzU4LTEuMTU4aC0uMTcydjIuMjQzem0zLjc2My03LjAwNGMwIC44MzMuMTE1IDEuNTU5LjM0MyAyLjE4LjIyOS42Mi41NiAxLjEwMy45OTMgMS40NS40MzMuMzQuOTYuNTExIDEuNTc5LjUxMS42MjYgMCAxLjE1Ni0uMTc0IDEuNTg5LS41Mi40MzMtLjM1My43NjEtLjgzOS45ODQtMS40Ni4yMjgtLjYyNi4zNDItMS4zNDcuMzQyLTIuMTYxIDAtLjgwOS0uMTExLTEuNTItLjMzMy0yLjEzNS0uMjIzLS42MTQtLjU1MS0xLjA5NC0uOTg0LTEuNDQxLS40MzMtLjM0Ni0uOTY2LS41Mi0xLjU5OC0uNTItLjYyNSAwLTEuMTU1LjE2OC0xLjU4OC41MDItLjQyNy4zMzUtLjc1NS44MDktLjk4NCAxLjQyMy0uMjI4LjYxNC0uMzQzIDEuMzM4LS4zNDMgMi4xNzF6Ii8+PHBhdGggZD0ibTI2MS4yNCAxMjIuMDY3djE4LjY3OWgtMy44NDR2LTE4LjY3OXoiLz48cGF0aCBkPSJtMjcwLjYzNyAxNDEuMDJjLTEuNDI1IDAtMi42NTMtLjI5Mi0zLjY4Mi0uODc2LTEuMDIzLS41ODktMS44MTEtMS40MjItMi4zNjQtMi40OTktLjU1NC0xLjA4Mi0uODMxLTIuMzYyLS44MzEtMy44MzkgMC0xLjQ0Mi4yNzctMi43MDYuODMxLTMuNzk1LjU1My0xLjA4OCAxLjMzMi0xLjkzNiAyLjMzNy0yLjU0NCAxLjAxMS0uNjA4IDIuMTk2LS45MTIgMy41NTYtLjkxMi45MTUgMCAxLjc2Ni4xNDkgMi41NTQuNDQ2Ljc5NC4yOTIgMS40ODYuNzMzIDIuMDc2IDEuMzIzLjU5NS41OSAxLjA1OSAxLjMzMiAxLjM5IDIuMjI1LjMzMS44ODguNDk2IDEuOTI4LjQ5NiAzLjEydjEuMDY3aC0xMS43MDV2LTIuNDA4aDguMDg2YzAtLjU1OS0uMTItMS4wNTUtLjM2MS0xLjQ4Ny0uMjQxLS40MzEtLjU3NS0uNzY5LTEuMDAyLTEuMDEyLS40MjEtLjI0OS0uOTExLS4zNzQtMS40NzEtLjM3NC0uNTgzIDAtMS4xMDEuMTM3LTEuNTUyLjQxLS40NDUuMjY4LS43OTQuNjMtMS4wNDcgMS4wODYtLjI1My40NS0uMzgyLjk1MS0uMzg4IDEuNTA1djIuMjg5YzAgLjY5My4xMjYgMS4yOTIuMzc5IDEuNzk3LjI1OS41MDQuNjIzLjg5NCAxLjA5MiAxLjE2Ny40NjkuMjc0IDEuMDI2LjQxMSAxLjY3LjQxMS40MjcgMCAuODE4LS4wNjEgMS4xNzMtLjE4My4zNTUtLjEyMS42NTktLjMwNC45MTEtLjU0Ny4yNTMtLjI0My40NDYtLjU0MS41NzgtLjg5NGwzLjU1Ni4yMzdjLS4xODEuODY0LS41NTEgMS42MTgtMS4xMSAyLjI2Mi0uNTU0LjYzOS0xLjI3IDEuMTM3LTIuMTQ4IDEuNDk2LS44NzMuMzUzLTEuODguNTI5LTMuMDI0LjUyOXoiLz48L2c+PHBhdGggZD0ibTk2LjUgMTczLjQ3N3YtMTguNjA1aDIuMjQ3NHYxNi42MDZoOC42MjY2djEuOTk5eiIgZmlsbD0iI2Q2MjQyNCIvPjxwYXRoIGQ9Im0xMTQuNjYgMTczLjgwNGMtLjg4MiAwLTEuNjgyLS4xNjctMi40MDEtLjUtLjcxOS0uMzM5LTEuMjktLjgyNy0xLjcxMy0xLjQ2Mi0uNDIzLS42NDItLjYzNC0xLjQxOC0uNjM0LTIuMzI2IDAtLjc5OS4xNTctMS40NDcuNDcxLTEuOTQ0LjMxNC0uNTAzLjczNC0uODk2IDEuMjU5LTEuMTgxLjUyNi0uMjg1IDEuMTA2LS40OTcgMS43NC0uNjM2LjY0MS0uMTQ1IDEuMjg0LS4yNiAxLjkzMS0uMzQ1Ljg0NS0uMTA5IDEuNTMxLS4xOTEgMi4wNTctLjI0NS41MzEtLjA2MS45MTgtLjE2MSAxLjE2LS4zLjI0Ny0uMTM5LjM3MS0uMzgyLjM3MS0uNzI3di0uMDczYzAtLjg5Ni0uMjQ1LTEuNTkyLS43MzQtMi4wODktLjQ4My0uNDk3LTEuMjE3LS43NDUtMi4yMDItLjc0NS0xLjAyMSAwLTEuODIxLjIyNC0yLjQwMS42NzItLjU4LjQ0OS0uOTg4LjkyNy0xLjIyNCAxLjQzNmwtMi4wMy0uNzI3Yy4zNjMtLjg0OC44NDYtMS41MDggMS40NS0xLjk4LjYxLS40NzkgMS4yNzUtLjgxMiAxLjk5NC0xIC43MjUtLjE5NCAxLjQzOC0uMjkgMi4xMzktLjI5LjQ0NyAwIC45Ni4wNTQgMS41NC4xNjMuNTg2LjEwMyAxLjE1MS4zMTggMS42OTUuNjQ1LjU0OS4zMjcgMS4wMDUuODIxIDEuMzY4IDEuNDgxLjM2Mi42Ni41NDQgMS41NDQuNTQ0IDIuNjUydjkuMTk0aC0yLjEzOXYtMS44OWgtLjEwOWMtLjE0NS4zMDMtLjM4Ni42MjctLjcyNS45NzItLjMzOC4zNDUtLjc4OC42MzktMS4zNS44ODEtLjU2Mi4yNDMtMS4yNDcuMzY0LTIuMDU3LjM2NHptLjMyNi0xLjkyNmMuODQ2IDAgMS41NTktLjE2NyAyLjEzOS0uNS41ODYtLjMzMyAxLjAyNy0uNzYzIDEuMzIzLTEuMjkuMzAyLS41MjcuNDUzLTEuMDgxLjQ1My0xLjY2MnYtMS45NjJjLS4wOTEuMTA5LS4yOS4yMDktLjU5OC4yOTktLjMwMi4wODUtLjY1Mi4xNjEtMS4wNTEuMjI4LS4zOTMuMDYtLjc3Ni4xMTUtMS4xNTEuMTYzLS4zNjkuMDQyLS42NjguMDc5LS44OTcuMTA5LS41NTYuMDczLTEuMDc2LjE5MS0xLjU1OS4zNTQtLjQ3Ny4xNTgtLjg2NC4zOTctMS4xNi43MTgtLjI5LjMxNS0uNDM1Ljc0NS0uNDM1IDEuMjkgMCAuNzQ1LjI3NSAxLjMwOC44MjUgMS42OS41NTYuMzc1IDEuMjYuNTYzIDIuMTExLjU2M3oiIGZpbGw9IiNkNjI0MjQiLz48cGF0aCBkPSJtMTI0Ljk0MyAxNzMuNDc3di0xMy45NTRoMi4wNjZ2Mi4xMDhoLjE0NWMuMjU0LS42OTEuNzEzLTEuMjUxIDEuMzc4LTEuNjgxLjY2NC0uNDMgMS40MTMtLjY0NSAyLjI0Ny0uNjQ1LjE1NyAwIC4zNTMuMDAzLjU4OS4wMDlzLjQxNC4wMTUuNTM1LjAyOHYyLjE4Yy0uMDczLS4wMTgtLjIzOS0uMDQ2LS40OTktLjA4Mi0uMjUzLS4wNDItLjUyMi0uMDY0LS44MDYtLjA2NC0uNjc3IDAtMS4yODEuMTQzLTEuODEzLjQyNy0uNTI1LjI3OS0uOTQyLjY2Ny0xLjI1IDEuMTYzLS4zMDIuNDkxLS40NTMgMS4wNTEtLjQ1MyAxLjY4MXY4LjgzeiIgZmlsbD0iI2Q2MjQyNCIvPjxwYXRoIGQ9Im0xMzkuNjMyIDE3OWMtMS4wMzMgMC0xLjkyMS0uMTMzLTIuNjY0LS40LS43NDMtLjI2LTEuMzYyLS42MDUtMS44NTctMS4wMzUtLjQ5LS40MjQtLjg3OS0uODc4LTEuMTY5LTEuMzYzbDEuNzAzLTEuMTk5Yy4xOTQuMjU0LjQzOC41NDUuNzM0Ljg3Mi4yOTYuMzMzLjcwMS42MjEgMS4yMTUuODYzLjUxOS4yNDggMS4xOTkuMzcyIDIuMDM4LjM3MiAxLjEyNCAwIDIuMDUyLS4yNzIgMi43ODMtLjgxNy43My0uNTQ1IDEuMDk2LTEuMzk5IDEuMDk2LTIuNTYydi0yLjgzNGgtLjE4MWMtLjE1Ny4yNTQtLjM4MS41NjktLjY3MS45NDUtLjI4NC4zNjktLjY5NS42OTktMS4yMzIuOTktLjUzMi4yODQtMS4yNTEuNDI3LTIuMTU3LjQyNy0xLjEyNCAwLTIuMTMzLS4yNjctMy4wMjctLjgtLjg4OC0uNTMzLTEuNTkyLTEuMzA4LTIuMTExLTIuMzI1LS41MTQtMS4wMTgtLjc3LTIuMjUzLS43Ny0zLjcwNyAwLTEuNDI5LjI1LTIuNjczLjc1Mi0zLjczMy41MDEtMS4wNjYgMS4xOTktMS44OSAyLjA5My0yLjQ3MS44OTQtLjU4OCAxLjkyNy0uODgxIDMuMDk5LS44ODEuOTA2IDAgMS42MjUuMTUxIDIuMTU3LjQ1NC41MzguMjk3Ljk0OC42MzYgMS4yMzIgMS4wMTcuMjkuMzc2LjUxNC42ODUuNjcxLjkyN2guMjE3di0yLjIxN2gyLjA2N3YxNC4zNTNjMCAxLjItLjI3MiAyLjE3NS0uODE2IDIuOTI2LS41MzguNzU3LTEuMjYzIDEuMzExLTIuMTc1IDEuNjYyLS45MDYuMzU3LTEuOTE1LjUzNi0zLjAyNy41MzZ6bS0uMDcyLTcuNjY3Yy44NTggMCAxLjU4My0uMTk3IDIuMTc1LS41OTEuNTkyLS4zOTMgMS4wNDItLjk2IDEuMzUtMS42OTguMzA4LS43MzkuNDYyLTEuNjIzLjQ2Mi0yLjY1MyAwLTEuMDA1LS4xNTEtMS44OTMtLjQ1My0yLjY2MnMtLjc0OS0xLjM3MS0xLjM0MS0xLjgwN2MtLjU5Mi0uNDM3LTEuMzIzLS42NTUtMi4xOTMtLjY1NS0uOTA2IDAtMS42NjEuMjMxLTIuMjY1LjY5MS0uNTk5LjQ2LTEuMDQ5IDEuMDc4LTEuMzUxIDEuODUzLS4yOTYuNzc1LS40NDQgMS42MzUtLjQ0NCAyLjU4IDAgLjk2OS4xNTEgMS44MjYuNDUzIDIuNTcxLjMwOC43MzkuNzYyIDEuMzIgMS4zNiAxLjc0NC42MDQuNDE4IDEuMzUzLjYyNyAyLjI0Ny42Mjd6IiBmaWxsPSIjZDYyNDI0Ii8+PHBhdGggZD0ibTE1NS40IDE3My43NjdjLTEuMzQxIDAtMi40OTgtLjI5Ni0zLjQ3LS44OS0uOTY3LS41OTktMS43MTMtMS40MzUtMi4yMzktMi41MDctLjUxOS0xLjA3OC0uNzc5LTIuMzMyLS43NzktMy43NjFzLjI2LTIuNjg5Ljc3OS0zLjc3OWMuNTI2LTEuMDk2IDEuMjU3LTEuOTUgMi4xOTMtMi41NjIuOTQzLS42MTggMi4wNDItLjkyNiAzLjI5OS0uOTI2LjcyNSAwIDEuNDQxLjEyMSAyLjE0Ny4zNjMuNzA3LjI0MiAxLjM1MS42MzYgMS45MzEgMS4xODEuNTguNTM5IDEuMDQyIDEuMjU0IDEuMzg2IDIuMTQ0cy41MTcgMS45ODYuNTE3IDMuMjg4di45MDloLTEwLjczdi0xLjg1M2g4LjU1NWMwLS43ODgtLjE1Ny0xLjQ5LS40NzEtMi4xMDgtLjMwOS0uNjE4LS43NS0xLjEwNS0xLjMyNC0xLjQ2My0uNTY3LS4zNTctMS4yMzgtLjUzNi0yLjAxMS0uNTM2LS44NTIgMC0xLjU4OS4yMTItMi4yMTEuNjM2LS42MTcuNDE4LTEuMDkxLjk2My0xLjQyMyAxLjYzNi0uMzMyLjY3Mi0uNDk4IDEuMzkyLS40OTggMi4xNjJ2MS4yMzVjMCAxLjA1NC4xODEgMS45NDcuNTQzIDIuNjguMzY5LjcyNy44NzkgMS4yODEgMS41MzIgMS42NjIuNjUyLjM3NiAxLjQxLjU2NCAyLjI3NC41NjQuNTYyIDAgMS4wNy0uMDc5IDEuNTIzLS4yMzcuNDU5LS4xNjMuODU0LS40MDUgMS4xODctLjcyNi4zMzItLjMyNy41ODktLjczMy43Ny0xLjIxOGwyLjA2Ni41ODJjLS4yMTcuNzAyLS41ODMgMS4zMi0xLjA5NiAxLjg1My0uNTE0LjUyNy0xLjE0OC45MzktMS45MDMgMS4yMzUtLjc1Ni4yOTEtMS42MDQuNDM2LTIuNTQ3LjQzNnoiIGZpbGw9IiNkNjI0MjQiLz48cGF0aCBkPSJtMTc3Ljc5MiAxNTkuNTIzdjEuODE3aC03LjUwM3YtMS44MTd6bS01LjI1NiAxMy45NTR2LTE1Ljg4YzAtLjc5OS4xODgtMS40NjUuNTYyLTEuOTk4LjM3NS0uNTMzLjg2MS0uOTMzIDEuNDU5LTEuMTk5LjU5OC0uMjY3IDEuMjMtLjQgMS44OTQtLjQuNTI2IDAgLjk1NS4wNDIgMS4yODcuMTI3cy41OC4xNjQuNzQzLjIzNmwtLjYxNiAxLjg1NGMtLjEwOS0uMDM3LS4yNi0uMDgyLS40NTMtLjEzNy0uMTg4LS4wNTQtLjQzNS0uMDgxLS43NDMtLjA4MS0uNzA3IDAtMS4yMTguMTc4LTEuNTMyLjUzNi0uMzA4LjM1Ny0uNDYyLjg4MS0uNDYyIDEuNTcxdjE1LjM3MXoiIGZpbGw9IiNkNjI0MjQiLz48cGF0aCBkPSJtMTgwLjc4OSAxNzMuNDc3di0xMy45NTRoMi4xMzl2MTMuOTU0em0xLjA4OC0xNi4yNzljLS40MTcgMC0uNzc2LS4xNDMtMS4wNzgtLjQyNy0uMjk2LS4yODUtLjQ0NC0uNjI3LS40NDQtMS4wMjdzLjE0OC0uNzQyLjQ0NC0xLjAyNmMuMzAyLS4yODUuNjYxLS40MjcgMS4wNzgtLjQyN3MuNzczLjE0MiAxLjA2OS40MjdjLjMwMi4yODQuNDUzLjYyNi40NTMgMS4wMjZzLS4xNTEuNzQyLS40NTMgMS4wMjdjLS4yOTYuMjg0LS42NTIuNDI3LTEuMDY5LjQyN3oiIGZpbGw9IiNkNjI0MjQiLz48cGF0aCBkPSJtMTg4Ljk4NCAxNTQuODcydjE4LjYwNWgtMi4xMzl2LTE4LjYwNXoiIGZpbGw9IiNkNjI0MjQiLz48cGF0aCBkPSJtMTk4LjczNyAxNzMuNzY3Yy0xLjM0MiAwLTIuNDk4LS4yOTYtMy40NzEtLjg5LS45NjctLjU5OS0xLjcxMy0xLjQzNS0yLjIzOC0yLjUwNy0uNTItMS4wNzgtLjc4LTIuMzMyLS43OC0zLjc2MXMuMjYtMi42ODkuNzgtMy43NzljLjUyNS0xLjA5NiAxLjI1Ni0xLjk1IDIuMTkzLTIuNTYyLjk0Mi0uNjE4IDIuMDQyLS45MjYgMy4yOTgtLjkyNi43MjUgMCAxLjQ0MS4xMjEgMi4xNDguMzYzczEuMzUuNjM2IDEuOTMgMS4xODFjLjU4LjUzOSAxLjA0MiAxLjI1NCAxLjM4NiAyLjE0NC4zNDUuODkuNTE3IDEuOTg2LjUxNyAzLjI4OHYuOTA5aC0xMC43Mjl2LTEuODUzaDguNTU0YzAtLjc4OC0uMTU3LTEuNDktLjQ3MS0yLjEwOC0uMzA4LS42MTgtLjc0OS0xLjEwNS0xLjMyMy0xLjQ2My0uNTY4LS4zNTctMS4yMzktLjUzNi0yLjAxMi0uNTM2LS44NTIgMC0xLjU4OS4yMTItMi4yMTEuNjM2LS42MTYuNDE4LTEuMDkuOTYzLTEuNDIzIDEuNjM2LS4zMzIuNjcyLS40OTggMS4zOTItLjQ5OCAyLjE2MnYxLjIzNWMwIDEuMDU0LjE4MSAxLjk0Ny41NDQgMi42OC4zNjguNzI3Ljg3OSAxLjI4MSAxLjUzMSAxLjY2Mi42NTMuMzc2IDEuNDExLjU2NCAyLjI3NS41NjQuNTYxIDAgMS4wNjktLjA3OSAxLjUyMi0uMjM3LjQ1OS0uMTYzLjg1NS0uNDA1IDEuMTg3LS43MjYuMzMyLS4zMjcuNTg5LS43MzMuNzctMS4yMThsMi4wNjcuNTgyYy0uMjE4LjcwMi0uNTgzIDEuMzItMS4wOTcgMS44NTMtLjUxMy41MjctMS4xNDguOTM5LTEuOTAzIDEuMjM1LS43NTUuMjkxLTEuNjA0LjQzNi0yLjU0Ni40MzZ6IiBmaWxsPSIjZDYyNDI0Ii8+PC9zdmc+";

export default BrowseTab;
