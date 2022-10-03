const DEFAULT_STATE = {
  type: undefined,
  data: undefined,
};

const dataReducer = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case "MASTER":
      return { ...state, data: action.payload };
    default:
      return state;
  }
};

export default dataReducer;
