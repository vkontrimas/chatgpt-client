import { createStore } from '../../redux/store' 
import { initialState, grabMessage } from '../../redux/current_thread'

let store = {}

const getState = () => store.getState().currentThread

beforeEach(() => {
  store = createStore()
})

describe('message grabbing', () => {
  test('grabbed messages start empty', () => {
    expect(getState().grabbedMessages).toMatchObject([])
  })

  test('throws if id doesnt exist', () => {
    expect(() => {
      store.dispatch(grabMessage({ messageId: 'fakeid' }))
    }).toThrow()
  })

  test('grabbing sets grabbedMessages', () => {
    store.dispatch(grabMessage({ messageId: 'SQyigiY2Tpupk8Hrquenzw' }))
    expect(getState().grabbedMessages).toMatchObject([
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
    ])
  })
})
