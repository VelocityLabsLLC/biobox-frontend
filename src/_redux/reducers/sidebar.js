const DEFAULT_STATE = {
  type: undefined,
  sidebarShow: "responsive",
};

const sidebarReducer = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case "set":
      return { ...state, sidebarShow: action.payload };
    default:
      return state;
  }
};

export default sidebarReducer;
