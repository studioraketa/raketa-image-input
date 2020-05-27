import React from 'react'
import styled from 'styled-components'
import { Title, Button } from 'raketa-ui'

import Dropzone from 'react-dropzone'

const StyledDropzone = styled.div`
  position: relative;
  margin-bottom: 16px;
  height: 350px;
  color: #666;
  background-color: #efefef;
  border: 2px dashed #ddd;
`

const DropzoneLabel = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 16px;
`

const Dropbox = ({ buttonLabel, onDrop }) => {
  const dropzoneRef = React.createRef()

  const handleOpen = () => dropzoneRef.current.open()

  return (
    <div>
      <StyledDropzone>
        <Dropzone ref={dropzoneRef} onDrop={onDrop}>
          {({ getRootProps, getInputProps }) => (
            <DropzoneLabel {...getRootProps()}>
              <Title third>Select files from your computer</Title>
              <small>or drag and drop here</small>
              <input {...getInputProps()} />
            </DropzoneLabel>
          )}
        </Dropzone>
      </StyledDropzone>

      <Button type='button' success onClick={handleOpen}>
        {buttonLabel}
      </Button>
    </div>
  )
}

Dropbox.defaultProps = { buttonLabel: 'Select files...' }

export default Dropbox
