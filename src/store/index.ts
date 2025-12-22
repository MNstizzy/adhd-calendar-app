import { createStore } from 'redux';
import { Provider } from 'react-redux';

// Define initial state
const initialState = {
    tasks: [],
    events: [],
    preferences: {},
};

// Define action types
const ADD_TASK = 'ADD_TASK';
const REMOVE_TASK = 'REMOVE_TASK';
const ADD_EVENT = 'ADD_EVENT';
const REMOVE_EVENT = 'REMOVE_EVENT';
const UPDATE_PREFERENCES = 'UPDATE_PREFERENCES';

// Define action creators
export const addTask = (task) => ({ type: ADD_TASK, payload: task });
export const removeTask = (taskId) => ({ type: REMOVE_TASK, payload: taskId });
export const addEvent = (event) => ({ type: ADD_EVENT, payload: event });
export const removeEvent = (eventId) => ({ type: REMOVE_EVENT, payload: eventId });
export const updatePreferences = (preferences) => ({ type: UPDATE_PREFERENCES, payload: preferences });

// Define reducer
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_TASK:
            return { ...state, tasks: [...state.tasks, action.payload] };
        case REMOVE_TASK:
            return { ...state, tasks: state.tasks.filter(task => task.id !== action.payload) };
        case ADD_EVENT:
            return { ...state, events: [...state.events, action.payload] };
        case REMOVE_EVENT:
            return { ...state, events: state.events.filter(event => event.id !== action.payload) };
        case UPDATE_PREFERENCES:
            return { ...state, preferences: { ...state.preferences, ...action.payload } };
        default:
            return state;
    }
};

// Create store
const store = createStore(reducer);

// Export provider
export const StoreProvider = ({ children }) => (
    <Provider store={store}>
        {children}
    </Provider>
);