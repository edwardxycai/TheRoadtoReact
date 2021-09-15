import logo from './logo.svg';
import './App.css';
import React from 'react';
import axios from 'axios';

const initialStories = [
  {
    title: 'React',
    url: 'https://reactjs.org',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1
  },
];

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  )

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORIES':
      return {
        ...state,
        data: state.data.filter(
          story => action.payload.objectID !== story.objectID
        )
      };
    default:
      return new Error();
  }
};

// const getAsyncStories = () => 
//   new Promise(resolve => 
//     setTimeout(
//       () => resolve({ data: { stories: initialStories } }),
//       2000
//     )
//   );

// const getAsyncStories = () =>
//   new Promise((resolve, reject) => setTimeout(reject, 2000));

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

function App() {
  const [searchTerm, setSearchTerm] = useSemiPersistentState(
    'search',
    'React'
  );

  // const [stories, setStories] = React.useState([]);
  // const [isLoading, setIsLoading] = React.useState(false);

  const [url, setUrl] = React.useState(
    `${API_ENDPOINT}${searchTerm}`
  );

  const handleSearchInput = event => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
  };

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );

  const handleFetchStories = React.useCallback(() => {
    if (!searchTerm) return;

    // setIsLoading(true);
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    axios.
      get(url)
      // .then(response => response.json())
      .then(result => {
      // setStories(result.data.stories);
        dispatchStories({
          type: 'STORIES_FETCH_SUCCESS',
          payload: result.data.hits
        });
      // setIsLoading(false);
      })
      .catch(() =>
        dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
      );
  }, [url]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = (item) => {
    // const newStories = stories.filter(
    //   story => item.objectID !== story.objectID
    // );

    // setStories(newStories);
    dispatchStories({
      type: 'REMOVE_STORIES',
      payload: item
    });
  }

  // const searchedStories = stories.data.filter(story =>
  //   story.title.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  return (
    <div>
      <h1>My Hacker Stories</h1>

      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearchInput}
      >
        <strong>Search:</strong>
      </InputWithLabel>

      <button
        type="button"
        disabled={!searchTerm}
        onClick={handleSearchSubmit}
      >
        Submit
      </button>

      <hr />

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading...</p>
      ) : (
          <List
            list={stories.data}
            onRemoveItem={handleRemoveStory}
          />
        )}
    </div>
  );
};

const InputWithLabel = ({
  id,
  value,
  type = "text",
  onInputChange,
  isFocused,
  children,
}) => {

  const inputRef = React.useRef();

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id}>{children}</label>
      &nbsp;
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
      />
    </>
  )
};

const List = ({ list, onRemoveItem }) =>
  list.map(item =>
    <Item
      key={item.objectID}
      item={item}
      onRemoveItem={onRemoveItem}
    />
  );

const Item = ({ item, onRemoveItem }) => {
  //   const handleRemoveItem = () => {
  //     onRemoveItem(item);
  //   }

  return (
    <div>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        <button type="button" onClick={() => onRemoveItem(item)}>
          Dismiss
        </button>
      </span>
    </div>
  );
};

export default App;