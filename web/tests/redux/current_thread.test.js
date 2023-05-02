import { createStore } from '../../redux/store' 
import { initialState, grabMessage } from '../../redux/current_thread'

let store = {}

const getState = () => store.getState().currentThread

beforeEach(() => {
  store = createStore()
})

describe('message grabbing', () => {
  test('placeholder', () => {})
})
