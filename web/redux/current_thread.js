
import { createSlice } from '@reduxjs/toolkit'

export const initialState = {
  shownMessages: [
    {
      previous: null,
      id: 'Ks_46clmQHSH_VG4RSiVOg',
      role: 'user',
      content: 'Hello!',
      status: 'done'
    },
    {
      previous: 'Ks_46clmQHSH_VG4RSiVOg',
      id: 'bxi-qv_fS2WlX9fqaiNWUQ',
      role: 'assistant',
      content: 'Hello there! How can I assist you today?',
      status: 'done'
    },
    {
      previous: 'bxi-qv_fS2WlX9fqaiNWUQ',
      id: 'D8tRVuNsRSyYi6ENLWVtoQ',
      role: 'user',
      content: 'Generate me a hello world program, please.',
      status: 'done'
    },
    {
      previous: 'D8tRVuNsRSyYi6ENLWVtoQ',
      id: 'zYgED-plQsCB04ji1bGlog',
      role: 'assistant',
      content: 'Sure, here is a sample Hello World program in Python:\n\n```\nprint("Hello, World!")\n```\n\nFeel free to copy and paste this code into a Python IDE or editor of your choice and run it to see the output.',
      status: 'done'
    },
    {
      previous: 'zYgED-plQsCB04ji1bGlog',
      id: 'pACIgc3pTtC9vDGVew5BmQ',
      role: 'user',
      content: 'Could you write one in C?',
      status: 'done'
    },
    {
      previous: 'pACIgc3pTtC9vDGVew5BmQ',
      id: 'SQyigiY2Tpupk8Hrquenzw',
      role: 'assistant',
      content: 'Yes, here is a sample Hello World program written in C:\n\n```\n#include <stdio.h>\n\nint main()\n{\n    printf("Hello, World!");\n    return 0;\n}\n```\n\nThis program uses the `stdio.h` library for input/output operations and the `printf()` function to print the string "Hello, World!". To run this program, you will need to compile it using a C compiler, such as GCC or Clang.',
      status: 'done'
    },
    {
      previous: 'SQyigiY2Tpupk8Hrquenzw',
      id: 'gy6USjjwT86pNi7RmDMxGw',
      role: 'user',
      content: 'Thank you.',
      status: 'done'
    },
    {
      previous: 'gy6USjjwT86pNi7RmDMxGw',
      id: 'Za-Rw3GmQVa-z6urtkKZlg',
      role: 'assistant',
      content: 'You\'re welcome! Let me know if you need help with anything else.',
      status: 'done'
    },
  ],
  allMessages: {
    'Ks_46clmQHSH_VG4RSiVOg': {
      previous: null,
      id: 'Ks_46clmQHSH_VG4RSiVOg',
      role: 'user',
      content: 'Hello!',
      status: 'done'
    },
    'bxi-qv_fS2WlX9fqaiNWUQ': {
      previous: 'Ks_46clmQHSH_VG4RSiVOg',
      id: 'bxi-qv_fS2WlX9fqaiNWUQ',
      role: 'assistant',
      content: 'Hello there! How can I assist you today?',
      status: 'done'
    },
    'D8tRVuNsRSyYi6ENLWVtoQ': {
      previous: 'bxi-qv_fS2WlX9fqaiNWUQ',
      id: 'D8tRVuNsRSyYi6ENLWVtoQ',
      role: 'user',
      content: 'Generate me a hello world program, please.',
      status: 'done'
    },
    'zYgED-plQsCB04ji1bGlog': {
      previous: 'D8tRVuNsRSyYi6ENLWVtoQ',
      id: 'zYgED-plQsCB04ji1bGlog',
      role: 'assistant',
      content: 'Sure, here is a sample Hello World program in Python:\n\n```\nprint("Hello, World!")\n```\n\nFeel free to copy and paste this code into a Python IDE or editor of your choice and run it to see the output.',
      status: 'done'
    },
    'pACIgc3pTtC9vDGVew5BmQ': {
      previous: 'zYgED-plQsCB04ji1bGlog',
      id: 'pACIgc3pTtC9vDGVew5BmQ',
      role: 'user',
      content: 'Could you write one in C?',
      status: 'done'
    },
    'SQyigiY2Tpupk8Hrquenzw': {
      previous: 'pACIgc3pTtC9vDGVew5BmQ',
      id: 'SQyigiY2Tpupk8Hrquenzw',
      role: 'assistant',
      content: 'Yes, here is a sample Hello World program written in C:\n\n```\n#include <stdio.h>\n\nint main()\n{\n    printf("Hello, World!");\n    return 0;\n}\n```\n\nThis program uses the `stdio.h` library for input/output operations and the `printf()` function to print the string "Hello, World!". To run this program, you will need to compile it using a C compiler, such as GCC or Clang.',
      status: 'done'
    },
    'gy6USjjwT86pNi7RmDMxGw': {
      previous: 'SQyigiY2Tpupk8Hrquenzw',
      id: 'gy6USjjwT86pNi7RmDMxGw',
      role: 'user',
      content: 'Thank you.',
      status: 'done'
    },
    'Za-Rw3GmQVa-z6urtkKZlg': {
      previous: 'gy6USjjwT86pNi7RmDMxGw',
      id: 'Za-Rw3GmQVa-z6urtkKZlg',
      role: 'assistant',
      content: 'You\'re welcome! Let me know if you need help with anything else.',
      status: 'done'
    },
  },
  branches: {
    'zVAsHPNMQdGP-AXR6q8ABw': {
      id: 'zVAsHPNMQdGP-AXR6q8ABw',
      start: 'Ks_46clmQHSH_VG4RSiVOg',
      end: 'Za-Rw3GmQVa-z6urtkKZlg',
    },
  },
  currentBranch: 'zVAsHPNMQdGP-AXR6q8ABw',
  grabbedMessages: [],
}

export const currentThreadSlice  = createSlice({
  name: 'currentThread',
  initialState,
  reducers: {
    grabMessage: (state, { payload }) => {
      const { messageId } = payload
      if (!(messageId in state.allMessages)) {
        throw 'message id doesnt exist'
      }

      const endId = state.allMessages[messageId].previous || null

      const grabbedMessages = []
      let currentMessageId = state.branches[state.currentBranch].end
      do {
        const message = state.allMessages[currentMessageId]
        grabbedMessages.push(message)
        currentMessageId = message.previous
      } while (currentMessageId && currentMessageId !== endId);
      grabbedMessages.reverse()
      state.grabbedMessages = grabbedMessages

      currentMessageId = endId
      const shownMessages = []
      while (currentMessageId) {
        const message = state.allMessages[currentMessageId]
        shownMessages.push(message)
        currentMessageId = message.previous
      }
      shownMessages.reverse()
      state.shownMessages = shownMessages
    }
  },
  extraReducers: (builder) => { },
})

export const {
  grabMessage,
} = currentThreadSlice.actions

export default currentThreadSlice.reducer

