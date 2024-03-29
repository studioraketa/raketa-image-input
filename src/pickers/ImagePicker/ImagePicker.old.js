import React from 'react'
import PropTypes from 'prop-types'
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

const withMediaManager = (Component) => (props) => {
  return (
    <MediaManagerContext.Consumer>
      {(mediaManager) => <Component mediaManager={mediaManager} {...props} />}
    </MediaManagerContext.Consumer>
  )
}

class ImagePicker extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      pickerOpen: false,
      selectedImage: props.value || false,
      filesToUpload: 0,
      filesUploaded: 0,
      images: [],
      files: [],
      q: ''
    }

    this.mediaManager = props.mediaManager || context.mediaManager
  }

  fetchData(q, callback) {
    const params = q !== '' ? { f: { name: q } } : {}

    this.mediaManager.findAll((images) => {
      this.setState({ images }, () => callback())
    }, params)
  }

  handleUpload(files) {
    this.setState(
      { filesToUpload: files.length, filesUploaded: 0, files: [] },
      () => {
        files.forEach((file) => {
          this.mediaManager.uploadFile(file, (response) => {
            const { files, q } = this.state

            this.setState(
              {
                filesUploaded: this.state.filesUploaded + 1,
                files: [...files, response]
              },
              () => {
                if (this.state.filesToUpload === this.state.filesUploaded) {
                  this.fetchData(q, () => {
                    // Upload complete
                  })
                }
              }
            )
          })
        })
      }
    )
  }

  handleOpenPicker() {
    const { q } = this.state

    this.fetchData(q, () => {
      this.setState({ pickerOpen: true })
    })
  }

  handleSelectImage() {
    this.setState({ pickerOpen: false }, () => {
      if (this.props.onChange) this.props.onChange(this.state.selectedImage)
    })
  }

  handleClearImage() {
    this.setState({ selectedImage: false }, () => {
      if (this.props.onChange) this.props.onChange(this.state.selectedImage)
    })
  }

  handleFastSelect(image) {
    this.setState({ selectedImage: image, pickerOpen: false }, () => {
      if (this.props.onChange) this.props.onChange(this.state.selectedImage)
    })
  }

  handleDeleteImage(image) {
    if (!confirm('Are you sure? ')) return

    const { images } = this.state

    this.mediaManager.destroy(image, (deletedImage) => {
      this.setState({ images: removeById(images, deletedImage.id) })
    })
  }

  handleSearch(q) {
    this.fetchData(q, () => { })
  }

  handleSearchTermUpdate(q) {
    this.setState({ q })
  }

  handleSearchClear() {
    this.setState({ q: '' }, () => this.fetchData('', () => { }))
  }

  handleEditImage(image) {
    this.setState({
      imageDialogOpen: true,
      editImage: image,
      alt: image.alt || ''
    })
  }

  handleUpdateImage(editImage) {
    const { alt, images, selectedImage } = this.state

    // optimistic update
    if (images.length > 0) {
      const imageIdx = images.findIndex(
        (currentImage) => currentImage.id === editImage.id
      )

      const newImages = [
        ...images.slice(0, imageIdx),
        Object.assign({}, images[imageIdx], { alt }),
        ...images.slice(imageIdx + 1)
      ]

      this.setState({ images: newImages })
    }

    if (parseInt(selectedImage.id, 10) === parseInt(editImage.id, 10)) {
      this.setState(
        { selectedImage: Object.assign({}, selectedImage, { alt }) },
        () => {
          if (this.props.onChange) this.props.onChange(this.state.selectedImage)
        }
      )
    }

    const self = this
    this.mediaManager.update(editImage, { alt }, () => {
      self.setState({ imageDialogOpen: false })
    })
  }

  render() {
    const { label = 'Image' } = this.props
    const {
      pickerOpen,
      filesToUpload,
      filesUploaded,
      images,
      selectedImage,
      files,
      q
    } = this.state

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
              onClick={() => this.handleOpenPicker()}
            >
              Browse...
            </Button>
            <Button
              type='button'
              variant='secondary'
              onClick={() => this.handleClearImage()}
            >
              Clear
            </Button>
          </FormGroup>
        </ImageControl>

        {pickerOpen && (
          <Dialog
            open={pickerOpen}
            onClose={() => this.setState({ pickerOpen: false })}
            title='Image Browser'
            primaryLabel='Select'
            onPrimary={() => this.handleSelectImage()}
          >
            <Tabs>
              <div title='Browse'>
                <BrowseTab
                  images={images}
                  selectedImage={selectedImage}
                  q={q}
                  onSearch={() => this.handleSearch(q)}
                  onSearchTermChange={(term) =>
                    this.handleSearchTermUpdate(term)
                  }
                  onSearchClear={() => this.handleSearchClear()}
                  onSelect={(image) => this.setState({ selectedImage: image })}
                  onFastSelect={(image) => this.handleFastSelect(image)}
                  onDelete={(image) => this.handleDeleteImage(image)}
                  onEdit={(image) => this.handleEditImage(image)}
                />
              </div>
              <div title='Upload'>
                <UploadTab
                  filesToUpload={filesToUpload}
                  filesUploaded={filesUploaded}
                  files={files}
                  onUpload={(filesOnUpload) => this.handleUpload(filesOnUpload)}
                />
              </div>
            </Tabs>
          </Dialog>
        )}
      </div>
    )
  }
}

ImagePicker.contextTypes = {
  host: PropTypes.string,
  mediaManager: PropTypes.object
}

export default withMediaManager(ImagePicker)
