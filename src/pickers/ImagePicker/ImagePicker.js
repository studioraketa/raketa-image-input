import React from 'react'
import styled from 'styled-components'

import Img from '../../lib/Image'
import Dialog from '../../dialogs/Dialog'
import BrowseTab from './BrowseTab'
import UploadTab from './UploadTab'

import { FormGroup, Label, Button, Tabs } from '@raketa-cms/raketa-mir'

import { removeById } from '../../lists'
import MediaManagerContext from '../../MediaManagerContext'

const ImageWrapper = styled.div`
  margin-right: 16px;

  & > img {
    object-fit: contain;
    width: 100px;
    height: 100px;
    background-color: #ddd;
  }
`

const ImageControl = styled.div`
  display: flex;
  margin-bottom: 16px;
`

const ImagePicker = ({ mediaManager: mediaManagerProps, label = 'Image', value, onChange }) => {
  const mediaManager = mediaManagerProps || React.useContext(MediaManagerContext);

  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState({
    selectedImage: value || false,
    filesToUpload: 0,
    filesUploaded: 0,
    images: [],
    files: [],
    q: ''
  });

  const fetchData = (q, callback) => {
    const params = q !== '' ? { f: { name: q } } : {}

    // TODO: Use async/await
    mediaManager.findAll((images) => {
      setState({ ...state, images })
      if (callback) callback();
    }, params)
  }

  const handleOpenPicker = () => {
    const { q } = state;

    fetchData(q, () => {
      setOpen(true);
    })
  }

  const notifyChange = () => {
    if (onChange) onChange(state.selectedImage);
  }

  const handleClearImage = () => {
    setState({ ...state, selectedImage: false });
    notifyChange();
  }

  const handleSelectImage = () => {
    setOpen(false);
    notifyChange();
  }

  const handleSearch = (q) => {
    fetchData(q);
  }

  const handleSearchTermUpdate = (q) => {
    setState({ ...state, q });
  }

  const handleSearchClear = () => {
    setState({ ...state, q: '' });
    fetchData('');
  }

  const handleFastSelect = (selectedImage) => {
    setState({ ...state, selectedImage });
    setOpen(false);
    notifyChange();
  }

  const handleDeleteImage = (image) => {
    if (!confirm('Are you sure? ')) return;

    const { images } = state

    mediaManager.destroy(image, (deletedImage) => {
      setState({ ...state, images: removeById(images, deletedImage.id) });
    })
  }

  // TODO: Do we need this?
  const handleEditImage = (image) => {
    setState({
      ...state,
      imageDialogOpen: true,
      editImage: image,
      alt: image.alt || ''
    });
  }

  const handleUpload = (files) => {
    setState({ ...state, filesToUpload: files.length, filesUploaded: 0, files: [] });

    // TODO: Rework this
    files.forEach((file) => {
      mediaManager.uploadFile(file, (response) => {
        const { files, q } = state

        setState({
          ...state,
          filesUploaded: state.filesUploaded + 1,
          files: [...files, response]
        });

        // TODO: Do we need this?
        if (state.filesToUpload === state.filesUploaded) {
          fetchData(q);
        }
      })
    });
  }

  const {
    filesToUpload,
    filesUploaded,
    images,
    selectedImage,
    files,
    q
  } = state

  return (
    <div>
      <ImageControl>
        {selectedImage && (
          <ImageWrapper>
            <Img
              src={selectedImage}
              variant='thumb'
              title={selectedImage.name}
            />
          </ImageWrapper>
        )}

        <FormGroup>
          <Label>{`${label} ${selectedImage.alt ? `(${selectedImage.alt})` : ''
            }`}</Label>
          <Button
            type='button'
            variant='secondary'
            onClick={handleOpenPicker}
          >
            Browse...
          </Button>
          <Button
            type='button'
            variant='secondary'
            onClick={handleClearImage}
          >
            Clear
          </Button>
        </FormGroup>
      </ImageControl>

      {open && (
        <Dialog
          open
          onClose={() => setOpen(false)}
          title='Image Browser'
          primaryLabel='Select'
          onPrimary={handleSelectImage}
        >
          <Tabs>
            <div title='Browse'>
              <BrowseTab
                images={images}
                selectedImage={selectedImage}
                q={q}
                onSearch={() => handleSearch(q)}
                onSearchTermChange={handleSearchTermUpdate}
                onSearchClear={handleSearchClear}
                onSelect={(selectedImage) => setState({ ...state, selectedImage })}
                onFastSelect={handleFastSelect}
                onDelete={handleDeleteImage}
                onEdit={handleEditImage}
              />
            </div>
            <div title='Upload'>
              <UploadTab
                filesToUpload={filesToUpload}
                filesUploaded={filesUploaded}
                files={files}
                onUpload={handleUpload}
              />
            </div>
          </Tabs>
        </Dialog>
      )}

      {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
    </div>
  )
}

export default ImagePicker
