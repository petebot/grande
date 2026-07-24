import { Box, Button, Dialog, Flex, Stack, Text } from '@sanity/ui'
import EmojiPicker, { EmojiStyle, Theme, type EmojiClickData } from 'emoji-picker-react'
import { useCallback, useId, useState } from 'react'
import { set, unset, type StringInputProps } from 'sanity'

export function EmojiInput(props: StringInputProps) {
  const { onChange, readOnly, value } = props
  const dialogId = useId()
  const [pickerOpen, setPickerOpen] = useState(false)

  const chooseEmoji = useCallback(
    (selection: EmojiClickData) => {
      onChange(set(selection.emoji))
      setPickerOpen(false)
    },
    [onChange],
  )

  const clearEmoji = useCallback(() => {
    onChange(unset())
    setPickerOpen(false)
  }, [onChange])

  const picker = (
    <Box style={{ margin: '0 auto', maxWidth: '350px' }}>
      <EmojiPicker
        autoFocusSearch
        emojiStyle={EmojiStyle.NATIVE}
        height={420}
        lazyLoadEmojis
        onEmojiClick={chooseEmoji}
        previewConfig={{ showPreview: false }}
        searchPlaceholder="Search emoji"
        theme={Theme.AUTO}
        width="100%"
      />
    </Box>
  )

  return (
    <Stack space={3}>
      <Flex align="center" gap={2} wrap="wrap">
        <Button
          aria-controls={dialogId}
          aria-expanded={pickerOpen}
          aria-haspopup="dialog"
          disabled={readOnly}
          mode="ghost"
          onClick={() => setPickerOpen(true)}
          text={value ? `${value} Change emoji` : 'Choose emoji'}
          type="button"
        />
        {value ? (
          <Button
            disabled={readOnly}
            mode="bleed"
            onClick={clearEmoji}
            text="Clear emoji"
            tone="critical"
            type="button"
          />
        ) : null}
      </Flex>
      <Text muted size={1}>
        {value
          ? `Selected emoji: ${value}`
          : 'Optional. The emoji appears before the menu item name.'}
      </Text>
      {pickerOpen ? (
        <Dialog
          header="Choose menu emoji"
          id={dialogId}
          onClickOutside={() => setPickerOpen(false)}
          onClose={() => setPickerOpen(false)}
          width={1}
        >
          <Box padding={3}>{picker}</Box>
        </Dialog>
      ) : null}
    </Stack>
  )
}
