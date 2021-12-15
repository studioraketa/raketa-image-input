import React from 'react'
import styled from 'styled-components'

import { reset, buttonReset, Button, Stack } from '@raketa-cms/raketa-mir'

import Img from '../../lib/Image'
import TextInput from '../../forms/TextInput'

const IconEdit = () => (
  <img
    style={{ width: '12px', margin: '0 auto' }}
    src='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyMnB4IiBoZWlnaHQ9IjIycHgiIHZpZXdCb3g9IjAgMCAyMiAyMiIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4gICAgICAgIDx0aXRsZT5lZGl0LTI8L3RpdGxlPiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4gICAgPGRlZnM+PC9kZWZzPiAgICA8ZyBpZD0iZWRpdC0yIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPiAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMi4wMDAwMDAsIDIuMDAwMDAwKSIgaWQ9IlNoYXBlIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiI+ICAgICAgICAgICAgPHBvbHlnb24gcG9pbnRzPSIxMyAwIDE4IDUgNSAxOCAwIDE4IDAgMTMiPjwvcG9seWdvbj4gICAgICAgIDwvZz4gICAgPC9nPjwvc3ZnPg=='
  />
)

const ImageList = styled.div`
  ${reset};
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  margin-top: 1em;
  min-height: 500px;
`

const Thumb = styled.div`
  ${reset};
  position: relative;
  cursor: pointer;
  width: 116px;
  height: 116px;
  border: 8px solid
    ${(props) => (props.selected ? props.theme.colors.success : 'transparent')};

  button {
    display: none;
  }

  &:hover {
    button {
      display: inline-block;
    }
  }
`

const ImageWrapper = styled.div`
  ${reset};
  width: 100px;
  height: 100px;
  background-color: ${(props) => props.theme.colors.lighterGray};

  & > img {
    width: 100%;
  }
`

const EditButton = styled.button`
  ${reset}
  ${buttonReset}
  position: absolute;
  bottom: 8px;
  left: 12px;
  background-color: ${(props) => props.theme.colors.success};
  font-size: 0.85em;
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
`

const DeleteButton = styled.button`
  ${reset}
  ${buttonReset}
  position: absolute;
  bottom: 8px;
  right: 12px;
  background-color: ${(props) => props.theme.colors.danger};
  font-size: 1em;
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  line-height: 19px;
`

const ImageItem = ({
  image,
  selected,
  onSelect,
  onFastSelect,
  onDelete,
  onEdit
}) => (
  <Thumb
    selected={selected ? 'selected' : ''}
    onClick={() => onSelect(image)}
    onDoubleClick={() => onFastSelect(image)}
  >
    <ImageWrapper title={image.name}>
      <Img src={image} variant='thumb' title={image && image.name} />
    </ImageWrapper>

    <EditButton
      type='button'
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onEdit(image)
      }}
    >
      <IconEdit />
    </EditButton>

    <DeleteButton
      type='button'
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onDelete(image)
      }}
    >
      &times;
    </DeleteButton>
  </Thumb>
)

const BrowseTab = ({
  images,
  q,
  selectedImage: initialImage,
  onFastSelect,
  onSelect,
  onDelete,
  onSearch,
  onSearchTermChange,
  onSearchClear,
  onEdit
}) => {
  const [selectedImage, setSelectedImage] = React.useState(initialImage)

  const handleSelectImage = (newSelected) => {
    setSelectedImage(newSelected)
    onSelect(newSelected)
  }

  return (
    <React.Fragment>
      <Stack v='center' h='flex-start' g='1em'>
        <TextInput
          label='Search images'
          value={q}
          onChange={(term) => onSearchTermChange(term)}
        />

        <Button type='button' variant='primary' onClick={() => onSearch()}>
          Search
        </Button>

        <Button
          type='button'
          variant='secondary'
          onClick={() => onSearchClear()}
        >
          Clear
        </Button>
      </Stack>

      <ImageList>
        {images.map((image) => (
          <ImageItem
            key={image.id}
            image={image}
            selected={selectedImage.id === image.id}
            onSelect={(onSelectedImage) => handleSelectImage(onSelectedImage)}
            onFastSelect={onFastSelect}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </ImageList>
    </React.Fragment>
  )
}

export default BrowseTab
