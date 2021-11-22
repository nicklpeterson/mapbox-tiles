import { configureStore } from '@reduxjs/toolkit'
import thunkMiddleware from 'redux-thunk'
import loggerMiddleware from './middleware/logger'
import formReducer from "./formSlice"

export const store = configureStore({
    reducer: {
        form: formReducer
    },
    middleware: [thunkMiddleware, loggerMiddleware],
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
